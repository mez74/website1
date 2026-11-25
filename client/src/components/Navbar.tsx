import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Properties", href: "/properties" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "oklch(8% 0 0 / 0.95)",
        borderBottom: "1px solid oklch(22% 0.02 85)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="container">
        <div className="flex items-center justify-between h-20 relative">
          {/* Logo and Desktop Text */}
          <div className="flex items-center gap-3">
            {/* Logo - Left */}
            <Link href="/" className="flex-shrink-0 no-underline">
              <img
                src="/manus-storage/logov1_1b9a5dd0.webp"
                alt="Michael Mackenzie"
                className="rounded-full"
                style={{ height: "60px", width: "60px", objectFit: "cover" }}
              />
            </Link>

            {/* Desktop Text - Hidden on mobile */}
            <Link href="/" className="hidden sm:flex flex-col gap-0 no-underline">
              <div
                className="brand-heading text-sm leading-tight"
                style={{ color: "oklch(70% 0.12 85)", fontSize: "0.85rem" }}
              >
                Michael Mackenzie
              </div>
              <div
                className="brand-subheading"
                style={{
                  color: "oklch(95% 0.01 90)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.25em",
                }}
              >
                International
              </div>
            </Link>
          </div>

          {/* Mobile Centered Text */}
          <div className="sm:hidden absolute left-1/2 transform -translate-x-1/2 text-center">
            <div
              className="brand-heading leading-tight"
              style={{ color: "oklch(70% 0.12 85)", fontSize: "0.7rem" }}
            >
              Michael Mackenzie
            </div>
            <div
              className="brand-subheading"
              style={{
                color: "oklch(95% 0.01 90)",
                fontSize: "0.45rem",
                letterSpacing: "0.25em",
              }}
            >
              International
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="brand-subheading no-underline transition-colors duration-200"
                style={{
                  fontSize: "0.65rem",
                  letterSpacing: "0.2em",
                  color:
                    location === link.href
                      ? "oklch(70% 0.12 85)"
                      : "oklch(95% 0.01 90)",
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/properties">
              <button className="btn-gold px-5 py-2 text-xs">
                View Properties
              </button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 flex-shrink-0"
            style={{ color: "oklch(70% 0.12 85)" }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          style={{
            background: "oklch(10% 0 0)",
            borderTop: "1px solid oklch(22% 0.02 85)",
          }}
          className="md:hidden"
        >
          <div className="container py-6 flex flex-col gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="brand-subheading no-underline"
                style={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.2em",
                  color:
                    location === link.href
                      ? "oklch(70% 0.12 85)"
                      : "oklch(75% 0 0)",
                }}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
