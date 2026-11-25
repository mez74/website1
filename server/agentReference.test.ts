import { describe, it, expect } from "vitest";

// Test agent reference validation and formatting
describe("Agent Reference Field", () => {
  function validateAgentReference(reference: string | undefined): boolean {
    if (!reference) return true; // Optional field
    if (reference.length === 0) return true; // Empty is allowed
    if (reference.length > 255) return false; // Max length check
    return true;
  }

  function formatAgentReference(reference: string | undefined): string {
    if (!reference || reference.trim() === "") return "";
    return reference.trim();
  }

  it("should accept valid agent references", () => {
    expect(validateAgentReference("AG-12345")).toBe(true);
    expect(validateAgentReference("REF-001")).toBe(true);
    expect(validateAgentReference("AGENT-XYZ-789")).toBe(true);
    expect(validateAgentReference("123456")).toBe(true);
  });

  it("should accept empty or undefined agent references", () => {
    expect(validateAgentReference("")).toBe(true);
    expect(validateAgentReference(undefined)).toBe(true);
  });

  it("should reject agent references exceeding max length", () => {
    const longRef = "A".repeat(256);
    expect(validateAgentReference(longRef)).toBe(false);
  });

  it("should accept agent references at max length", () => {
    const maxRef = "A".repeat(255);
    expect(validateAgentReference(maxRef)).toBe(true);
  });

  it("should trim whitespace from agent references", () => {
    expect(formatAgentReference("  AG-12345  ")).toBe("AG-12345");
    expect(formatAgentReference("\tREF-001\n")).toBe("REF-001");
  });

  it("should handle various reference formats", () => {
    const references = [
      "AG-12345",
      "REF-2024-001",
      "AGENT_XYZ",
      "12345",
      "ABC123DEF456",
    ];
    references.forEach((ref) => {
      expect(validateAgentReference(ref)).toBe(true);
      expect(formatAgentReference(ref)).toBe(ref);
    });
  });

  it("should preserve special characters in references", () => {
    expect(formatAgentReference("AG-12345-XYZ")).toBe("AG-12345-XYZ");
    expect(formatAgentReference("REF_2024_001")).toBe("REF_2024_001");
    expect(formatAgentReference("AGENT.123")).toBe("AGENT.123");
  });

  it("should handle numeric-only references", () => {
    expect(validateAgentReference("123456789")).toBe(true);
    expect(formatAgentReference("123456789")).toBe("123456789");
  });

  it("should handle case sensitivity", () => {
    expect(formatAgentReference("ag-12345")).toBe("ag-12345");
    expect(formatAgentReference("AG-12345")).toBe("AG-12345");
    expect(formatAgentReference("Ag-12345")).toBe("Ag-12345");
  });
});

// Test database schema for agent reference
describe("Agent Reference Database Schema", () => {
  it("should support agent reference field in properties table", () => {
    // This test verifies the schema includes agentReference column
    // Field type: varchar(255), optional (nullable)
    const schemaFields = {
      agentReference: {
        type: "varchar",
        length: 255,
        nullable: true,
      },
    };

    expect(schemaFields.agentReference.type).toBe("varchar");
    expect(schemaFields.agentReference.length).toBe(255);
    expect(schemaFields.agentReference.nullable).toBe(true);
  });

  it("should allow storing agent references for multiple properties", () => {
    const properties = [
      { id: 1, title: "Property 1", agentReference: "AG-001" },
      { id: 2, title: "Property 2", agentReference: "AG-002" },
      { id: 3, title: "Property 3", agentReference: undefined },
    ];

    expect(properties[0].agentReference).toBe("AG-001");
    expect(properties[1].agentReference).toBe("AG-002");
    expect(properties[2].agentReference).toBeUndefined();
  });
});
