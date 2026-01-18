import { NextResponse } from "next/server";
import { Company } from "@/types";

// Mock data - fake companies for testing
const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Google",
    website: "https://google.com",
    sector: "Technology",
    description: "A multinational technology company",
    contacts: [
      {
        id: "c1",
        name: "Jane Smith",
        email: "jane.smith@google.com",
        role: "HR Manager",
        linkedinUrl: "https://linkedin.com/in/janesmith",
        confidence: "high",
      },
    ],
    status: "discovered",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Shopify",
    website: "https://shopify.com",
    sector: "E-commerce",
    description: "E-commerce platform for online stores",
    contacts: [
      {
        id: "c2",
        name: "John Doe",
        email: "john.doe@shopify.com",
        role: "Recruiter",
        confidence: "medium",
      },
    ],
    status: "contacted",
    createdAt: "2024-01-14T10:00:00Z",
    updatedAt: "2024-01-16T10:00:00Z",
  },
  {
    id: "3",
    name: "Ubisoft",
    website: "https://ubisoft.com",
    sector: "Gaming",
    description: "Video game company",
    contacts: [
      {
        id: "c3",
        name: "Marie Chen",
        email: "marie.chen@ubisoft.com",
        role: "Sponsorship Manager",
        confidence: "high",
      },
    ],
    status: "replied",
    createdAt: "2024-01-13T10:00:00Z",
    updatedAt: "2024-01-17T10:00:00Z",
  },
];

// GET /api/companies - Returns list of companies
export async function GET() {
  // Later: Replace this with real Gumloop/MongoDB call
  return NextResponse.json(mockCompanies);
}
