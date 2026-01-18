import { NextResponse } from "next/server";
import { ScrapeRequest, Company } from "@/types";

// POST /api/scrape - Triggers scraping for a company or sector
export async function POST(request: Request) {
  // 1. Get the data sent from the frontend
  const body: ScrapeRequest = await request.json();

  // 2. Validate - must provide companyName or sector
  if (!body.companyName && !body.sector) {
    return NextResponse.json(
      { error: "Must provide companyName or sector" },
      { status: 400 }
    );
  }

  // 3. Later: Call Gumloop API here to actually scrape
  // For now, return fake "scraped" data

  const fakeScrapedCompany: Company = {
    id: crypto.randomUUID(),
    name: body.companyName || `${body.sector} Company`,
    website: `https://${(body.companyName || body.sector || "example").toLowerCase().replace(/\s/g, "")}.com`,
    sector: body.sector || "Technology",
    description: `A company in the ${body.sector || "Technology"} sector`,
    contacts: [
      {
        id: crypto.randomUUID(),
        name: "Found Contact",
        email: `contact@${(body.companyName || "example").toLowerCase().replace(/\s/g, "")}.com`,
        role: "HR Manager",
        confidence: "medium",
      },
    ],
    status: "discovered",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(fakeScrapedCompany);
}
