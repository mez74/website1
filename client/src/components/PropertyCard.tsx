import { MapPin } from "lucide-react";
import { Link } from "wouter";

interface PropertyCardProps {
  id: number;
  title: string;
  price: string | null;
  currency?: string;
  location: string | null;
  type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  plotSize?: string | null;
  buildSize?: string | null;
  status: string;
  coverImage?: string;
  filterQuery?: string;
}

const statusLabel: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "oklch(70% 0.12 85)" },
  under_offer: { label: "Under Offer", color: "oklch(65% 0.15 55)" },
  sold: { label: "Sold", color: "oklch(55% 0 0)" },
  draft: { label: "Draft", color: "oklch(45% 0 0)" },
};

const typeLabel: Record<string, string> = {
  house: "House",
  apartment: "Apartment",
  villa: "Villa",
  penthouse: "Penthouse",
  land: "Land",
  commercial: "Commercial",
};

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

export default function PropertyCard({
  id,
  title,
  price,
  currency = "GBP",
  location,
  type,
  bedrooms,
  bathrooms,
  plotSize,
  buildSize,
  status,
  coverImage,
  filterQuery = "",
}: PropertyCardProps) {
  const statusInfo = statusLabel[status] ?? statusLabel.available;
  const href = filterQuery ? `/properties/${id}?${filterQuery}` : `/properties/${id}`;

  return (
    <Link href={href} className="no-underline block">
      <div className="luxury-card overflow-hidden group cursor-pointer">
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: "220px" }}>
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "oklch(14% 0 0)" }}
            >
              <div
                className="brand-heading text-center"
                style={{ color: "oklch(28% 0.02 85)", fontSize: "0.7rem", letterSpacing: "0.2em" }}
              >
                Michael Mackenzie
                <br />
                <span style={{ fontSize: "0.5rem", color: "oklch(22% 0.02 85)" }}>
                  Property Investment
                </span>
              </div>
            </div>
          )}
          <div className="property-img-overlay" />

          {/* Type Badge */}
          <div
            className="absolute top-3 left-3 px-3 py-1"
            style={{
              background: "oklch(8% 0 0 / 0.85)",
              border: "1px solid oklch(70% 0.12 85)",
              color: "oklch(70% 0.12 85)",
              fontSize: "0.55rem",
              fontFamily: "'Josefin Sans', sans-serif",
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {typeLabel[type] ?? type}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3
            className="brand-heading mb-1 truncate"
            style={{ fontSize: "1rem", color: "oklch(95% 0.01 90)" }}
          >
            {title}
          </h3>

          {location && (
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin size={11} style={{ color: "oklch(70% 0.12 85)" }} />
              <span
                style={{
                  color: "oklch(71% 0.01 90)",
                  fontSize: "0.7rem",
                  fontFamily: "'Josefin Sans', sans-serif",
                  letterSpacing: "0.08em",
                }}
              >
                {location}
              </span>
            </div>
          )}

          {/* Price and Property Details in One Line */}
          <div className="flex items-center mb-3" style={{ fontSize: "0.75rem", fontFamily: "'Josefin Sans', sans-serif", letterSpacing: "0.05em", gap: "0.5rem", flexWrap: "nowrap", overflow: "hidden" }}>
            {/* Price */}
            <div
              className="brand-heading"
              style={{ color: "oklch(70% 0.12 85)", fontSize: "0.9rem", whiteSpace: "nowrap" }}
            >
              {formatPrice(price, currency)}
            </div>

            {/* Beds */}
            {bedrooms !== null && (
              <div style={{ color: "oklch(71% 0.01 90)" }}>
                <span style={{ color: "oklch(70% 0.12 85)", fontWeight: 500 }}>beds:</span> {bedrooms}
              </div>
            )}

            {/* Baths */}
            {bathrooms !== null && (
              <div style={{ color: "oklch(71% 0.01 90)" }}>
                <span style={{ color: "oklch(70% 0.12 85)", fontWeight: 500 }}>baths:</span> {bathrooms}
              </div>
            )}

            {/* Build Size */}
            {buildSize && (
              <div style={{ color: "oklch(71% 0.01 90)" }}>
                <span style={{ color: "oklch(70% 0.12 85)", fontWeight: 500 }}>build:</span> {buildSize}
              </div>
            )}

            {/* Plot Size */}
            {plotSize && (
              <div style={{ color: "oklch(71% 0.01 90)" }}>
                <span style={{ color: "oklch(70% 0.12 85)", fontWeight: 500 }}>plot:</span> {plotSize}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
