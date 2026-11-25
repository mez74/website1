import { Link } from "wouter";
import React, { useState } from "react";
import { ArrowRight, Shield, Star, TrendingUp, House, Building2, Briefcase, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { trpc } from "@/lib/trpc";

function HeroSection() {
  return (
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
      {/* Overlay for 40% opacity */}
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

      <div className="container text-center py-32 pt-40 relative z-10">
        {/* Eyebrow */}
        <div
          className="brand-subheading animate-fade-in-up mb-6"
          style={{
            color: "oklch(95% 0.01 90)",
            fontSize: "0.65rem",
            letterSpacing: "0.35em",
          }}
        >
          Established in Excellence
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
            Michael
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
            Mackenzie
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
          international
        </p>

        <p
          className="animate-fade-in-up animate-delay-300 mx-auto mb-12"
          style={{
            color: "oklch(71% 0.01 90)",
            fontSize: "1rem",
            fontFamily: "'Josefin Sans', sans-serif",
            fontWeight: 300,
            maxWidth: "480px",
            lineHeight: "1.9",
            letterSpacing: "0.04em",
          }}
        >
          Refined. Considered. Exceptional. Curating the world's most distinguished
          properties for discerning investors and buyers.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animate-delay-400">
          <Link href="/properties">
            <button className="btn-gold px-8 py-4 text-xs flex items-center gap-2">
              Explore Properties
              <ArrowRight size={14} />
            </button>
          </Link>
          <Link href="/about">
            <button className="btn-outline-gold px-8 py-4 text-xs">
              Our Story
            </button>
          </Link>
        </div>
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
  );
}

function StatsSection() {
  const stats = [
    { value: "£750M+", label: "Property transactions" },
    { value: "3200+", label: "Properties Sold" },
    { value: "25+", label: "Years Experience" },
    { value: "3", label: "global markets" },
  ];

  return (
    <section
      style={{
        background: "oklch(10% 0 0)",
        borderTop: "1px solid oklch(22% 0.02 85)",
        borderBottom: "1px solid oklch(22% 0.02 85)",
      }}
    >
      <div className="container py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className="brand-heading mb-1"
                style={{ fontSize: "2.2rem", color: "oklch(70% 0.12 85)" }}
              >
                {stat.value}
              </div>
              <div
                className="brand-subheading"
                style={{
                  color: "oklch(95% 0.01 90)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection2() {
  const stats = [
    { value: "Luxury Residences", label: "Exclusive homes in prime locations with premium amenities and architectural excellence." },
    { value: "Investment Properties", label: "Strategic acquisitions with strong ROI potential and long-term appreciation prospects." },
    { value: "Commercial Assets", label: "Prime commercial real estate including office, retail, and mixed-use developments." },
    { value: "International Portfolio", label: "Global properties across key markets offering diversification and international exposure." },
  ];

  return (
    <section
      style={{
        background: "oklch(10% 0 0)",
        borderTop: "1px solid oklch(22% 0.02 85)",
        borderBottom: "1px solid oklch(22% 0.02 85)",
      }}
    >
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className="brand-heading mb-1"
                style={{ fontSize: "1.54rem", color: "oklch(70% 0.12 85)", lineHeight: "1.2" }}
              >
                {stat.value}
              </div>
              <div
                className="brand-subheading"
                style={{
                  color: "oklch(95% 0.01 90)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.2em",
                  lineHeight: "1.4",
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProperties() {
  const { data: properties, isLoading } = trpc.properties.list.useQuery({
    featured: true,
    limit: 6,
  });
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Update window width on resize
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update container width when component mounts and after properties load
  React.useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, [properties]); // Re-measure when properties load

  // Responsive cardsPerView: 1 on mobile, 2 on tablet, 3 on desktop
  const cardsPerView = windowWidth < 640 ? 1 : windowWidth < 1024 ? 2 : 3;
  const gapSize = 24; // gap-6 = 1.5rem = 24px
  const cardWidth = containerWidth / cardsPerView;
  const translateDistance = currentCardIndex * (cardWidth + gapSize);

  // Clamp currentCardIndex when cardsPerView changes (e.g., on resize)
  React.useEffect(() => {
    if (!properties) return;
    const maxIdx = Math.max(0, properties.length - cardsPerView);
    if (currentCardIndex > maxIdx) {
      setCurrentCardIndex(maxIdx);
    }
  }, [cardsPerView, properties]);

  if (!properties) return null;

  const canNavigate = properties.length > cardsPerView;
  const maxIndex = Math.max(0, properties.length - cardsPerView);

  const goToPrevious = () => {
    setCurrentCardIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const goToNext = () => {
    setCurrentCardIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentCardIndex(Math.min(index, maxIndex));
  };

  return (
    <section
      className="py-24 relative"
      style={{
        background: `url('/manus-storage/Background7resized_c719253d.png'), oklch(10% 0 0)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        borderTop: "1px solid oklch(22% 0.02 85)",
        borderBottom: "1px solid oklch(22% 0.02 85)",
      }}
    >
      {/* Overlay for 60% opacity */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "oklch(10% 0 0 / 0.6)",
        }}
      />
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div
            className="brand-subheading mb-4"
            style={{ color: "oklch(70% 0.12 85)", fontSize: "0.6rem", letterSpacing: "0.3em" }}
          >
            Curated Selection
          </div>
          <h2
            className="brand-heading mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "oklch(95% 0.01 90)" }}
          >
            Featured Properties
          </h2>
          <div className="gold-divider max-w-[80px] mx-auto" />
        </div>

        {isLoading && properties ? (
          <div className="flex gap-6 overflow-hidden">
            {[...Array(cardsPerView)].map((_, i) => (
              <div
                key={i}
                className="luxury-card overflow-hidden flex-shrink-0"
                style={{ height: "340px", width: `${100 / cardsPerView}%`, minWidth: 0, animation: "pulse 2s infinite" }}
              />
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden" ref={containerRef}>
              <div
                className="flex transition-transform duration-500 ease-out gap-6"
                style={{
                  transform: `translateX(-${translateDistance}px)`,
                }}
              >
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className="flex-shrink-0"
                    style={{ width: `${100 / cardsPerView}%`, minWidth: 0 }}
                  >
                    <PropertyCard
                      id={p.id}
                      title={p.title}
                      price={p.price}
                      currency={p.currency}
                      location={p.location}
                      type={p.type}
                      bedrooms={p.bedrooms}
                      bathrooms={p.bathrooms}
                      plotSize={p.plotSize}
                      buildSize={p.buildSize}
                      status={p.status}
                      coverImage={(p as any).coverImage}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows - Repositioned for mobile */}
            {canNavigate && (
              <>
                {/* Mobile: Arrows above the carousel */}
                {windowWidth < 640 && (
                  <div className="flex justify-center gap-4 mb-6">
                    <button
                      onClick={goToPrevious}
                      className="p-2 hover:opacity-70 transition-opacity"
                      aria-label="Previous properties"
                    >
                      <svg
                        className="w-6 h-6"
                        style={{ color: "oklch(70% 0.12 85)" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={goToNext}
                      className="p-2 hover:opacity-70 transition-opacity"
                      aria-label="Next properties"
                    >
                      <svg
                        className="w-6 h-6"
                        style={{ color: "oklch(70% 0.12 85)" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {/* Desktop/Tablet: Arrows on sides */}
                {windowWidth >= 640 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-10 p-2 hover:opacity-70 transition-opacity"
                      aria-label="Previous properties"
                    >
                      <svg
                        className="w-6 h-6"
                        style={{ color: "oklch(70% 0.12 85)" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-10 p-2 hover:opacity-70 transition-opacity"
                      aria-label="Next properties"
                    >
                      <svg
                        className="w-6 h-6"
                        style={{ color: "oklch(70% 0.12 85)" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </>
            )}

            {/* Dot Indicators */}
            {canNavigate && (
              <div className="flex justify-center gap-2 mt-8">
                {[...Array(maxIndex + 1)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: index === currentCardIndex ? "oklch(70% 0.12 85)" : "oklch(40% 0 0)",
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <p
              style={{
                color: "oklch(40% 0 0)",
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.85rem",
                letterSpacing: "0.1em",
              }}
            >
              Featured properties will appear here once listed.
            </p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/properties">
            <button className="btn-outline-gold px-10 py-4 text-xs flex items-center gap-2 mx-auto">
              View All Properties
              <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  const values = [
    {
      icon: <Shield size={24} style={{ color: "oklch(70% 0.12 85)" }} />,
      title: "Trusted Expertise",
      description:
        "Over twenty five years of navigating the most exclusive property markets, delivering results that consistently exceed expectations.",
    },
    {
      icon: <Star size={24} style={{ color: "oklch(70% 0.12 85)" }} />,
      title: "Exceptional Quality",
      description:
        "Every property in our portfolio is hand-selected to meet the highest standards of quality, location, and investment potential.",
    },
    {
      icon: <TrendingUp size={24} style={{ color: "oklch(70% 0.12 85)" }} />,
      title: "strategic acquisition",
      description:
        "Strategic insight and market intelligence that positions our clients to achieve superior long-term investment performance.",
    },
  ];

  return (
    <section
      className="relative"
      style={{
        background: `url('/manus-storage/Background7resized_c719253d.png'), oklch(10% 0 0)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        borderTop: "1px solid oklch(22% 0.02 85)",
      }}
    >
      {/* Overlay for 40% opacity */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "oklch(10% 0 0 / 0.6)",
        }}
      />
      <div className="container py-24 relative z-10">
        <div className="text-center mb-16">
          <div
            className="brand-subheading mb-4"
            style={{ color: "oklch(70% 0.12 85)", fontSize: "0.6rem", letterSpacing: "0.3em" }}
          >
            Our Commitment
          </div>
          <h2
            className="brand-heading mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "oklch(95% 0.01 90)" }}
          >
            Why Michael Mackenzie
          </h2>
          <div className="gold-divider max-w-[80px] mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <div
              key={i}
              className="luxury-card p-8 text-center"
            >
              <div className="flex justify-center mb-5">{v.icon}</div>
              <h3
                className="brand-heading mb-4"
                style={{ fontSize: "1rem", color: "oklch(95% 0.01 90)" }}
              >
                {v.title}
              </h3>
              <p
                style={{
                  color: "oklch(71% 0.01 90)",
                  fontSize: "0.8rem",
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontWeight: 300,
                  lineHeight: "1.9",
                }}
              >
                {v.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PropertyTypeShowcase() {
  const propertyTypes = [
    {
      icon: <House size={40} style={{ color: "oklch(70% 0.12 85)" }} />,
      title: "Luxury Residences",
      description: "Exclusive homes in prime locations with premium amenities and architectural excellence.",
    },
    {
      icon: <TrendingUp size={40} style={{ color: "oklch(70% 0.12 85)" }} />,
      title: "Investment Properties",
      description: "Strategic acquisitions with strong ROI potential and long-term appreciation prospects.",
    },
    {
      icon: <Building2 size={40} style={{ color: "oklch(70% 0.12 85)" }} />,
      title: "Commercial Assets",
      description: "Prime commercial real estate including office, retail, and mixed-use developments.",
    },
    {
      icon: <Globe size={40} style={{ color: "oklch(70% 0.12 85)" }} />,
      title: "International Portfolio",
      description: "Global properties across key markets offering diversification and international exposure.",
    },
  ];

  return (
    <section
      className="py-24 relative"
      style={{
        background: "oklch(8% 0 0)",
        borderTop: "1px solid oklch(22% 0.02 85)",
        borderBottom: "1px solid oklch(22% 0.02 85)",
      }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div
            className="brand-subheading mb-4"
            style={{ color: "oklch(70% 0.12 85)", fontSize: "0.6rem", letterSpacing: "0.3em" }}
          >
            Our Specializations
          </div>
          <h2
            className="brand-heading mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "oklch(95% 0.01 90)" }}
          >
            Property Types
          </h2>
          <div className="gold-divider max-w-[80px] mx-auto" />
        </div>

        {/* Property Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {propertyTypes.map((type, i) => (
            <div
              key={i}
              className="luxury-card p-8 text-center group hover:shadow-lg transition-all duration-300"
              style={{
                borderTop: "2px solid oklch(70% 0.12 85)",
              }}
            >
              <div className="flex justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                {React.cloneElement(type.icon, { size: 40 })}
              </div>
              <h3
                className="brand-heading mb-3"
                style={{ fontSize: "1rem", color: "oklch(95% 0.01 90)" }}
              >
                {type.title}
              </h3>
              <p
                style={{
                  color: "oklch(71% 0.01 90)",
                  fontSize: "0.8rem",
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontWeight: 300,
                  lineHeight: "1.8",
                }}
              >
                {type.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 50% 50%, oklch(70% 0.12 85 / 0.07) 0%, transparent 70%),
          oklch(8% 0 0)
        `,
        borderTop: "1px solid oklch(22% 0.02 85)",
      }}
    >
      <div className="container text-center">
        <div
          className="brand-subheading mb-4"
          style={{ color: "oklch(70% 0.12 85)", fontSize: "0.6rem", letterSpacing: "0.3em" }}
        >
          Begin Your Journey
        </div>
        <h2
          className="brand-heading mb-6"
          style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "oklch(95% 0.01 90)" }}
        >
          ACQUIRE THE EXTRAORDINARY
        </h2>
        <div className="gold-divider max-w-[80px] mx-auto mb-8" />
        <p
          className="mx-auto mb-10"
          style={{
            color: "oklch(71% 0.01 90)",
            fontSize: "0.9rem",
            fontFamily: "'Josefin Sans', sans-serif",
            fontWeight: 300,
            maxWidth: "460px",
            lineHeight: "1.9",
          }}
        >
          Whether you are seeking a primary residence, investment property, or portfolio
          expansion, our team is ready to guide you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/properties">
            <button className="btn-gold px-10 py-4 text-xs flex items-center gap-2">
              Search Properties
              <ArrowRight size={14} />
            </button>
          </Link>
          <Link href="/contact#contact-form">
            <button className="btn-outline-gold px-10 py-4 text-xs">
              Contact Us
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(8% 0 0)" }}>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturedProperties />
      <StatsSection2 />
      <ValuesSection />
      <CTASection />
      <Footer />
    </div>
  );
}
