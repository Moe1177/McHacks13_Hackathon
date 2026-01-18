import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import nodemailer from "nodemailer";

interface SendEmailRequest {
  recipients: string[];
  subject: string;
  body: string;
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { recipients, subject, body }: SendEmailRequest = await request.json();

    // Validate
    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: "Must provide at least one recipient" },
        { status: 400 }
      );
    }
    if (!subject || !body) {
      return NextResponse.json(
        { error: "Must provide subject and body" },
        { status: 400 }
      );
    }

    // Check SMTP configuration
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
      console.error("Missing SMTP configuration");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT),
      secure: parseInt(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Send emails to all recipients
    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const info = await transporter.sendMail({
          from: SMTP_FROM,
          to: recipient,
          subject,
          text: body,
          html: body.replace(/\n/g, "<br>"),
        });
        return { recipient, messageId: info.messageId };
      })
    );

    // Count successes and failures
    const successful = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    console.log(
      `[Email] Sent ${successful.length}/${recipients.length} emails successfully`
    );

    if (failed.length > 0) {
      console.error("[Email] Failed recipients:", failed);
    }

    return NextResponse.json({
      success: true,
      sent: successful.length,
      failed: failed.length,
      total: recipients.length,
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}