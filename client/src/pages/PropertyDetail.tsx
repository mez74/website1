import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, Bed, Bath, MapPin, Home, ChevronLeft, ChevronRight, Send, Maximize2, Landmark } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { usePropertyNavigation } from "@/hooks/usePropertyNavigation";

const typeLabel: Record<string, string> = {
  house: "House",
  apartment: "Apartment",
  villa: "Villa",
  penthouse: "Penthouse",
  land: "Land",
  commercial: "Commercial",
};

const statusLabel: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "oklch(70% 0.12 85)" },
  under_offer: { label: "Under Offer", color: "oklch(65% 0.15 55)" },
  sold: { label: "Sold", color: "oklch(55% 0 0)" },
  draft: { label: "Draft", color: "oklch(45% 0 0)" },
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

function Gallery({ images, title }: { images: { url: string }[]; title: string }) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center h-[220px] md:h-[400px]"
        style={{ background: "oklch(12% 0 0)", border: "1px solid oklch(22% 0.02 85)" }}
      >
        <div
          className="brand-heading text-center"
          style={{ color: "oklch(25% 0.02 85)", fontSize: "0.7rem", letterSpacing: "0.2em" }}
        >
          Michael Mackenzie
          <br />
          <span style={{ fontSize: "0.5rem", color: "oklch(20% 0.02 85)" }}>Property Investment</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Main Image */}
      <div className="relative overflow-hidden h-[220px] md:h-[533px]">
        <img
          src={images[current].url}
          alt={`${title} - ${current + 1}`}
          className="w-full h-full object-cover"
        />
        <div className="property-img-overlay" />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2"
              style={{
                background: "oklch(8% 0 0 / 0.7)",
                border: "1px solid oklch(70% 0.12 85 / 0.4)",
                color: "oklch(70% 0.12 85)",
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2"
              style={{
                background: "oklch(8% 0 0 / 0.7)",
                border: "1px solid oklch(70% 0.12 85 / 0.4)",
                color: "oklch(70% 0.12 85)",
              }}
            >
              <ChevronRight size={20} />
            </button>
            <div
              className="absolute bottom-4 right-4 px-3 py-1"
              style={{
                background: "oklch(8% 0 0 / 0.7)",
                color: "oklch(70% 0.12 85)",
                fontSize: "0.65rem",
                fontFamily: "'Josefin Sans', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="flex-shrink-0 overflow-hidden"
              style={{
                width: "80px",
                height: "60px",
                border: i === current ? "2px solid oklch(70% 0.12 85)" : "2px solid transparent",
                opacity: i === current ? 1 : 0.5,
                transition: "all 0.2s",
              }}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EnquiryForm({ propertyId, propertyTitle }: { propertyId: number; propertyTitle: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const submit = trpc.enquiries.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Enquiry sent successfully");
    },
    onError: () => {
      toast.error("Failed to send enquiry. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    submit.mutate({
      propertyId,
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      message: form.message,
    });
  };

  const inputStyle = {
    background: "oklch(13% 0 0)",
    border: "2px solid oklch(70% 0.12 85 / 0.6)",
    color: "oklch(85% 0 0)",
    fontFamily: "'Josefin Sans', sans-serif",
    fontWeight: 300,
    fontSize: "0.8rem",
    letterSpacing: "0.04em",
    padding: "0.75rem 1rem",
    width: "100%",
    outline: "none",
  };

  const labelStyle = {
    color: "oklch(75% 0 0)",
    fontSize: "0.55rem",
    fontFamily: "'Josefin Sans', sans-serif",
    letterSpacing: "0.25em",
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: "0.4rem",
  };

  if (submitted) {
    return (
      <div className="luxury-card p-8 text-center" style={{ borderColor: "oklch(70% 0.12 85 / 0.3)" }}>
        <div
          className="brand-heading mb-3"
          style={{ color: "oklch(70% 0.12 85)", fontSize: "1.2rem" }}
        >
          Thank You
        </div>
        <p
          style={{
            color: "oklch(55% 0 0)",
            fontSize: "0.8rem",
            fontFamily: "'Josefin Sans', sans-serif",
            lineHeight: "1.8",
          }}
        >
          Your enquiry regarding <strong style={{ color: "oklch(75% 0 0)" }}>{propertyTitle}</strong> has
          been received. A member of our team will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="luxury-card p-8 relative" style={{
      background: `url('/manus-storage/Background7resized_c719253d.png'), oklch(8% 0 0)`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      <div className="absolute inset-0" style={{ background: "oklch(8% 0 0 / 0.6)" }} />
      <div className="relative z-10">
      <h3
        className="brand-heading mb-2 text-center"
        style={{ fontSize: "1rem", color: "oklch(95% 0.01 90)" }}
      >
        Register Your Interest
      </h3>
      <p
        className="mb-6 text-center"
        style={{
          color: "oklch(75% 0 0)",
          fontSize: "0.75rem",
          fontFamily: "'Josefin Sans', sans-serif",
          lineHeight: "1.7",
        }}
      >
        Complete the form below and a member of our team will contact you.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            style={inputStyle}
            placeholder="Your full name"
          />
        </div>
        <div>
          <label style={labelStyle}>Email Address *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            style={inputStyle}
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label style={labelStyle}>Telephone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            style={inputStyle}
            placeholder="+44 (0) 20 0000 0000"
          />
        </div>
        <div>
          <label style={labelStyle}>Message *</label>
          <textarea
            required
            rows={4}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="I am interested in this property..."
          />
        </div>
        <button
          type="submit"
          disabled={submit.isPending}
          className="btn-gold px-6 py-3 text-xs flex items-center justify-center gap-2"
        >
          {submit.isPending ? "Sending..." : (
            <>
              Send Enquiry
              <Send size={13} />
            </>
          )}
        </button>
      </form>
      
      {/* Property ID Display */}
      <div className="mt-6 pt-6" style={{ borderTop: "1px solid oklch(70% 0.12 85 / 0.2)" }}>
        <p
          style={{
            color: "oklch(55% 0 0)",
            fontSize: "0.7rem",
            fontFamily: "'Josefin Sans', sans-serif",
            letterSpacing: "0.1em",
            marginBottom: "0.3rem",
          }}
        >
          PROPERTY REFERENCE
        </p>
        <p
          className="brand-heading"
          style={{
            color: "oklch(70% 0.12 85)",
            fontSize: "0.95rem",
            letterSpacing: "0.08em",
          }}
        >
          MM-{propertyId.toString().padStart(6, "0")}
        </p>
      </div>
      </div>
    </div>
  );
}

export default function PropertyDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0");
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setLocation] = useLocation();
  const { getNavigationState, isStateValid, setRestorationFlag } = usePropertyNavigation();

  // Parse filter query from URL
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const filters = {
    location: searchParams.get('location') || undefined,
    type: searchParams.get('type') || undefined,
    bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
    priceRangeIndex: searchParams.get('priceRange') ? parseInt(searchParams.get('priceRange')!) : 0,
  };

  const priceRanges = [
    { min: undefined, max: undefined },
    { min: undefined, max: 500000 },
    { min: 500000, max: 1000000 },
    { min: 1000000, max: 2500000 },
    { min: 2500000, max: 5000000 },
    { min: 5000000, max: undefined },
  ];
  const selectedRange = priceRanges[filters.priceRangeIndex] || priceRanges[0];

  // Fetch filtered properties list
  const { data: properties } = trpc.properties.list.useQuery({
    location: filters.location,
    type: filters.type as any,
    bedrooms: filters.bedrooms,
    minPrice: selectedRange.min,
    maxPrice: selectedRange.max,
    limit: 100,
  });

  // Update filtered list and find current index
  useEffect(() => {
    if (properties) {
      setFilteredProperties(properties);
      const index = properties.findIndex(p => p.id === id);
      setCurrentIndex(index >= 0 ? index : 0);
    }
  }, [properties, id]);

  const { data: property, isLoading, error } = trpc.properties.byId.useQuery(
    { id },
    { enabled: !isNaN(id) && id > 0 }
  );

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevProperty = filteredProperties[currentIndex - 1];
      const queryString = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== undefined) as any).toString();
      setLocation(`/properties/${prevProperty.id}${queryString ? `?${queryString}` : ''}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredProperties.length - 1) {
      const nextProperty = filteredProperties[currentIndex + 1];
      const queryString = new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== undefined) as any).toString();
      setLocation(`/properties/${nextProperty.id}${queryString ? `?${queryString}` : ''}`);
    }
  };

  // Smart back button: restore navigation state or go to clean /properties
  const handleSmartBack = useCallback(() => {
    const navigationState = getNavigationState();
    
    if (navigationState && isStateValid(navigationState)) {
      // Valid saved state exists - set restoration flag and navigate to /properties
      setRestorationFlag();
      setLocation("/properties");
    } else {
      // No valid state - go to clean /properties page
      setLocation("/properties");
    }
  }, [getNavigationState, isStateValid, setLocation, setRestorationFlag]);

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "oklch(8% 0 0)" }}>
        <Navbar />
        <div className="container py-32 text-center">
          <div
            className="brand-heading"
            style={{ color: "oklch(28% 0.02 85)", fontSize: "1rem", letterSpacing: "0.2em" }}
          >
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen" style={{ background: "oklch(8% 0 0)" }}>
        <Navbar />
        <div className="container py-32 text-center">
          <div
            className="brand-heading mb-4"
            style={{ color: "oklch(70% 0.12 85)", fontSize: "2rem" }}
          >
            Property Not Found
          </div>
          <Link href="/properties">
            <button className="btn-outline-gold px-6 py-3 text-xs mx-auto flex items-center gap-2">
              <ArrowLeft size={13} />
              Back to Properties
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = statusLabel[property.status] ?? statusLabel.available;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < filteredProperties.length - 1;
  const showNavigation = filteredProperties.length > 1;

  return (
    <div className="min-h-screen" style={{ background: "oklch(8% 0 0)" }}>
      <Navbar />

      {/* Breadcrumb */}
      <div
        style={{
          paddingTop: "80px",
          borderBottom: "1px solid oklch(22% 0.02 85)",
          background: "oklch(10% 0 0)",
        }}
      >
        <div className="container py-4">
          <div className="flex items-center gap-2">
            <Link
              href="/properties"
              className="flex items-center gap-1.5 no-underline"
              style={{
                color: "oklch(45% 0 0)",
                fontSize: "0.65rem",
                fontFamily: "'Josefin Sans', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              <ArrowLeft size={12} />
              Properties
            </Link>
            <span style={{ color: "oklch(30% 0 0)", fontSize: "0.65rem" }}>/</span>
            <span
              style={{
                color: "oklch(55% 0 0)",
                fontSize: "0.65rem",
                fontFamily: "'Josefin Sans', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              {property.title}
            </span>
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* Previous/Next Navigation */}
        {showNavigation && (
          <div
            className="flex items-center justify-between mb-4"
            style={{
              position: "sticky",
              top: "80px",
              background: "oklch(8% 0 0)",
              zIndex: 40,
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid oklch(22% 0.02 85)",
            }}
          >
            <button
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className="flex items-center gap-2 px-3 py-1.5 text-xs"
              style={{
                color: hasPrevious ? "oklch(70% 0.12 85)" : "oklch(30% 0 0)",
                border: `1px solid ${hasPrevious ? "oklch(70% 0.12 85)" : "oklch(20% 0 0)"}`,
                background: "transparent",
                cursor: hasPrevious ? "pointer" : "not-allowed",
                fontFamily: "'Josefin Sans', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <span
              style={{
                color: "oklch(55% 0 0)",
                fontSize: "0.7rem",
                fontFamily: "'Josefin Sans', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              {currentIndex + 1} of {filteredProperties.length}
            </span>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="flex items-center gap-2 px-3 py-1.5 text-xs"
              style={{
                color: hasNext ? "oklch(70% 0.12 85)" : "oklch(30% 0 0)",
                border: `1px solid ${hasNext ? "oklch(70% 0.12 85)" : "oklch(20% 0 0)"}`,
                background: "transparent",
                cursor: hasNext ? "pointer" : "not-allowed",
                fontFamily: "'Josefin Sans', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10" style={{ marginTop: showNavigation ? "0" : "" }}>
          {/* Left: Gallery + Details */}
          <div className="lg:col-span-2">
            <Gallery images={property.images} title={property.title} />

            {/* Title & Status */}
            <div className="mt-8 mb-6 text-center">
              <div>
                <h1
                  className="brand-heading mb-2"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", color: "oklch(95% 0.01 90)" }}
                >
                  {property.title}
                </h1>
                {property.location && (
                  <div className="flex items-center justify-center gap-1.5">
                    <MapPin size={13} style={{ color: "oklch(70% 0.12 85)" }} />
                    <span
                      style={{
                        color: "oklch(75% 0 0)",
                        fontSize: "0.8rem",
                        fontFamily: "'Josefin Sans', sans-serif",
                      }}
                    >
                      {property.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="gold-divider mb-6" />

            {/* Price Box - Mobile Only */}
            <div
              className="lg:hidden luxury-card p-7 mb-8 text-center"
              style={{ borderColor: "oklch(70% 0.12 85 / 0.3)" }}
            >
              <div
                className="brand-subheading mb-2"
                style={{ color: "oklch(70% 0.01 90)", fontSize: "0.55rem", letterSpacing: "0.25em" }}
              >
                Asking Price
              </div>
              <div
                className="brand-heading"
                style={{ fontSize: "1.8rem", color: "oklch(70% 0.12 85)" }}
              >
                {formatPrice(property.price, property.currency)}
              </div>
            </div>

            {/* Key Details */}
            <div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
            >
              {[
                {
                  icon: <Home size={16} style={{ color: "oklch(70% 0.12 85)" }} />,
                  label: "Type",
                  value: typeLabel[property.type] ?? property.type,
                },
                ...(property.bedrooms !== null
                  ? [{
                      icon: <Bed size={16} style={{ color: "oklch(70% 0.12 85)" }} />,
                      label: <span><span className="md:hidden">Bed</span><span className="hidden md:inline">Bedrooms</span></span>,
                      value: String(property.bedrooms),
                    }]
                  : []),
                ...(property.bathrooms !== null
                  ? [{
                      icon: <Bath size={16} style={{ color: "oklch(70% 0.12 85)" }} />,
                      label: <span><span className="md:hidden">Bath</span><span className="hidden md:inline">Bathrooms</span></span>,
                      value: String(property.bathrooms),
                    }]
                  : []),
              ...(property.buildSize !== null
                  ? [{
                      icon: <Landmark size={16} style={{ color: "oklch(70% 0.12 85)" }} />,
                      label: "Build",
                      value: String(property.buildSize),
                    }]
                  : []),
                ...(property.plotSize !== null
                  ? [{
                      icon: <Maximize2 size={16} style={{ color: "oklch(70% 0.12 85)" }} />,
                      label: "Plot",
                      value: String(property.plotSize),
                    }]
                  : []),
              ].map((detail, i) => (
                <div
                  key={i}
                  className="luxury-card p-4 text-center"
                >
                  <div className="flex justify-center mb-2">{detail.icon}</div>
                  <div
                    className="brand-subheading mb-1"
                    style={{ color: "oklch(75% 0 0)", fontSize: "0.5rem", letterSpacing: "0.2em" }}
                  >
                    {typeof detail.label === 'string' ? detail.label : detail.label}
                  </div>
                  <div
                    style={{
                      color: "oklch(85% 0 0)",
                      fontSize: "0.85rem",
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontWeight: 400,
                    }}
                  >
                    {detail.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {property.description && (
              <div className="mb-8">
                {/* Mobile: Back and Available tabs above description */}
                <div className="lg:hidden flex items-center justify-between gap-4 mb-4">
                  <button
                    onClick={handleSmartBack}
                    className="px-4 py-2"
                    style={{
                      border: "1px solid oklch(70% 0.12 85)",
                      color: "oklch(70% 0.12 85)",
                      fontSize: "0.6rem",
                      fontFamily: "'Josefin Sans', sans-serif",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "oklch(70% 0.12 85)";
                      e.currentTarget.style.color = "oklch(10% 0 0)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "oklch(70% 0.12 85)";
                    }}
                  >
                    Back
                  </button>
                  <div
                    className="px-4 py-2"
                    style={{
                      border: `1px solid ${statusInfo.color}`,
                      color: statusInfo.color,
                      fontSize: "0.6rem",
                      fontFamily: "'Josefin Sans', sans-serif",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    {statusInfo.label}
                  </div>
                </div>

                {/* Desktop: Back, Title, Available in one row */}
                <div className="hidden lg:flex items-center justify-between gap-4 mb-4">
                  <button
                    onClick={handleSmartBack}
                    className="px-4 py-2"
                    style={{
                      border: "1px solid oklch(70% 0.12 85)",
                      color: "oklch(70% 0.12 85)",
                      fontSize: "0.6rem",
                      fontFamily: "'Josefin Sans', sans-serif",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "oklch(70% 0.12 85)";
                      e.currentTarget.style.color = "oklch(10% 0 0)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "oklch(70% 0.12 85)";
                    }}
                  >
                    Back
                  </button>
                  <h2
                    className="brand-heading"
                    style={{ fontSize: "1.1rem", color: "oklch(95% 0.01 90)" }}
                  >
                    Property Description
                  </h2>
                  <div
                    className="px-4 py-2"
                    style={{
                      border: `1px solid ${statusInfo.color}`,
                      color: statusInfo.color,
                      fontSize: "0.6rem",
                      fontFamily: "'Josefin Sans', sans-serif",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      flexShrink: 0,
                    }}
                  >
                    {statusInfo.label}
                  </div>
                </div>

                {/* Mobile: Description heading */}
                <h2
                  className="lg:hidden brand-heading mb-4 text-center"
                  style={{ fontSize: "1.1rem", color: "oklch(95% 0.01 90)" }}
                >
                  Property Description
                </h2>
                <div className="gold-divider mb-5" />
                <p
                  style={{
                    color: "oklch(75% 0 0)",
                    fontSize: "0.88rem",
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontWeight: 300,
                    lineHeight: "2",
                    letterSpacing: "0.03em",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {property.description}
                </p>
              </div>
            )}
          </div>

          {/* Right: Price + Enquiry */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              {/* Price Card */}
              {/* Price Card - Desktop Only */}
              <div
                className="hidden lg:block luxury-card p-7 mb-6 text-left"
                style={{ borderColor: "oklch(70% 0.12 85 / 0.3)" }}
              >
                <div
                  className="brand-subheading mb-2"
                  style={{ color: "oklch(70% 0.01 90)", fontSize: "0.55rem", letterSpacing: "0.25em" }}
                >
                  Asking Price
                </div>
                <div
                  className="brand-heading"
                  style={{ fontSize: "1.8rem", color: "oklch(70% 0.12 85)" }}
                >
                  {formatPrice(property.price, property.currency)}
                </div>
              </div>

              {/* Enquiry Form */}
              <EnquiryForm propertyId={property.id} propertyTitle={property.title} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
