"use client";

import { motion } from "framer-motion";
import { TrendingDown, ThermometerSun, Wallet, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CountUp } from "@/components/shared/count-up";
import { SectionHeading } from "@/components/shared/section-heading";

const STATS = [
  {
    icon: Percent,
    value: 45,
    suffix: "%",
    label: "Buah dan sayur di Asia Pasifik hilang atau terbuang sebelum sampai ke konsumen",
    source: "FAO, kajian rantai pasok hortikultura",
  },
  {
    icon: TrendingDown,
    value: 31,
    suffix: "%",
    label: "Total food loss dan food waste hortikultura Indonesia dari panen hingga meja makan",
    source: "Kementan & BRIN",
  },
  {
    icon: ThermometerSun,
    value: 60,
    suffix: "%",
    label: "Kerugian pascapanen dipicu buruknya rantai dingin dan penyimpanan konvensional",
    source: "Tinjauan pascapanen nasional",
  },
  {
    icon: Wallet,
    value: 150,
    suffix: " kg",
    label: "Food loss & waste per kapita per tahun yang tercatat pada periode 2000–2019",
    source: "Bappenas",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-telor py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Masalah"
          title="Food loss hortikultura masih jadi kebocoran besar di rantai pangan"
          description="Tanpa penyimpanan dingin yang terjangkau dan termonitor, hasil panen petani skala kecil rusak jauh sebelum sampai ke pasar."
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:mt-14 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <Card className="h-full p-3.5 transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(31,46,18,0.14)] sm:p-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-forest/10 text-forest sm:h-11 sm:w-11 sm:rounded-2xl">
                  <stat.icon size={16} className="sm:hidden" />
                  <stat.icon size={20} className="hidden sm:block" />
                </div>
                <p className="font-display mt-3 text-2xl font-extrabold text-ink sm:mt-5 sm:text-4xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 font-serif text-xs font-medium leading-snug text-ink/70 sm:mt-3 sm:text-sm sm:leading-relaxed">{stat.label}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-ink/40 sm:mt-4 sm:text-xs">
                  {stat.source}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
