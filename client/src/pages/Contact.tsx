import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapPin, Phone, Mail, Linkedin, Twitter, Facebook, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const submitInquiry = trpc.contact.submitInquiry.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      await submitInquiry.mutateAsync({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message,
      });

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Reset success message after 3 seconds
      setTimeout(() => setSubmitStatus("idle"), 3000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
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
            private enquiries
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
              contact
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
              us
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
            continuing a tradition of excellence
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
            Securing your future with the same dedication and integrity that defines our family's own heritage.
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

      {/* Built on Legacy Section */}
      <section style={{ paddingTop: "80px", paddingBottom: "80px", background: "oklch(8% 0 0)" }}>
        <div className="container">
          <div className="flex justify-center">
            {/* Centered Decorative Panel */}
            <div className="relative h-full" style={{ maxWidth: "500px", width: "100%" }}>
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
                <div
                  className="absolute inset-0"
                  style={{
                    background: "oklch(8% 0 0 / 0.6)",
                  }}
                />
                <div className="relative z-10">
                  <img
                    src="/manus-storage/Screenshot2026-07-30142351_2872c458.png"
                    alt="Franco Meza"
                    className="rounded-full mx-auto mb-6"
                    style={{ width: "80px", height: "80px", objectFit: "cover", objectPosition: "center" }}
                  />

                  <h2
                    className="brand-heading mb-4 text-center"
                    style={{
                      fontSize: "1.5rem",
                      color: "oklch(95% 0.01 90)",
                      textAlign: "center",
                    }}
                  >
                    Send us a Message
                  </h2>
                  <div className="gold-divider mb-8" />

                  <form id="contact-form" onSubmit={handleSubmit} className="w-full">
                    {/* Full Name */}
                    <div className="mb-6">
                      <label
                        style={{
                          color: "oklch(70% 0.12 85)",
                          fontSize: "0.9rem",
                          letterSpacing: "0.1em",
                          display: "block",
                          textAlign: "center",
                          marginBottom: "8px",
                        }}
                      >
                        FULL NAME *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "oklch(10% 0 0)",
                          border: "1px solid oklch(70% 0.12 85 / 0.3)",
                          color: "oklch(75% 0 0)",
                          fontSize: "0.95rem",
                          textAlign: "center",
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div className="mb-6">
                      <label
                        style={{
                          color: "oklch(70% 0.12 85)",
                          fontSize: "0.9rem",
                          letterSpacing: "0.1em",
                          display: "block",
                          textAlign: "center",
                          marginBottom: "8px",
                        }}
                      >
                        EMAIL ADDRESS *
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "oklch(10% 0 0)",
                          border: "1px solid oklch(70% 0.12 85 / 0.3)",
                          color: "oklch(75% 0 0)",
                          fontSize: "0.95rem",
                          textAlign: "center",
                        }}
                      />
                    </div>

                    {/* Phone */}
                    <div className="mb-6">
                      <label
                        style={{
                          color: "oklch(70% 0.12 85)",
                          fontSize: "0.9rem",
                          letterSpacing: "0.1em",
                          display: "block",
                          textAlign: "center",
                          marginBottom: "8px",
                        }}
                      >
                        TELEPHONE
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+44 (0) 20 0000 0000"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "oklch(10% 0 0)",
                          border: "1px solid oklch(70% 0.12 85 / 0.3)",
                          color: "oklch(75% 0 0)",
                          fontSize: "0.95rem",
                          textAlign: "center",
                        }}
                      />
                    </div>

                    {/* Subject */}
                    <div className="mb-6">
                      <label
                        style={{
                          color: "oklch(70% 0.12 85)",
                          fontSize: "0.9rem",
                          letterSpacing: "0.1em",
                          display: "block",
                          textAlign: "center",
                          marginBottom: "8px",
                        }}
                      >
                        SUBJECT *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        placeholder="What is this regarding?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "oklch(10% 0 0)",
                          border: "1px solid oklch(70% 0.12 85 / 0.3)",
                          color: "oklch(75% 0 0)",
                          fontSize: "0.95rem",
                          textAlign: "center",
                        }}
                      />
                    </div>

                    {/* Message */}
                    <div className="mb-8">
                      <label
                        style={{
                          color: "oklch(70% 0.12 85)",
                          fontSize: "0.9rem",
                          letterSpacing: "0.1em",
                          display: "block",
                          textAlign: "center",
                          marginBottom: "8px",
                        }}
                      >
                        MESSAGE *
                      </label>
                      <textarea
                        name="message"
                        placeholder="Tell us more about your inquiry..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "oklch(10% 0 0)",
                          border: "1px solid oklch(70% 0.12 85 / 0.3)",
                          color: "oklch(75% 0 0)",
                          fontSize: "0.95rem",
                          textAlign: "center",
                          resize: "none",
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: isSubmitting
                          ? "linear-gradient(135deg, oklch(70% 0.12 85 / 0.6), oklch(52% 0.10 75 / 0.6))"
                          : "linear-gradient(135deg, oklch(70% 0.12 85), oklch(52% 0.10 75))",
                        color: "oklch(8% 0 0)",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        border: "none",
                        cursor: isSubmitting ? "not-allowed" : "pointer",
                        fontFamily: "'Josefin Sans', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        opacity: isSubmitting ? 0.8 : 1,
                        transition: "all 0.3s ease",
                      }}
                      className="hover:opacity-90 transition-opacity"
                    >
                      {isSubmitting ? (
                        <>
                          <span
                            style={{
                              display: "inline-block",
                              width: "14px",
                              height: "14px",
                              border: "2px solid oklch(8% 0 0 / 0.3)",
                              borderTop: "2px solid oklch(8% 0 0)",
                              borderRadius: "50%",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                          SENDING...
                        </>
                      ) : (
                        "SEND MESSAGE"
                      )}
                    </button>

                    {/* Success Message */}
                    {submitStatus === "success" && (
                      <div
                        style={{
                          marginTop: "16px",
                          padding: "12px 16px",
                          background: "oklch(12% 0 0)",
                          border: "1px solid oklch(70% 0.12 85)",
                          color: "oklch(95% 0.01 90)",
                          fontSize: "0.85rem",
                          fontFamily: "'Josefin Sans', sans-serif",
                          textAlign: "center",
                          borderRadius: "4px",
                          animation: "fadeIn 0.3s ease-in",
                        }}
                      >
                        ✓ Thank you for your message. A member of our team will be in touch shortly.
                      </div>
                    )}

                    {/* Error Message */}
                    {submitStatus === "error" && (
                      <div
                        style={{
                          marginTop: "16px",
                          padding: "12px 16px",
                          background: "oklch(12% 0 0)",
                          border: "1px solid oklch(70% 0.12 85)",
                          color: "oklch(95% 0.01 90)",
                          fontSize: "0.85rem",
                          fontFamily: "'Josefin Sans', sans-serif",
                          textAlign: "center",
                          borderRadius: "4px",
                        }}
                      >
                        ✗ {errorMessage || "Failed to send message. Please try again."}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section
        style={{
          paddingTop: "80px",
          paddingBottom: "80px",
          background: `url('/manus-storage/Background7resized_c719253d.png'), oklch(8% 0 0)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          position: "relative",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "oklch(8% 0 0 / 0.6)",
          }}
        />
        <div className="container relative z-10">
          <h2
            className="brand-heading mb-8 text-center"
            style={{
              fontSize: "1.5rem",
              color: "oklch(95% 0.01 90)",
            }}
          >
            Our Team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: "Franco Meza",
                title: "Founder & CEO",
                email: "franco@michaelmackenzie.com",
              },
              {
                name: "Sarah Thompson",
                title: "Head of Acquisitions",
                email: "sarah@michaelmackenzie.com",
              },
              {
                name: "James Richardson",
                title: "Investment Advisor",
                email: "james@michaelmackenzie.com",
              },
              {
                name: "Emma Wilson",
                title: "Client Relations",
                email: "emma@michaelmackenzie.com",
              },
            ].map((member, index) => (
              <div
                key={index}
                style={{
                  padding: "16px",
                  background: "oklch(10% 0 0)",
                  border: "1px solid oklch(70% 0.12 85 / 0.3)",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                  transition: "border-color 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "oklch(70% 0.12 85)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "oklch(70% 0.12 85 / 0.3)";
                }}
              >
                <img
                  src="/manus-storage/Screenshot2026-07-30142351_2872c458.png"
                  alt={member.name}
                  style={{
                    width: "80px",
                    height: "80px",
                    minWidth: "80px",
                    borderRadius: "4px",
                    objectFit: "cover",
                    objectPosition: "center top",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      color: "oklch(95% 0.01 90)",
                      fontSize: "1rem",
                      marginBottom: "4px",
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 400,
                    }}
                  >
                    {member.name}
                  </h3>
                  <p
                    style={{
                      color: "oklch(70% 0.12 85)",
                      fontSize: "0.8rem",
                      letterSpacing: "0.1em",
                      marginBottom: "8px",
                      fontWeight: 600,
                    }}
                  >
                    {member.title}
                  </p>
                  <a
                    href={`mailto:${member.email}`}
                    style={{
                      color: "oklch(75% 0 0)",
                      fontSize: "0.85rem",
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontWeight: 300,
                      textDecoration: "none",
                    }}
                    className="hover:text-[oklch(85%_0_0)] transition-colors"
                  >
                    {member.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
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

export default Contact;
