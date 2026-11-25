import { Link } from "wouter";

export default function Footer() {
  return (
    <footer
      style={{
        background: "oklch(6% 0 0)",
        borderTop: "1px solid oklch(22% 0.02 85)",
      }}
    >
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-center md:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/manus-storage/logov1_1b9a5dd0.webp"
                alt="Michael Mackenzie"
                className="rounded-full"
                style={{ height: "50px", width: "50px", objectFit: "cover", flexShrink: 0 }}
              />
              <div>
                <div
                  className="brand-heading text-sm"
                  style={{
                    background: "linear-gradient(135deg, oklch(75% 0.13 88) 0%, oklch(52% 0.10 75) 50%, oklch(75% 0.13 88) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Michael Mackenzie
                </div>
                <div
                  className="brand-subheading"
                  style={{ color: "oklch(71% 0.01 90)", fontSize: "0.55rem", letterSpacing: "0.25em" }}
                >
                  International
                </div>
              </div>
            </div>
            <p
              style={{
                color: "oklch(71% 0.01 90)",
                fontSize: "0.8rem",
                lineHeight: "1.8",
                fontFamily: "'Josefin Sans', sans-serif",
                fontWeight: 300,
              }}
            >
              Refined. Considered. Exceptional.
              <br />
              Premium property investment for discerning clients.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center md:items-start">
            <h4
              className="brand-subheading mb-5"
              style={{ color: "oklch(70% 0.12 85)", fontSize: "0.6rem", letterSpacing: "0.25em" }}
            >
              Navigation
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Home", href: "/" },
                { label: "Properties", href: "/properties" },
                { label: "About", href: "/about" },
                { label: "Login", href: "/staff-login" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
                  }}
                  className="no-underline transition-colors duration-200"
                  style={{
                    color: "oklch(71% 0.01 90)",
                    fontSize: "0.75rem",
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontWeight: 300,
                    letterSpacing: "0.1em",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h4
              className="brand-subheading mb-5"
              style={{ color: "oklch(70% 0.12 85)", fontSize: "0.6rem", letterSpacing: "0.25em" }}
            >
              Contact
            </h4>
            <div
              className="flex flex-col gap-2"
              style={{
                color: "oklch(71% 0.01 90)",
                fontSize: "0.75rem",
                fontFamily: "'Josefin Sans', sans-serif",
                fontWeight: 300,
                lineHeight: "1.8",
              }}
            >
              <a href="mailto:info@michaelmackenziegroup.com" className="hover:text-yellow-400 transition-colors duration-200" style={{ textDecoration: "none", color: "oklch(71% 0.01 90)" }}>info@michaelmackenziegroup.com</a>
              <a href="tel:+447345021485" className="hover:text-yellow-400 transition-colors duration-200" style={{ textDecoration: "none", color: "oklch(71% 0.01 90)" }}>+44 (0) 7345 021 485</a>
              <span>Marbella - Algarve - Dubai</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="gold-divider mb-6" />

        <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-3 text-center sm:text-left">
          <p
            style={{
              color: "oklch(71% 0.01 90)",
              fontSize: "0.65rem",
              fontFamily: "'Josefin Sans', sans-serif",
              letterSpacing: "0.1em",
            }}
          >
            © {new Date().getFullYear()} Michael Mackenzie International. All rights reserved.
          </p>
          <p
            style={{
              color: "oklch(71% 0.01 90)",
              fontSize: "0.6rem",
              fontFamily: "'Josefin Sans', sans-serif",
              letterSpacing: "0.1em",
            }}
          >
            Refined. Considered. Exceptional.
          </p>
        </div>
      </div>
    </footer>
  );
}
