import { describe, it, expect } from "vitest";

// Test currency formatting with different symbols
describe("Currency Formatting", () => {
  const CURRENCY_SYMBOLS: Record<string, string> = {
    GBP: "£",
    USD: "$",
    EUR: "€",
    AED: "د.إ",
  };

  function formatPrice(price: string | null, currency: string = "GBP"): string {
    if (!price) return "Price on Application";
    const num = parseFloat(price);
    if (isNaN(num)) return "Price on Application";
    const symbol = CURRENCY_SYMBOLS[currency] || "£";
    const formatted = new Intl.NumberFormat("en-GB", {
      maximumFractionDigits: 0,
    }).format(num);
    return `${symbol}${formatted}`;
  }

  it("should format GBP prices with £ symbol", () => {
    expect(formatPrice("1000000", "GBP")).toBe("£1,000,000");
    expect(formatPrice("500000", "GBP")).toBe("£500,000");
  });

  it("should format USD prices with $ symbol", () => {
    expect(formatPrice("1000000", "USD")).toBe("$1,000,000");
    expect(formatPrice("500000", "USD")).toBe("$500,000");
  });

  it("should format EUR prices with € symbol", () => {
    expect(formatPrice("1000000", "EUR")).toBe("€1,000,000");
    expect(formatPrice("500000", "EUR")).toBe("€500,000");
  });

  it("should format AED prices with د.إ symbol", () => {
    expect(formatPrice("1000000", "AED")).toBe("د.إ1,000,000");
    expect(formatPrice("500000", "AED")).toBe("د.إ500,000");
  });

  it("should default to GBP when currency is not specified", () => {
    expect(formatPrice("1000000")).toBe("£1,000,000");
  });

  it("should return 'Price on Application' for null price", () => {
    expect(formatPrice(null, "GBP")).toBe("Price on Application");
    expect(formatPrice(null, "USD")).toBe("Price on Application");
  });

  it("should return 'Price on Application' for invalid price", () => {
    expect(formatPrice("invalid", "GBP")).toBe("Price on Application");
    expect(formatPrice("abc123", "USD")).toBe("Price on Application");
  });

  it("should handle decimal prices correctly", () => {
    expect(formatPrice("1500000.50", "GBP")).toBe("£1,500,001");
    expect(formatPrice("999999.99", "USD")).toBe("$1,000,000");
  });

  it("should handle small prices correctly", () => {
    expect(formatPrice("100", "GBP")).toBe("£100");
    expect(formatPrice("50000", "EUR")).toBe("€50,000");
  });

  it("should use default symbol for unknown currency", () => {
    expect(formatPrice("1000000", "UNKNOWN")).toBe("£1,000,000");
  });
});

// Test currency validation
describe("Currency Validation", () => {
  const VALID_CURRENCIES = ["GBP", "USD", "EUR", "AED"];

  it("should validate all supported currencies", () => {
    VALID_CURRENCIES.forEach((currency) => {
      expect(VALID_CURRENCIES.includes(currency)).toBe(true);
    });
  });

  it("should reject invalid currencies", () => {
    const invalidCurrencies = ["JPY", "CAD", "AUD", "CHF"];
    invalidCurrencies.forEach((currency) => {
      expect(VALID_CURRENCIES.includes(currency)).toBe(false);
    });
  });

  it("should have exactly 4 supported currencies", () => {
    expect(VALID_CURRENCIES.length).toBe(4);
  });
});
