"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sun, BatteryCharging, Cpu, Gauge, CloudCog, MonitorSmartphone } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";

const FLOW = [
  { icon: Sun, label: "Panel Surya", note: "Menangkap energi matahari" },
  { icon: BatteryCharging, label: "Baterai", note: "Menyimpan & menstabilkan daya" },
  { icon: Cpu, label: "ESP32", note: "Mengontrol Peltier & membaca sensor" },
  { icon: Gauge, label: "Sensor", note: "Suhu, kelembapan, gas, tegangan" },
  { icon: CloudCog, label: "Firebase", note: "Realtime Database sebagai jembatan data" },
  { icon: MonitorSmartphone, label: "Website", note: "Dashboard monitoring live" },
];

// Snake (boustrophedon) placement so the connecting line only ever bends
// straight down or straight across — never diagonally — no matter how many
// columns the grid wraps into. Numbering/labels stay tied to the original
// step order above; only the visual grid slot changes per breakpoint.
//   phone (2 cols):  1 2 / 4 3 / 5 6
//   tablet (3 cols): 1 2 3 / 6 5 4
//   laptop (6 cols): 1 2 3 4 5 6
const ORDER_CLASSES = [
  "order-1 sm:order-1 lg:order-1",
  "order-2 sm:order-2 lg:order-2",
  "order-4 sm:order-3 lg:order-3",
  "order-3 sm:order-6 lg:order-4",
  "order-5 sm:order-5 lg:order-5",
  "order-6 sm:order-4 lg:order-6",
];

export function TechnologySection() {
  const containerRef = useRef(null);
  const iconRefs = useRef([]);
  const [line, setLine] = useState({ d: "", w: 0, h: 0 });

  useEffect(() => {
    function measure() {
      const container = containerRef.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();

      const points = iconRefs.current.map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.left - cRect.left + r.width / 2,
          y: r.top - cRect.top + r.height / 2,
        };
      });
      if (points.some((p) => !p)) return;

      // Build a path that visits every icon center in order. When two
      // consecutive icons sit on the same row it's a straight line; when
      // the layout wraps to a new row (2-col on phones, 3-col on tablets)
      // it draws a smooth rounded bend down into the next row instead of
      // a floating disconnected segment.
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        d += ` Q ${prev.x} ${curr.y} ${curr.x} ${curr.y}`;
      }

      setLine({ d, w: cRect.width, h: cRect.height });
    }

    measure();
    // re-measure once more shortly after mount to account for the
    // entrance animation settling into its final position
    const settle = setTimeout(measure, 650);

    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);

    return () => {
      clearTimeout(settle);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section id="technology" className="bg-mist py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Teknologi"
          title="Satu alur data, dari matahari sampai layar Anda"
          description="Setiap komponen bekerja berurutan untuk mengubah energi surya menjadi ruang dingin yang termonitor secara real-time."
        />

        <div ref={containerRef} className="relative mt-16">
          {/* connecting line: drawn through every icon's real position, so it
              stays connected no matter how many columns the grid wraps into */}
          {line.d && (
            <svg
              className="pointer-events-none absolute left-0 top-0 z-0 overflow-visible"
              width={line.w}
              height={line.h}
              viewBox={`0 0 ${line.w} ${line.h}`}
            >
              <path
                d={line.d}
                fill="none"
                stroke="#416D19"
                strokeOpacity="0.3"
                strokeWidth="2"
                strokeDasharray="8 8"
                strokeLinecap="round"
                className="animate-flow"
              />
            </svg>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-6">
            {FLOW.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative z-10 flex flex-col items-center gap-3 text-center ${ORDER_CLASSES[i]}`}
              >
                <div
                  ref={(el) => (iconRefs.current[i] = el)}
                  className="relative z-10 flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:h-[88px] sm:w-[88px] sm:rounded-3xl"
                >
                  <step.icon size={20} className="text-forest sm:hidden" />
                  <step.icon size={26} className="hidden text-forest sm:block" />
                  <span className="mt-1 text-[9px] font-semibold text-ink/35 sm:text-[10px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="font-display text-xs font-semibold text-ink sm:text-sm">{step.label}</p>
                <p className="hidden max-w-[9.5rem] text-xs leading-relaxed text-ink/55 sm:block">{step.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}