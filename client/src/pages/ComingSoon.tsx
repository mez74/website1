import React, { useState } from "react";
import { Mail, Instagram, Facebook, Linkedin, Twitter } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const subscribeEmail = trpc.emailSubscriptions.subscribe.useMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    subscribeEmail.mutate(
      { email },
      {
        onSuccess: () => {
          setSubmitted(true);
          setEmail("");
          setError("");
          setTimeout(() => setSubmitted(false), 3000);
        },
        onError: (err: any) => {
          setError(err.message || "Failed to subscribe. Please try again.");
        },
      }
    );
  };

  return (
    <section
      className="relative flex items-center justify-center min-h-screen"
      style={{
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

      <div className="container text-center py-32 pt-20 relative z-10 px-4">
        {/* Launching Soon Text */}
        <p
          className="brand-subheading mb-6"
          style={{
            color: "oklch(95% 0.01 90)",
            fontSize: "0.98rem",
            letterSpacing: "0.3em",
          }}
        >
          LAUNCHING SOON
        </p>

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="/manus-storage/logov1_1b9a5dd0.webp"
            alt="Michael Mackenzie"
            className="rounded-full"
            style={{ height: "80px", width: "80px", objectFit: "cover" }}
          />
        </div>

        {/* Main Heading */}
        <h1
          className="brand-heading mb-2"
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
          className="brand-heading mb-8"
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

        {/* Gold divider */}
        <div
          className="max-w-xs mx-auto mb-8"
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, oklch(70% 0.12 85), transparent)",
          }}
        />

        {/* Subheading */}
        <p
          className="brand-subheading mb-4"
          style={{
            color: "oklch(95% 0.01 90)",
            fontSize: "0.7rem",
            letterSpacing: "0.3em",
          }}
        >
          international
        </p>

        {/* Tagline */}
        <p
          style={{
            color: "oklch(71% 0.01 90)",
            fontSize: "1rem",
            fontFamily: "'Josefin Sans', sans-serif",
            fontWeight: 300,
            maxWidth: "480px",
            margin: "0 auto 12px",
            lineHeight: "1.9",
            letterSpacing: "0.04em",
          }}
        >
          Curating the world's most distinguished properties for discerning investors and buyers.
        </p>

        {/* Coming Soon Message */}
        <p
          style={{
            color: "oklch(70% 0.12 85)",
            fontSize: "0.85rem",
            fontFamily: "'Josefin Sans', sans-serif",
            letterSpacing: "0.1em",
            marginBottom: "2rem",
          }}
        >
          With an exclusive collection of luxury properties in Marbella, Algarve, and Dubai.
        </p>

        {/* Email Capture Form */}
        <div className="max-w-md mx-auto mb-12">
          <p
            style={{
              color: "oklch(95% 0.01 90)",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "1rem",
              fontFamily: "'Josefin Sans', sans-serif",
            }}
          >
            Be First to Know
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-transparent border text-[oklch(95%_0.01_90)] placeholder-[oklch(70%_0.12_85_/_0.5)] focus:outline-none transition-colors"
                style={{
                  borderColor: "oklch(70% 0.12 85)",
                  color: "oklch(95% 0.01 90)",
                }}
              />
              <Mail
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                style={{ color: "oklch(70% 0.12 85)" }}
              />
            </div>

            {error && (
              <p style={{ color: "oklch(70% 0.12 85)", fontSize: "0.85rem" }}>
                {error}
              </p>
            )}

            {submitted && (
              <p style={{ color: "oklch(70% 0.12 85)", fontSize: "0.85rem" }}>
                Thank you! Check your email for confirmation.
              </p>
            )}

            <button
              type="submit"
              disabled={subscribeEmail.isPending}
              className="w-full px-4 py-3 border text-[oklch(70%_0.12_85)] hover:bg-[oklch(70%_0.12_85)] hover:text-[oklch(8%_0_0)] transition-all duration-300 font-medium tracking-wide disabled:opacity-50"
              style={{
                borderColor: "oklch(70% 0.12 85)",
                color: "oklch(70% 0.12 85)",
              }}
            >
              {subscribeEmail.isPending ? "Subscribing..." : "Notify Me"}
            </button>
            <p
              style={{
                color: "oklch(65% 0.05 90)",
                fontSize: "0.75rem",
                marginTop: "0.75rem",
              }}
            >
              We'll notify you when we launch. Curated updates only.
            </p>
          </form>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center gap-8">
          <a
            href="#"
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Instagram"
            onClick={(e) => e.preventDefault()}
          >
            <Instagram className="w-5 h-5" style={{ color: "oklch(70% 0.12 85)" }} />
          </a>
          <a
            href="#"
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Facebook"
            onClick={(e) => e.preventDefault()}
          >
            <Facebook className="w-5 h-5" style={{ color: "oklch(70% 0.12 85)" }} />
          </a>
          <a
            href="#"
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="LinkedIn"
            onClick={(e) => e.preventDefault()}
          >
            <Linkedin className="w-5 h-5" style={{ color: "oklch(70% 0.12 85)" }} />
          </a>
          <a
            href="#"
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Twitter"
            onClick={(e) => e.preventDefault()}
          >
            <Twitter className="w-5 h-5" style={{ color: "oklch(70% 0.12 85)" }} />
          </a>
        </div>
      </div>
    </section>
  );
}
