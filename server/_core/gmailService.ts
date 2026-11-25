import nodemailer from "nodemailer";
import { ENV } from "./env";

export type EmailPayload = {
  subject: string;
  body: string;
  recipientEmail?: string;
};

/**
 * Sends an email using Gmail SMTP.
 * Uses credentials from environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD).
 * Recipient defaults to CONTACT_FORM_EMAIL if not specified.
 */
export async function sendEmailViaGmail(payload: EmailPayload): Promise<boolean> {
  const { subject, body, recipientEmail } = payload;
  const recipient = recipientEmail || ENV.contactFormEmail;

  if (!ENV.smtpHost || !ENV.smtpUser || !ENV.smtpPassword) {
    console.error("[Gmail Service] SMTP credentials not configured");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: ENV.smtpHost,
      port: ENV.smtpPort,
      secure: ENV.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: ENV.smtpUser,
        pass: ENV.smtpPassword,
      },
    });

    // Verify connection
    await transporter.verify();
    console.log("[Gmail Service] SMTP connection verified");

    // Send email
    const info = await transporter.sendMail({
      from: ENV.smtpUser,
      to: recipient,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, "<br>"),
    });

    console.log("[Gmail Service] Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("[Gmail Service] Error sending email:", error);
    return false;
  }
}
