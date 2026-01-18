import { NextResponse } from "next/server";

// Request body type
interface GumloopRequest {
  interest_or_sector: string;
  number_of_companies: string;
}

// POST /api/gumloop - Calls Gumloop pipeline to find companies
export async function POST(request: Request) {
  // 1. Get the data sent from the frontend
  const body: GumloopRequest = await request.json();

  // 2. Validate input
  if (!body.interest_or_sector) {
    return NextResponse.json(
      { error: "Must provide interest_or_sector" },
      { status: 400 }
    );
  }

  // 3. Get credentials from environment variables
  const apiKey = process.env.GUMLOOP_API_KEY;
  const userId = process.env.GUMLOOP_USER_ID;
  const pipelineId = process.env.GUMLOOP_PIPELINE_ID;

  // 4. Check if credentials exist
  if (!apiKey || !userId || !pipelineId) {
    return NextResponse.json(
      { error: "Gumloop credentials not configured" },
      { status: 500 }
    );
  }

  // 5. Call Gumloop API
  try {
    const gumloopResponse = await fetch(
      `https://api.gumloop.com/api/v1/start_pipeline?user_id=${userId}&saved_item_id=${pipelineId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          interest_or_sector: body.interest_or_sector,
          number_of_companies: body.number_of_companies || "1",
        }),
      }
    );

    // 6. Parse Gumloop response
    const data = await gumloopResponse.json();

    // 7. Return the result to frontend
    return NextResponse.json(data);

  } catch (error) {
    console.error("Gumloop API error:", error);
    return NextResponse.json(
      { error: "Failed to call Gumloop API" },
      { status: 500 }
    );
  }
}
