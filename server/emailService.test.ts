import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("Email Service Configuration", () => {
  it("should have CONTACT_INQUIRY_EMAIL configured", () => {
    expect(ENV.contactInquiryEmail).toBeDefined();
    expect(ENV.contactInquiryEmail.length).toBeGreaterThan(0);
  });

  it("should have valid email format for contact inquiry email", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test(ENV.contactInquiryEmail)).toBe(true);
  });

  it("should be configured for production use", () => {
    // This test verifies the email is configured for production
    // All form submissions will be sent to the official business email
    expect(ENV.contactInquiryEmail).toBeDefined();
  });

  it("should be set to info@michaelmackenziegroup.com for production", () => {
    // This test validates that the environment variable is correctly configured for production
    expect(ENV.contactInquiryEmail).toBe("info@michaelmackenziegroup.com");
  });

  it("should have forge API credentials configured", () => {
    expect(ENV.forgeApiUrl).toBeDefined();
    expect(ENV.forgeApiKey).toBeDefined();
  });
});
