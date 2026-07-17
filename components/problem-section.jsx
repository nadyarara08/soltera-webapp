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
    <section className="bg-telor py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Masalah"
          title="Food loss hortikultura masih jadi kebocoran besar di rantai pangan"
          description="Tanpa penyimpanan dingin yang terjangkau dan termonitor, hasil panen petani skala kecil rusak jauh sebelum sampai ke pasar."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <Card className="h-full p-6 transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(31,46,18,0.14)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/10 text-forest">
                  <stat.icon size={20} />
                </div>
                <p className="font-display mt-5 text-4xl font-extrabold text-ink">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{stat.label}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink/35">
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
