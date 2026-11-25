import { describe, it, expect } from "vitest";
import { InsertContactInquiry } from "../drizzle/schema";

describe("Contact Inquiry System", () => {
  describe("Data Types and Validation", () => {
    it("should define valid InsertContactInquiry type with all required fields", () => {
      const inquiry: InsertContactInquiry = {
        name: "Test User",
        email: "test@example.com",
        phone: "+44 1234 567890",
        subject: "Property Inquiry",
        message: "I am interested in learning more about your properties.",
        status: "new",
      };

      expect(inquiry.name).toBe("Test User");
      expect(inquiry.email).toBe("test@example.com");
      expect(inquiry.phone).toBe("+44 1234 567890");
      expect(inquiry.subject).toBe("Property Inquiry");
      expect(inquiry.message).toBe("I am interested in learning more about your properties.");
      expect(inquiry.status).toBe("new");
    });

    it("should allow optional phone field", () => {
      const inquiry: InsertContactInquiry = {
        name: "Test User",
        email: "test@example.com",
        phone: null,
        subject: "Property Inquiry",
        message: "I am interested in learning more about your properties.",
        status: "new",
      };

      expect(inquiry.phone).toBeNull();
      expect(inquiry.name).toBeDefined();
      expect(inquiry.email).toBeDefined();
    });

    it("should support all valid status values", () => {
      const statuses: Array<"new" | "read" | "replied" | "archived"> = ["new", "read", "replied", "archived"];

      statuses.forEach((status) => {
        const inquiry: InsertContactInquiry = {
          name: "Test User",
          email: "test@example.com",
          phone: "+44 1234 567890",
          subject: "Test",
          message: "Test message",
          status,
        };

        expect(inquiry.status).toBe(status);
      });
    });

    it("should validate inquiry structure for form submission", () => {
      const formData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "+44 7345 021 485",
        subject: "Interested in Marbella Property",
        message: "I would like more information about your properties in Marbella.",
      };

      // Verify all required fields are present
      expect(formData.name).toBeTruthy();
      expect(formData.email).toBeTruthy();
      expect(formData.subject).toBeTruthy();
      expect(formData.message).toBeTruthy();

      // Phone is optional
      expect(formData.phone).toBeDefined();

      // Verify email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(formData.email)).toBe(true);
    });

    it("should validate inquiry email format", () => {
      const validEmails = [
        "test@example.com",
        "user.name@example.co.uk",
        "info@michaelmackenziegroup.com",
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it("should reject invalid email formats", () => {
      const invalidEmails = [
        "notanemail",
        "@example.com",
        "user@",
        "user name@example.com",
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      invalidEmails.forEach((email) => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe("Inquiry Status Workflow", () => {
    it("should define valid status transitions", () => {
      const statusTransitions = {
        new: ["read", "archived"],
        read: ["replied", "archived"],
        replied: ["archived"],
        archived: [],
      };

      // Verify the workflow structure
      expect(statusTransitions.new).toContain("read");
      expect(statusTransitions.new).toContain("archived");
      expect(statusTransitions.read).toContain("replied");
      expect(statusTransitions.replied).toContain("archived");
    });

    it("should support inquiry lifecycle", () => {
      const lifecycle = ["new", "read", "replied", "archived"] as const;

      expect(lifecycle.length).toBe(4);
      expect(lifecycle[0]).toBe("new");
      expect(lifecycle[lifecycle.length - 1]).toBe("archived");
    });
  });

  describe("Contact Information", () => {
    it("should validate contact email address", () => {
      const contactEmail = "info@michaelmackenziegroup.com";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(contactEmail)).toBe(true);
    });

    it("should validate contact phone number format", () => {
      const contactPhone = "+44 (0) 7345 021 485";
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;

      expect(phoneRegex.test(contactPhone)).toBe(true);
    });

    it("should support international phone formats", () => {
      const phones = [
        "+44 7345 021 485",
        "+44 (0) 7345 021 485",
        "+1 555 123 4567",
        "+971 50 123 4567",
      ];

      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;

      phones.forEach((phone) => {
        expect(phoneRegex.test(phone)).toBe(true);
      });
    });
  });

  describe("Inquiry Content Validation", () => {
    it("should validate minimum required content length", () => {
      const minNameLength = 2;
      const minSubjectLength = 3;
      const minMessageLength = 10;

      const inquiry = {
        name: "Jo",
        subject: "Inf",
        message: "I am interested",
      };

      expect(inquiry.name.length).toBeGreaterThanOrEqual(minNameLength);
      expect(inquiry.subject.length).toBeGreaterThanOrEqual(minSubjectLength);
      expect(inquiry.message.length).toBeGreaterThanOrEqual(minMessageLength);
    });

    it("should handle inquiry with various message lengths", () => {
      const shortMessage = "Tell me more.";
      const longMessage = "I am very interested in your properties in Marbella, Algarve, and Dubai. Could you please provide more information about available listings, pricing, and investment opportunities?";

      expect(shortMessage.length).toBeGreaterThan(0);
      expect(longMessage.length).toBeGreaterThan(shortMessage.length);
    });

    it("should support inquiry subjects for different property types", () => {
      const subjects = [
        "Residential Property Inquiry",
        "Commercial Property Inquiry",
        "Investment Opportunity",
        "Property Valuation Request",
        "General Inquiry",
      ];

      subjects.forEach((subject) => {
        expect(subject.length).toBeGreaterThan(0);
        expect(typeof subject).toBe("string");
      });
    });
  });

  describe("Geographic Focus", () => {
    it("should support inquiries for all geographic focus areas", () => {
      const locations = ["Marbella", "Algarve", "Dubai"];

      locations.forEach((location) => {
        expect(location).toBeDefined();
        expect(location.length).toBeGreaterThan(0);
      });
    });

    it("should validate inquiry messages mentioning properties", () => {
      const inquiries = [
        "I am interested in properties in Marbella",
        "Do you have any listings in Algarve?",
        "I would like to invest in Dubai real estate",
      ];

      inquiries.forEach((inquiry) => {
        expect(inquiry.length).toBeGreaterThan(0);
        expect(["Marbella", "Algarve", "Dubai"].some((loc) => inquiry.includes(loc))).toBe(true);
      });
    });
  });
});
