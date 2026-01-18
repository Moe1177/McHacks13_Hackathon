# Lucia's Vespa, Hackathon Outreach Pipeline

## Inspiration
As members of the ConUHacks organizing team, we know firsthand that sponsor outreach is one of the most time-consuming yet critical parts of the job.
Every season, we spend months manually searching for companies, digging through websites for contact emails, and sending thousands of personalized messages.
We wanted to build something that would genuinely help the hackathon community, not just a project for the weekend. Our project, Lucia's Vespa, is a tool we plan to actually use after this hackathon to streamline our own outreach process.

## What it does
Lucia's Vespa is an AI-powered sponsorship outreach platform that automates the entire sponsor discovery and outreach pipeline:
1. Discover Companies - Enter a sector (e.g., "fintech", "cloud computing") and the number of companies you want to find
2. Extract Contacts - Our AI pipeline automatically finds relevant companies and extracts their contact emails
3. Organize Results - Contacts are grouped by company, deduplicated, and stored in your campaign dashboard
4. Craft & Send Emails - Select contacts, customize email templates, and send personalized outreach with one click

## How we built it
- Frontend: Next.js with TypeScript, Tailwind CSS, and Framer Motion for smooth animations
- Authentication: Clerk for secure user authentication and session management
- AI Pipeline: Gumloop API for intelligent company discovery and email extraction through web crawling and scraping
- Database: MongoDB Atlas for storing campaigns and contact data
- Email: NodeMailer with Gmail SMTP for sending outreach emails
- Architecture: Background polling system that tracks Gumloop job status and updates campaigns in real-time

## Challenges we ran into
- Async job handling
- Gumloop web crawling takes a long time to complete, so we built a background polling system that checks job status and updates MongoDB when results are ready

## Accomplishments that we're proud of
- End-to-end automation from "I need sponsors in fintech" to emails landing in inboxes
- Clean, intuitive UI with real-time campaign status updates
- Smart contact grouping by company with bulk selection
- Built and shipped a fully functional product in 24 hours

## What we learned
- How to integrate AI automation pipelines (Gumloop) into web applications
- Background job polling patterns for handling async workflows
- Email infrastructure with NodeMailer and SMTP configuration

## What's next for Lucia's Vespa
- Email templates library
- Save and reuse successful outreach templates, with AI-powered A/B testing
- Response tracking
- Track message opens, replies, and follow-up reminders
- CRM integration
- Sync contacts with HubSpot, Salesforce, or Notion
- AI-powered personalization
- Generate customized email content based on each company's profile
- Analytics dashboard to track campaign performance and conversion rates