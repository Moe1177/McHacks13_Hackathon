import { NextResponse } from "next/server";
import { EmailGenerateRequest, GeneratedEmail } from "@/types";

// POST /api/emails/generate - Generates a custom outreach email
export async function POST(request: Request) {
  // 1. Get the data sent from the frontend
  const body: EmailGenerateRequest = await request.json();

  // 2. Validate - must provide required fields
  if (!body.companyId || !body.contactId || !body.purpose) {
    return NextResponse.json(
      { error: "Must provide companyId, contactId, and purpose" },
      { status: 400 }
    );
  }

  // 3. Later: Call Gumloop API here to generate email with LLM
  // For now, return a fake generated email

  const fakeGeneratedEmail: GeneratedEmail = {
    companyId: body.companyId,
    contactId: body.contactId,
    subject: `${body.purpose.charAt(0).toUpperCase() + body.purpose.slice(1)} Opportunity - McHacks`,
    body: `Hi there,

I hope this email finds you well! My name is [Your Name], and I'm reaching out on behalf of McHacks, one of Canada's largest hackathons.

I wanted to connect regarding a potential ${body.purpose} opportunity. We believe there could be great synergy between our organizations.

Would you be available for a quick call this week to discuss further?

Best regards,
[Your Name]
McHacks Team`,
  };

  return NextResponse.json(fakeGeneratedEmail);
}
