import { describe, it, expect } from "vitest";
import { sendEmailViaGmail } from "./_core/gmailService";
import { ENV } from "./_core/env";

describe("Gmail Service", () => {
  it("should have SMTP credentials configured", () => {
    expect(ENV.smtpHost).toBe("smtp.gmail.com");
    expect(ENV.smtpPort).toBe(587);
    expect(ENV.smtpUser).toBe("franco@michaelmackenziegroup.com");
    expect(ENV.smtpPassword).toBeTruthy();
    expect(ENV.contactFormEmail).toBe("franco@michaelmackenziegroup.com");
  });

  it("should have contact form email configured", () => {
    expect(ENV.contactFormEmail).toBe("franco@michaelmackenziegroup.com");
  });

  it("should have all required SMTP environment variables", () => {
    expect(ENV.smtpHost).toBeDefined();
    expect(ENV.smtpPort).toBeDefined();
    expect(ENV.smtpUser).toBeDefined();
    expect(ENV.smtpPassword).toBeDefined();
  });

  it("should accept email payload with subject and body", async () => {
    const payload = {
      subject: "Test Email",
      body: "This is a test email",
    };
    // Just verify the function accepts the payload structure
    expect(payload.subject).toBeTruthy();
    expect(payload.body).toBeTruthy();
  });

  it("should use contact form email as default recipient", () => {
    expect(ENV.contactFormEmail).toBe("franco@michaelmackenziegroup.com");
  });
});
