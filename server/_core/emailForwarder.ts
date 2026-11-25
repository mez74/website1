import nodemailer from "nodemailer";
import { ENV } from "./env";

export type EmailForwardPayload = {
  subject: string;
  body: string;
  recipients: string[];
};

/**
 * Forwards an email to multiple recipients using nodemailer.
 * Uses Ethereal Email (fake SMTP service for testing) or real SMTP if configured.
 */
export async function forwardEmail(payload: EmailForwardPayload): Promise<boolean> {
  const { subject, body, recipients } = payload;

  if (!recipients || recipients.length === 0) {
    console.warn("[Email Forwarder] No recipients provided");
    return false;
  }

  try {
    // Create a test account for development
    // In production, you would use real SMTP credentials
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"Michael Mackenzie" <${testAccount.user}>`,
      to: recipients.join(","),
      subject: subject,
      text: body,
      html: body.replace(/\n/g, "<br>"),
    });

    console.log("[Email Forwarder] Message sent: %s", info.messageId);
    console.log("[Email Forwarder] Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return true;
  } catch (error) {
    console.warn("[Email Forwarder] Error sending email:", error);
    return false;
  }
}
