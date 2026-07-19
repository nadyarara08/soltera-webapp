"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Technology", href: "#technology" },
  { label: "Monitoring", href: "#monitoring" },
  { label: "Documentation", href: "#documentation" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState(NAV_LINKS[0].href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight the nav link whose section is currently in view.
  useEffect(() => {
    const sections = NAV_LINKS
      .map((link) => document.querySelector(link.href))
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`);
          }
        });
      },
      {
        // Treat the middle band of the viewport as the "active" zone.
        rootMargin: "-45% 0px -45% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "bg-cream/85 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.05)]" : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#home" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="SOLTERA"
            className="h-11 w-11 object-contain"
          />
          <span className="font-display text-base font-bold tracking-tight text-ink sm:text-lg">
            Soltera
          </span>
        </a>

        <div className="hidden items-center gap-1 rounded-full bg-white/60 p-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeHref === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-white hover:text-ink",
                  isActive
                    ? "text-ink underline decoration-forest decoration-2 underline-offset-4"
                    : "text-ink/70"
                )}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <button
          className="rounded-full p-2 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Buka menu navigasi"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-col gap-1 bg-cream px-6 pb-6 lg:hidden"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeHref === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white",
                  isActive
                    ? "text-ink underline decoration-forest decoration-2 underline-offset-4"
                    : "text-ink/80"
                )}
              >
                {link.label}
              </a>
            );
          })}
        </motion.div>
      )}
    </header>
  );
}
