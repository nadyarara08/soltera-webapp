"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-28 pb-14 lg:pt-44 lg:pb-32">
      {/* ambient background accents */}
      <div className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-leaf/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-[-10%] h-[320px] w-[320px] rounded-full bg-sun/25 blur-3xl" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-start gap-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-forest shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sun/60 text-ink">
              <Sun size={12} />
            </span>
            Solar &amp; Termoelektrik untuk Agrikultur
          </span>

          <h1 className="font-display text-4xl font-extrabold leading-[1.08] text-ink sm:text-5xl lg:text-[3.4rem]">
            SOLTERA — Smart Solar Cold Storage for Fresh Agriculture
          </h1>

          <p className="max-w-lg font-accent text-base font-medium leading-relaxed text-ink/70 sm:text-lg">
            Wadah simpan dingin cerdas bertenaga surya yang menekan food loss
            komoditas hortikultura pascapanen, lengkap dengan monitoring suhu,
            kelembapan, dan energi secara real-time.
          </p>

          <div className="-mt-2 flex items-center gap-5 text-sm font-medium text-ink/50">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-leaf" />
              100% Solar Powered
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-forest" />
              Realtime IoT Monitoring
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="primary">
              <a href="#monitoring" className="flex items-center gap-2">
                Live Dashboard <ArrowRight size={16} />
              </a>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto hidden w-full max-w-md lg:block"
        >
          <SolteraDeviceIllustration />
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Signature visual: the SOLTERA brand logo, standing in for a product
 * render. Floats gently to suggest "live" hardware.
 */
function SolteraDeviceIllustration() {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="relative"
    >
      <img
        src="/logo.png"
        alt="SOLTERA"
        className="mx-auto w-full max-w-md drop-shadow-[0_30px_40px_rgba(31,46,18,0.18)]"
      />
    </motion.div>
  );
}