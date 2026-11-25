import { useState, useEffect, useRef, useCallback } from "react";
import { SlidersHorizontal, X, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { trpc } from "@/lib/trpc";
import { usePropertyNavigation, getNavigationStateSync, isNavigationStateValid } from "@/hooks/usePropertyNavigation";

const propertyTypes = [
  { value: "", label: "All Types" },
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "penthouse", label: "Penthouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

const bedroomOptions = [
  { value: 0, label: "Any" },
  { value: 1, label: "1+" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 5, label: "5+" },
];

const priceRanges = [
  { min: undefined, max: undefined, label: "Any Price" },
  { min: undefined, max: 500000, label: "Up to £500k" },
  { min: 500000, max: 1000000, label: "£500k – £1M" },
  { min: 1000000, max: 2500000, label: "£1M – £2.5M" },
  { min: 2500000, max: 5000000, label: "£2.5M – £5M" },
  { min: 5000000, max: undefined, label: "£5M+" },
];

interface Filters {
  location: string;
  type: string;
  bedrooms: number;
  priceRangeIndex: number;
}

export default function Properties() {
  const { saveNavigationState, clearNavigationState } = usePropertyNavigation();
  
  // Calculate restoration decision BEFORE state initialization
  const savedNavigationState = getNavigationStateSync();
  const shouldRestore = isNavigationStateValid(savedNavigationState);

  // Use ref to track restoration phase - this prevents effects from firing during restoration
  const isRestoringRef = useRef(shouldRestore);

  // Initialize state with restoration-aware values
  const [filters, setFilters] = useState<Filters>(
    shouldRestore && savedNavigationState
      ? savedNavigationState.filters
      : {
          location: "",
          type: "",
          bedrooms: 0,
          priceRangeIndex: 0,
        }
  );
  
  const [showFilters, setShowFilters] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(
    shouldRestore && savedNavigationState ? savedNavigationState.currentPage : 1
  );
  
  // Track restoration state to guard effects
  const [isRestoringState, setIsRestoringState] = useState(shouldRestore);
  
  const PROPERTIES_PER_PAGE = 9;
  const gridRef = useRef<HTMLDivElement>(null);

  const selectedRange = priceRanges[filters.priceRangeIndex];

  // Fetch all available locations
  const { data: locations = [] } = trpc.properties.locations.useQuery();

  // Fetch available options based on current filters
  const { data: availableLocations = [] } = trpc.properties.availableLocations.useQuery({
    type: filters.type || undefined,
    bedrooms: filters.bedrooms > 0 ? filters.bedrooms : undefined,
    minPrice: selectedRange?.min,
    maxPrice: selectedRange?.max,
  });

  const { data: availableTypes = [] } = trpc.properties.availableTypes.useQuery({
    location: filters.location || undefined,
    bedrooms: filters.bedrooms > 0 ? filters.bedrooms : undefined,
    minPrice: selectedRange?.min,
    maxPrice: selectedRange?.max,
  });

  const { data: availableBedrooms = [] } = trpc.properties.availableBedrooms.useQuery({
    location: filters.location || undefined,
    type: filters.type || undefined,
    minPrice: selectedRange?.min,
    maxPrice: selectedRange?.max,
  });

  const { data: availablePriceRanges = [] } = trpc.properties.availablePriceRanges.useQuery({
    location: filters.location || undefined,
    type: filters.type || undefined,
    bedrooms: filters.bedrooms > 0 ? filters.bedrooms : undefined,
  });

  const { data: properties, isLoading } = trpc.properties.list.useQuery({
    location: filters.location || undefined,
    type: filters.type ? (filters.type as "house" | "apartment" | "villa" | "penthouse" | "land" | "commercial") : undefined,
    bedrooms: filters.bedrooms > 0 ? filters.bedrooms : undefined,
    minPrice: selectedRange?.min,
    maxPrice: selectedRange?.max,
  });

  const clearFilters = useCallback(() => {
    setFilters({ location: "", type: "", bedrooms: 0, priceRangeIndex: 0 });
    setCurrentPage(1);
    setIsRestoringState(false);
    isRestoringRef.current = false;
    clearNavigationState();
  }, [clearNavigationState]);

  // Reset to page 1 when filters change (guarded during restoration)
  useEffect(() => {
    // Skip this effect during restoration - the ref prevents it from running
    if (!isRestoringRef.current) {
      setCurrentPage(1);
    }
  }, [filters]);

  // Scroll to grid when page changes (only for pagination, not restoration)
  useEffect(() => {
    if (gridRef.current && !isRestoringState && currentPage > 1) {
      const offset = 180; // Offset to account for header and filters
      const elementPosition = gridRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  }, [currentPage, isRestoringState]);

  // Calculate pagination
  const totalProperties = properties?.length ?? 0;
  const totalPages = Math.ceil(totalProperties / PROPERTIES_PER_PAGE);
  const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
  const endIndex = startIndex + PROPERTIES_PER_PAGE;
  const paginatedProperties = properties?.slice(startIndex, endIndex) ?? [];

  // Handle scroll restoration after data loads
  useEffect(() => {
    if (isRestoringState && savedNavigationState && properties && properties.length > 0) {
      // Wait for DOM to render
      const timer = requestAnimationFrame(() => {
        setTimeout(() => {
          // Try to scroll to the saved property if it exists
          const savedPropertyId = savedNavigationState.propertyId;
          const propertyElement = document.querySelector(`[data-property-id="${savedPropertyId}"]`);
          
          if (propertyElement) {
            // Scroll to the property card
            propertyElement.scrollIntoView({ behavior: 'auto', block: 'center' });
          } else {
            // Fall back to saved scroll position
            window.scrollTo({ top: savedNavigationState.scrollPosition, behavior: 'auto' });
          }
          
          // Mark restoration as complete
          setIsRestoringState(false);
          isRestoringRef.current = false;
          clearNavigationState();
        }, 150);
      });
      
      return () => {
        cancelAnimationFrame(timer);
      };
    }
  }, [isRestoringState, properties, savedNavigationState, clearNavigationState]);

  const hasFilters =
    filters.location || filters.type || filters.bedrooms > 0 || filters.priceRangeIndex > 0;

  const inputStyle = {
    background: "oklch(13% 0 0)",
    border: "1px solid oklch(22% 0.02 85)",
    color: "oklch(85% 0 0)",
    fontFamily: "'Josefin Sans', sans-serif",
    fontWeight: 300,
    fontSize: "0.8rem",
    letterSpacing: "0.05em",
    padding: "0.6rem 0.9rem",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const selectStyle = {
    ...inputStyle,
    appearance: "none" as const,
    WebkitAppearance: "none" as const,
    cursor: "pointer",
    textAlign: "center" as const,
  };

  const labelStyle = {
    color: "oklch(95% 0.01 90)",
    fontSize: "0.55rem",
    fontFamily: "'Josefin Sans', sans-serif",
    letterSpacing: "0.25em",
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: "0.4rem",
    textAlign: "center" as const,
  };

  return (
    <div className="min-h-screen" style={{ background: "oklch(8% 0 0)" }}>
      <Navbar />

      {/* Page Header */}
      <section
        className="relative flex items-center justify-center"
        style={{
          minHeight: "100vh",
          background: `url('/manus-storage/Background7resized_c719253d.png'), oklch(8% 0 0)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Overlay for 60% opacity */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "oklch(8% 0 0 / 0.6)",
          }}
        />
        {/* Decorative vertical lines */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, oklch(70% 0.12 85 / 0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, oklch(52% 0.10 75 / 0.04) 0%, transparent 50%)
            `,
          }}
        />
        <div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{ background: "linear-gradient(to bottom, transparent, oklch(70% 0.12 85 / 0.3), transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{ background: "linear-gradient(to bottom, transparent, oklch(70% 0.12 85 / 0.3), transparent)" }}
        />
        <div className="container text-center py-32 pt-32 relative z-10">
          {/* Eyebrow */}
          <div
            className="brand-subheading animate-fade-in-up mb-6"
            style={{
              color: "oklch(95% 0.01 90)",
              fontSize: "0.65rem",
              letterSpacing: "0.35em",
            }}
          >
            Marbella - Algarve - Dubai
          </div>

          {/* Main Heading */}
          <h1
            className="brand-heading animate-fade-in-up animate-delay-100 mb-2"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", lineHeight: 1.05 }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, oklch(75% 0.13 88), oklch(52% 0.10 75))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Curated
            </span>
          </h1>
          <h1
            className="brand-heading animate-fade-in-up animate-delay-200 mb-8"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", lineHeight: 1.05 }}
          >
            <span
              style={{
                background: "linear-gradient(135deg, oklch(75% 0.13 88), oklch(52% 0.10 75))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Portfolio
            </span>
          </h1>

          <div className="gold-divider max-w-xs mx-auto mb-8 animate-fade-in-up animate-delay-200" />

          <p
            className="brand-subheading animate-fade-in-up animate-delay-300 mb-4"
            style={{
              color: "oklch(95% 0.01 90)",
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
            }}
          >
            Refined. Considered. Exceptional.
          </p>

          <p
            className="animate-fade-in-up animate-delay-300 mx-auto"
            style={{
              color: "oklch(71% 0.01 90)",
              fontSize: "1rem",
              fontFamily: "'Josefin Sans', sans-serif",
              fontWeight: 300,
              maxWidth: "480px",
              lineHeight: "1.9",
              letterSpacing: "0.04em",
              marginBottom: "0",
            }}
          >
            The Michael Mackenzie Standard: Curating the world's most distinguished properties for those who accept nothing less.
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "oklch(70% 0.12 85)" }}
        >
          <span
            style={{
              fontSize: "0.55rem",
              fontFamily: "'Josefin Sans', sans-serif",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "oklch(70% 0.12 85)",
            }}
          >
            Scroll
          </span>
          <div
            className="w-px h-8"
            style={{ background: "linear-gradient(to bottom, oklch(70% 0.12 85 / 0.8), oklch(70% 0.12 85 / 0.2))" }}
          />
        </div>
      </section>

      {/* Filters */}
      <section
        style={{
          background: "oklch(10% 0 0)",
          borderBottom: "1px solid oklch(22% 0.02 85)",
          position: "sticky",
          top: "80px",
          zIndex: 40,
        }}
      >
        <div className="container py-2 -mt-8 md:mt-0">
          {/* Mobile toggle */}
          <div className="flex flex-col items-center gap-3 md:hidden mb-3">
            {/* Mobile-only toggle row - centered on mobile */}
            <button
              className="flex items-center gap-2 btn-outline-gold px-4 py-2 text-xs"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={13} />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1"
                style={{ color: "oklch(55% 0 0)", fontSize: "0.7rem", fontFamily: "'Josefin Sans', sans-serif" }}
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>

          <div className={`${showFilters ? "block" : "hidden"} md:block`}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
              {/* Location */}
              <div style={{ width: "200px" }}>
                <label style={labelStyle}>Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
                  style={selectStyle}
                >
                  <option value="" style={{ background: "oklch(13% 0 0)" }}>All Locations</option>
                  {availableLocations.map((loc) => (
                    <option key={loc} value={loc} style={{ background: "oklch(13% 0 0)" }}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div style={{ width: "200px" }}>
                <label style={labelStyle}>Property Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                  style={selectStyle}
                >
                  <option value="" style={{ background: "oklch(13% 0 0)" }}>All Types</option>
                  {availableTypes.map((type) => {
                    const typeLabel = propertyTypes.find((t) => t.value === type)?.label || type;
                    return (
                      <option key={type} value={type} style={{ background: "oklch(13% 0 0)" }}>
                        {typeLabel}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Bedrooms */}
              <div style={{ width: "200px" }}>
                <label style={labelStyle}>Bedrooms</label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => setFilters((f) => ({ ...f, bedrooms: Number(e.target.value) }))}
                  style={selectStyle}
                >
                  <option value="0" style={{ background: "oklch(13% 0 0)" }}>Any</option>
                  {availableBedrooms.map((bedrooms) => (
                    <option key={bedrooms} value={bedrooms} style={{ background: "oklch(13% 0 0)" }}>
                      {bedrooms}+
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div style={{ width: "200px" }}>
                <label style={labelStyle}>Price Range</label>
                <select
                  value={filters.priceRangeIndex}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, priceRangeIndex: Number(e.target.value) }))
                  }
                  style={selectStyle}
                >
                  {availablePriceRanges.length > 0 ? (
                    availablePriceRanges.map((r) => (
                      <option key={r.index} value={r.index} style={{ background: "oklch(13% 0 0)" }}>
                        {r.label}
                      </option>
                    ))
                  ) : (
                    priceRanges.map((r, i) => (
                      <option key={i} value={i} style={{ background: "oklch(13% 0 0)" }}>
                        {r.label}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Clear */}
              {hasFilters && (
                <div>
                  <button
                    onClick={clearFilters}
                    className="btn-outline-gold px-4 py-2 text-xs flex items-center gap-1.5 justify-center"
                  >
                    <X size={12} />
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section
        className="py-12 relative"
        style={{
          background: `url('/manus-storage/Background7resized_c719253d.png'), oklch(8% 0 0)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Overlay for 60% opacity */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "oklch(8% 0 0 / 0.6)",
          }}
        />
        {/* Decorative vertical lines */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse at 20% 50%, oklch(70% 0.12 85 / 0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, oklch(52% 0.10 75 / 0.04) 0%, transparent 50%)
            `,
          }}
        />
        <div
          className="absolute left-0 top-0 bottom-0 w-px"
          style={{ background: "linear-gradient(to bottom, transparent, oklch(70% 0.12 85 / 0.3), transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{ background: "linear-gradient(to bottom, transparent, oklch(70% 0.12 85 / 0.3), transparent)" }}
        />
        <div className="container relative z-10">
          {/* Results count */}
          <div className="flex items-center justify-between mb-8">
            <div
              style={{
                color: "oklch(45% 0 0)",
                fontSize: "0.7rem",
                fontFamily: "'Josefin Sans', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              {isLoading
                ? "Searching..."
                : `${properties?.length ?? 0} propert${(properties?.length ?? 0) === 1 ? "y" : "ies"} found`}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="luxury-card"
                  style={{ height: "340px", opacity: 0.4 }}
                />
              ))}
            </div>
          ) : properties && properties.length > 0 ? (
            <>
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProperties.map((p) => {
                const filterParams = new URLSearchParams();
                if (filters.location) filterParams.set('location', filters.location);
                if (filters.type) filterParams.set('type', filters.type);
                if (filters.bedrooms > 0) filterParams.set('bedrooms', filters.bedrooms.toString());
                if (filters.priceRangeIndex > 0) filterParams.set('priceRange', filters.priceRangeIndex.toString());
                const filterQuery = filterParams.toString();

                const handlePropertyClick = () => {
                  // Save current state before navigating to property detail
                  saveNavigationState({
                    filters,
                    currentPage,
                    sortOrder: "default",
                    searchText: "",
                    scrollPosition: window.scrollY,
                    propertyId: p.id,
                    timestamp: Date.now(),
                    from: "/properties",
                    url: window.location.pathname + window.location.search,
                  });
                };

                return (
                <div
                  key={p.id}
                  data-property-id={p.id}
                  onClick={handlePropertyClick}
                >
                  <PropertyCard
                    id={p.id}
                    title={p.title}
                    price={p.price}
                    currency={p.currency}
                    location={p.location}
                    filterQuery={filterQuery}
                    type={p.type}
                    bedrooms={p.bedrooms}
                    bathrooms={p.bathrooms}
                    plotSize={p.plotSize}
                    buildSize={p.buildSize}
                    status={p.status}
                    coverImage={p.coverImage}
                  />
                </div>
              );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => {
                    setCurrentPage(Math.max(1, currentPage - 1));
                  }}
                  disabled={currentPage === 1}
                  className="btn-outline-gold px-6 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div
                  style={{
                    color: "oklch(45% 0 0)",
                    fontSize: "0.8rem",
                    fontFamily: "'Josefin Sans', sans-serif",
                    letterSpacing: "0.1em",
                  }}
                >
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() => {
                    setCurrentPage(Math.min(totalPages, currentPage + 1));
                  }}
                  disabled={currentPage === totalPages}
                  className="btn-outline-gold px-6 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
            </>
          ) : (
            <div
              className="text-center py-24 luxury-card"
              style={{ borderStyle: "dashed" }}
            >
              <div
                className="brand-heading mb-3"
                style={{ color: "oklch(28% 0.02 85)", fontSize: "2rem" }}
              >
                MM
              </div>
              <p
                style={{
                  color: "oklch(40% 0 0)",
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "0.85rem",
                  letterSpacing: "0.08em",
                }}
              >
                No properties found matching your criteria.
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-outline-gold px-6 py-3 text-xs mt-6 mx-auto block"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
