"use client";

import { motion } from "framer-motion";
import { Sun, Zap, Radio, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";

const FEATURES = [
  {
    icon: Sun,
    title: "Solar Powered",
    description:
      "Panel surya dan baterai memberi pasokan listrik mandiri, cocok untuk lahan tani tanpa akses PLN yang stabil.",
    tone: "bg-sun/40 text-ink",
  },
  {
    icon: Zap,
    title: "Termoelektrik / Peltier",
    description:
      "Modul Peltier mendinginkan tanpa kompresor atau refrigeran, lebih ringan, senyap, dan minim perawatan.",
    tone: "bg-forest/10 text-forest",
  },
  {
    icon: Radio,
    title: "IoT Monitoring",
    description:
      "ESP32 mengirim data suhu, kelembapan, dan energi ke Firebase secara real-time, terpantau dari mana saja.",
    tone: "bg-leaf/25 text-forest",
  },
  {
    icon: Package,
    title: "Portabel & Terjangkau",
    description:
      "Ukuran ringkas dan biaya produksi rendah membuat SOLTERA relevan untuk petani hortikultura skala kecil.",
    tone: "bg-ink/5 text-ink",
  },
];

export function SolutionSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Solusi"
          title="SOLTERA: penyimpanan dingin cerdas yang dirancang untuk petani"
          description="Menggabungkan energi surya, pendinginan termoelektrik, dan monitoring IoT dalam satu unit yang mudah dioperasikan."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="h-full"
            >
              <Card className="flex h-full flex-col gap-4 p-7">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${f.tone}`}>
                  <f.icon size={22} />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink">{f.title}</h3>
                <p className="text-sm leading-relaxed text-ink/60">{f.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
