import { Link } from "wouter";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: "oklch(8% 0 0)" }}>
      <Navbar />

      {/* Hero */}
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
            Our Story
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
            International
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
            Michael Mackenzie represents more than a firm; it is a commitment to excellence passed from one generation to the next.
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

      {/* Story Section */}
      <section className="py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
            <div>
              <div
                className="brand-subheading mb-5 text-center"
                style={{ color: "oklch(70% 0.12 85)", fontSize: "0.6rem", letterSpacing: "0.3em" }}
              >
                Established in Excellence
              </div>
              <h2
                className="brand-heading mb-6 text-center"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)", color: "oklch(95% 0.01 90)" }}
              >
                built on Legacy
              </h2>
              <div className="gold-divider mb-8" />
              <div
                className="brand-subheading mb-8 text-center"
                style={{ color: "oklch(70% 0.12 85)", fontSize: "0.6rem", letterSpacing: "0.3em" }}
              >
                OUR STORY
              </div>
              <div
                className="text-center lg:text-left"
                style={{
                  color: "oklch(75% 0 0)",
                  fontSize: "0.9rem",
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontWeight: 300,
                  lineHeight: "2",
                  letterSpacing: "0.03em",
                }}
              >
                <p className="mb-5">
                  At Michael Mackenzie, our foundation is built upon the trusted dynamics of a family-run business, an ethos defined by naming the firm after my two sons. Drawing upon twenty five years of specialist expertise across the UK and Mediterranean real estate markets, we appreciate that acquiring significant luxury assets is fundamentally about securing your future.
                </p>
                <p className="mb-5">
                  Every relationship we cultivate and every acquisition we oversee is anchored by our core values: absolute discretion, unwavering integrity, and exceptionally personalised service. We believe this level of refinement requires mutual respect and a genuine understanding of your individual requirements.
                </p>
                <p>
                  We specialise in the considered procurement of prime global real estate. By carefully curating our expertise within this asset class, we ensure our clients receive meticulous attention and authoritative guidance at every stage. Navigating these complex markets demands more than mere access, it requires a quiet, expert hand. We are here to facilitate your acquisitions seamlessly, ensuring the experience is as refined as the assets we secure.
                </p>
              </div>
            </div>

            {/* Decorative Panel */}
            <div className="relative h-full">
              <div
                className="luxury-card p-10 relative h-full flex flex-col justify-between"
                style={{
                  borderColor: "oklch(70% 0.12 85 / 0.3)",
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
                    borderRadius: "inherit",
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
                    borderRadius: "inherit",
                  }}
                />
                <div className="relative z-10">
                <img
                  src="/manus-storage/logov1_1b9a5dd0.webp"
                  alt="Michael Mackenzie"
                  className="rounded-full mx-auto mb-6"
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
                <div
                  className="brand-heading text-center mb-2"
                  style={{ color: "oklch(70% 0.12 85)", fontSize: "1.1rem" }}
                >
                  Michael Mackenzie
                </div>
                <div
                  className="brand-subheading text-center mb-8"
                  style={{ color: "oklch(75% 0 0)", fontSize: "0.55rem", letterSpacing: "0.25em" }}
                >
                  International
                </div>
                <div className="gold-divider mb-8" />
                <blockquote
                  style={{
                    color: "oklch(75% 0 0)",
                    fontSize: "1rem",
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: "italic",
                    lineHeight: "1.8",
                    textAlign: "center",
                  }}
                >
                  "Refined. Considered. Exceptional."
                </blockquote>
                
                {/* Key Metrics */}
                <div className="mt-8 pt-8 border-t border-opacity-30" style={{ borderColor: "oklch(70% 0.12 85)" }}>
                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <div style={{ color: "oklch(70% 0.12 85)", fontSize: "1.25rem", fontWeight: "600", letterSpacing: "0.05em" }}>£750M+</div>
                      <div style={{ color: "oklch(75% 0 0)", fontSize: "0.65rem", letterSpacing: "0.1em", marginTop: "0.5rem" }}>PROPERTY TRANSACTIONS</div>
                    </div>
                    <div>
                      <div style={{ color: "oklch(70% 0.12 85)", fontSize: "1.25rem", fontWeight: "600", letterSpacing: "0.05em" }}>3200+</div>
                      <div style={{ color: "oklch(75% 0 0)", fontSize: "0.65rem", letterSpacing: "0.1em", marginTop: "0.5rem" }}>PROPERTIES SOLD</div>
                    </div>
                    <div>
                      <div style={{ color: "oklch(70% 0.12 85)", fontSize: "1.25rem", fontWeight: "600", letterSpacing: "0.05em" }}>25+</div>
                      <div style={{ color: "oklch(75% 0 0)", fontSize: "0.65rem", letterSpacing: "0.1em", marginTop: "0.5rem" }}>YEARS EXPERIENCE</div>
                    </div>
                    <div>
                      <div style={{ color: "oklch(70% 0.12 85)", fontSize: "1.25rem", fontWeight: "600", letterSpacing: "0.05em" }}>3</div>
                      <div style={{ color: "oklch(75% 0 0)", fontSize: "0.65rem", letterSpacing: "0.1em", marginTop: "0.5rem" }}>GLOBAL MARKETS</div>
                    </div>
                  </div>
                </div>
                
                {/* Closing tagline */}
                <blockquote
                  style={{
                    color: "oklch(75% 0 0)",
                    fontSize: "1rem",
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: "italic",
                    lineHeight: "1.8",
                    textAlign: "center",
                    marginTop: "2rem",
                  }}
                >
                  "Curating the world's most distinguished properties for discerning investors and buyers."
                </blockquote>
                </div>
              </div>
              {/* Corner accents */}
              <div
                className="absolute -top-2 -left-2 w-8 h-8"
                style={{ borderTop: "1px solid oklch(70% 0.12 85)", borderLeft: "1px solid oklch(70% 0.12 85)" }}
              />
              <div
                className="absolute -bottom-2 -right-2 w-8 h-8"
                style={{ borderBottom: "1px solid oklch(70% 0.12 85)", borderRight: "1px solid oklch(70% 0.12 85)" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section
        style={{
          background: `url('/manus-storage/Background7resized_c719253d.png'), oklch(10% 0 0)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          borderTop: "1px solid oklch(22% 0.02 85)",
          borderBottom: "1px solid oklch(22% 0.02 85)",
          position: "relative",
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
              What We Stand For
            </div>
            <h2
              className="brand-heading mb-4"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)", color: "oklch(95% 0.01 90)" }}
            >
              Our Values
            </h2>
            <div className="gold-divider max-w-[80px] mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: "01",
                title: "Discretion",
                desc: "Every client relationship is handled with the utmost confidentiality and professionalism.",
              },
              {
                number: "02",
                title: "Integrity",
                desc: "Honest counsel, transparent processes, and advice that always prioritises your interests.",
              },
              {
                number: "03",
                title: "Excellence",
                desc: "We hold every aspect of our service to the highest possible standard, without exception.",
              },
              {
                number: "04",
                title: "Legacy",
                desc: "Building enduring value through properties that stand the test of time and market cycles.",
              },
            ].map((v) => (
              <div key={v.number} className="luxury-card p-7 text-center md:text-left">
                <div
                  className="brand-heading mb-4"
                  style={{ fontSize: "2rem", color: "oklch(85% 0.12 85 / 0.6)" }}
                >
                  {v.number}
                </div>
                <h3
                  className="brand-heading mb-3"
                  style={{ fontSize: "0.9rem", color: "oklch(95% 0.01 90)" }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    color: "oklch(75% 0 0)",
                    fontSize: "0.75rem",
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontWeight: 300,
                    lineHeight: "1.9",
                  }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <div
              className="brand-subheading mb-4"
              style={{ color: "oklch(70% 0.12 85)", fontSize: "0.6rem", letterSpacing: "0.3em" }}
            >
              Get in Touch
            </div>
            <h2
              className="brand-heading mb-4"
              style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)", color: "oklch(95% 0.01 90)" }}
            >
              Contact information
            </h2>
            <div className="gold-divider max-w-[80px] mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: <Mail size={20} style={{ color: "oklch(70% 0.12 85)" }} />,
                label: "Email",
                value: "info@michaelmackenziegroup.com",
              },
              {
                icon: <Phone size={20} style={{ color: "oklch(70% 0.12 85)" }} />,
                label: "Telephone",
                value: "+44 (0) 7345 021 485",
              },
              {
                icon: <MapPin size={20} style={{ color: "oklch(70% 0.12 85)" }} />,
                label: "Location",
                value: "Marbella - Algarve - Dubai",
              },
            ].map((item) => {
              const isEmail = item.label === "Email";
              const isPhone = item.label === "Telephone";
              const cardContent = (
                <>
                  <div className="flex justify-center mb-4">{item.icon}</div>
                  <div
                    className="brand-subheading mb-2"
                    style={{ color: "oklch(45% 0 0)", fontSize: "0.55rem", letterSpacing: "0.25em" }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      color: "oklch(75% 0 0)",
                      fontSize: "0.8rem",
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontWeight: 300,
                    }}
                  >
                    {item.value}
                  </div>
                </>
              );

              if (isEmail) {
                return (
                  <a
                    key={item.label}
                    href="mailto:info@michaelmackenziegroup.com"
                    className="luxury-card p-7 text-center hover:opacity-80 transition-opacity duration-200"
                    style={{ textDecoration: "none", cursor: "pointer" }}
                  >
                    {cardContent}
                  </a>
                );
              }

              if (isPhone) {
                return (
                  <a
                    key={item.label}
                    href="tel:+447345021485"
                    className="luxury-card p-7 text-center hover:opacity-80 transition-opacity duration-200"
                    style={{ textDecoration: "none", cursor: "pointer" }}
                  >
                    {cardContent}
                  </a>
                );
              }

              return (
                <div key={item.label} className="luxury-card p-7 text-center">
                  {cardContent}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/properties" onClick={() => window.scrollTo(0, 0)}>
              <button className="btn-gold px-10 py-4 text-xs flex items-center gap-2 mx-auto">
                Browse Properties
                <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
