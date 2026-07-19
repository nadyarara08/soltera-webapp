"use client";

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

export function TechnologySection() {
  return (
    <section id="technology" className="bg-mist py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Teknologi"
          title="Satu alur data, dari matahari sampai layar Anda"
          description="Setiap komponen bekerja berurutan untuk mengubah energi surya menjadi ruang dingin yang termonitor secara real-time."
        />

        <div className="relative mt-16">
          {/* connective line (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-11 hidden h-px lg:block">
            <svg width="100%" height="2" className="overflow-visible">
              <line
                x1="0"
                y1="1"
                x2="100%"
                y2="1"
                stroke="#416D19"
                strokeOpacity="0.25"
                strokeWidth="2"
                strokeDasharray="8 8"
                className="animate-flow"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-10 lg:grid-cols-6">
            {FLOW.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex flex-col items-center gap-3 text-center"
              >
                <div className="relative z-10 flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:h-[88px] sm:w-[88px] sm:rounded-3xl">
                  <step.icon size={20} className="text-forest sm:hidden" />
                  <step.icon size={26} className="hidden text-forest sm:block" />
                  <span className="mt-1 text-[9px] font-semibold text-ink/35 sm:text-[10px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="font-display text-xs font-semibold text-ink sm:text-sm">{step.label}</p>
                <p className="hidden max-w-[9.5rem] font-serif text-xs font-medium leading-relaxed text-ink/65 sm:block">{step.note}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
