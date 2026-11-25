import { describe, it, expect, beforeAll, afterAll } from "vitest";
import nodemailer from "nodemailer";

/**
 * Test Gmail SMTP connection and email delivery
 * This test verifies that the SMTP credentials work correctly
 */
describe("Gmail SMTP Service", () => {
  it("should verify Gmail SMTP connection", async () => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: false, // false for 587 (TLS), true for 465 (SSL)
      auth: {
        user: process.env.SMTP_USER || "franco@michaelmackenziegroup.com",
        pass: process.env.SMTP_PASSWORD || "",
      },
    });

    try {
      // Verify connection
      const verified = await transporter.verify();
      expect(verified).toBe(true);
      console.log("[Test] Gmail SMTP connection verified successfully");
    } catch (error) {
      console.error("[Test] Gmail SMTP connection failed:", error);
      throw error;
    }
  });

  it("should send a test email to info@michaelmackenziegroup.com", async () => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || "franco@michaelmackenziegroup.com",
        pass: process.env.SMTP_PASSWORD || "",
      },
    });

    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_USER || "franco@michaelmackenziegroup.com",
        to: process.env.CONTACT_FORM_EMAIL || "info@michaelmackenziegroup.com",
        subject: "Test Email - Gmail SMTP Configuration",
        text: "This is a test email to verify Gmail SMTP configuration is working correctly.",
        html: "<p>This is a test email to verify Gmail SMTP configuration is working correctly.</p>",
      });

      console.log("[Test] Email sent successfully:", info.messageId);
      expect(info.messageId).toBeDefined();
    } catch (error) {
      console.error("[Test] Email send failed:", error);
      throw error;
    }
  });
});
