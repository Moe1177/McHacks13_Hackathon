import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Contact extracted from Gumloop results
interface ExtractedContact {
  email: string;
  company: string;
}

// Campaign document structure
interface Campaign {
  _id?: ObjectId;
  userId: string;
  name: string;
  sector: string;
  numberOfCompanies: number;
  status: "pending" | "running" | "completed" | "failed";
  gumloopRunId: string | null;
  contacts: ExtractedContact[] | null;
  createdAt: Date;
  updatedAt: Date;
}

// Request body type
interface CreateCampaignRequest {
  name: string;
  sector: string;
  numberOfCompanies?: number;
}

// Helper: Start Gumloop pipeline
async function startGumloopPipeline(sector: string, numberOfCompanies: number) {
  const apiKey = process.env.GUMLOOP_API_KEY;
  const userId = process.env.GUMLOOP_USER_ID;
  const pipelineId = process.env.GUMLOOP_PIPELINE_ID;

  const response = await fetch(
    `https://api.gumloop.com/api/v1/start_pipeline?user_id=${userId}&saved_item_id=${pipelineId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        interest_or_sector: sector,
        number_of_companies: String(numberOfCompanies),
      }),
    }
  );

  return response.json();
}

// Helper: Check Gumloop run status
async function checkGumloopStatus(runId: string) {
  const apiKey = process.env.GUMLOOP_API_KEY;
  const userId = process.env.GUMLOOP_USER_ID;

  const response = await fetch(
    `https://api.gumloop.com/api/v1/get_pl_run?run_id=${runId}&user_id=${userId}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    }
  );

  return response.json();
}

// Helper: Extract company name from email domain
function extractCompanyFromEmail(email: string): string {
  const domain = email.split("@")[1];
  if (!domain) return "Unknown";
  // Remove TLD (.com, .io, etc.) and return company name
  const parts = domain.split(".");
  // Handle cases like "company.co.uk" - take the first part
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
}

// Helper: Process Gumloop results into contacts array
function processGumloopResults(results: any): ExtractedContact[] {
  if (!results?.extracted_emails || !Array.isArray(results.extracted_emails)) {
    return [];
  }

  // Filter empty strings, deduplicate, and transform to contacts
  const filtered = results.extracted_emails.filter(
    (email: string) => email && email.trim() !== ""
  ) as string[];
  const uniqueEmails = [...new Set(filtered)];

  return uniqueEmails.map((email) => ({
    email,
    company: extractCompanyFromEmail(email),
  }));
}

// Helper: Poll for completion (runs in background)
async function pollForCompletion(campaignId: ObjectId, runId: string) {
  const client = await clientPromise;
  const db = client.db();
  const campaigns = db.collection<Campaign>("campaigns");

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  console.log(`[Campaign ${campaignId}] Starting to poll for run ${runId}`);

  while (true) {
    try {
      const status = await checkGumloopStatus(runId);
      console.log(`[Campaign ${campaignId}] Status: ${status.state}`);

      if (status.state === "DONE") {
        // Process results into contacts with email + company
        const contacts = processGumloopResults(status.outputs);

        await campaigns.updateOne(
          { _id: campaignId },
          {
            $set: {
              status: "completed",
              contacts,
              updatedAt: new Date(),
            },
          }
        );
        console.log(`[Campaign ${campaignId}] Completed!`);
        console.log(`[Campaign ${campaignId}] Found ${contacts.length} contacts:`, JSON.stringify(contacts, null, 2));
        break;
      }

      if (status.state === "FAILED" || status.state === "TERMINATED") {
        await campaigns.updateOne(
          { _id: campaignId },
          {
            $set: {
              status: "failed",
              updatedAt: new Date(),
            },
          }
        );
        console.log(`[Campaign ${campaignId}] Failed with state: ${status.state}`);
        break;
      }

      // Still running, wait 5 seconds before polling again
      await sleep(5000);
    } catch (error) {
      console.error(`[Campaign ${campaignId}] Polling error:`, error);
      await sleep(5000);
    }
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: Request) {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body: CreateCampaignRequest = await request.json();

    // 3. Validate
    if (!body.name || !body.sector) {
      return NextResponse.json(
        { error: "Must provide name and sector" },
        { status: 400 }
      );
    }

    // 4. Connect to MongoDB
    const client = await clientPromise;
    const db = client.db();
    const campaigns = db.collection<Campaign>("campaigns");

    // 5. Create campaign document (status: pending)
    const campaign: Campaign = {
      userId,
      name: body.name,
      sector: body.sector,
      numberOfCompanies: body.numberOfCompanies || 1,
      status: "pending",
      gumloopRunId: null,
      contacts: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await campaigns.insertOne(campaign);
    const campaignId = insertResult.insertedId;

    console.log(`[Campaign ${campaignId}] Created in MongoDB`);

    // 5. Start Gumloop pipeline
    const gumloopResponse = await startGumloopPipeline(
      body.sector,
      body.numberOfCompanies || 1
    );

    if (!gumloopResponse.run_id) {
      // Gumloop failed to start
      await campaigns.updateOne(
        { _id: campaignId },
        { $set: { status: "failed", updatedAt: new Date() } }
      );
      return NextResponse.json(
        { error: "Failed to start Gumloop pipeline", details: gumloopResponse },
        { status: 500 }
      );
    }

    // 6. Update campaign with run_id (status: running)
    await campaigns.updateOne(
      { _id: campaignId },
      {
        $set: {
          gumloopRunId: gumloopResponse.run_id,
          status: "running",
          updatedAt: new Date(),
        },
      }
    );

    console.log(`[Campaign ${campaignId}] Gumloop started with run_id: ${gumloopResponse.run_id}`);

    // 7. Start background polling (don't await - let it run in background)
    pollForCompletion(campaignId, gumloopResponse.run_id);

    // 8. Return campaign ID to frontend
    return NextResponse.json({
      id: campaignId.toString(),
      status: "running",
      gumloopRunId: gumloopResponse.run_id,
      message: "Campaign started. Polling for results in background.",
    });

  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}

// GET /api/campaigns - List user's campaigns
export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();
    const campaigns = db.collection<Campaign>("campaigns");

    // Only return campaigns belonging to this user
    const userCampaigns = await campaigns
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(userCampaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}
