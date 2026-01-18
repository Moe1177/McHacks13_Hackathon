// Company status in the pipeline
export type PipelineStatus = "discovered" | "contacted" | "replied";

// Confidence level for scraped data
export type ConfidenceLevel = "high" | "medium" | "low";

// A contact found for a company
export interface Contact {
  id: string;
  name: string;
  email: string;
  role: string; // e.g., "HR Manager", "Recruiter", "CEO"
  linkedinUrl?: string;
  confidence: ConfidenceLevel;
}

// A company in the system
export interface Company {
  id: string;
  name: string;
  website: string;
  sector: string;
  description?: string;
  contacts: Contact[];
  status: PipelineStatus;
  createdAt: string;
  updatedAt: string;
}

// Request to scrape a company
export interface ScrapeRequest {
  companyName?: string;
  sector?: string;
}

// Request to generate an email
export interface EmailGenerateRequest {
  companyId: string;
  contactId: string;
  purpose: string; // e.g., "sponsorship", "recruitment", "partnership"
}

// Generated email response
export interface GeneratedEmail {
  subject: string;
  body: string;
  companyId: string;
  contactId: string;
}
