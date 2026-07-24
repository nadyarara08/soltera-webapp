"use client";

import { motion } from "framer-motion";
import { Target, HeartHandshake, FlaskConical, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";

const DOCS = [
  {
    icon: Target,
    title: "Tujuan Penelitian",
    summary:
      "Merancang wadah simpan dingin portabel bertenaga surya yang mampu menjaga suhu dan kelembapan optimal untuk komoditas hortikultura pascapanen.",
    detail:
      "SOLTERA dikembangkan untuk menjawab kebutuhan petani skala kecil akan solusi penyimpanan dingin yang terjangkau, tidak bergantung pada listrik PLN, dan dapat dipantau dari jarak jauh melalui platform digital.",
  },
  {
    icon: HeartHandshake,
    title: "Manfaat",
    summary:
      "Menekan food loss pascapanen, memperpanjang umur simpan hasil tani, dan membuka akses monitoring kualitas penyimpanan secara real-time.",
    detail:
      "Selain menekan kerugian ekonomi petani, SOLTERA juga berkontribusi pada efisiensi energi karena sepenuhnya mengandalkan tenaga surya, serta mengurangi jejak karbon dibanding sistem pendingin konvensional berbasis kompresor.",
  },
  {
    icon: FlaskConical,
    title: "Hasil Pengujian",
    summary:
      "Uji lapangan menunjukkan modul Peltier mampu menurunkan suhu ruang simpan secara stabil dengan konsumsi daya yang efisien dari panel surya.",
    detail:
      "Pengujian dilakukan pada beberapa komoditas hortikultura dengan mencatat suhu, kelembapan, dan tegangan baterai secara berkala. Hasil awal menunjukkan perpanjangan masa segar dibanding penyimpanan tanpa pendinginan aktif.",
  },
];

export function ResearchDocumentation() {
  return (
    <section id="documentation" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Research Documentation"
          title="Ringkasan penelitian di balik SOLTERA"
       />

        <div className="mt-8 grid grid-cols-1 gap-4 lg:mt-14 lg:grid-cols-3 lg:gap-5">
          {DOCS.map((doc, i) => (
            <motion.div
              key={doc.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="flex h-full flex-col p-4 sm:p-7">
                <CardHeader className="p-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/10 text-forest sm:h-11 sm:w-11 sm:rounded-2xl">
                    <doc.icon size={18} className="sm:hidden" />
                    <doc.icon size={20} className="hidden sm:block" />
                  </div>
                  <CardTitle className="mt-3 text-base sm:mt-4 sm:text-lg">{doc.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col p-0 pt-3 sm:pt-4">
                  <p className="flex-1 font-accent text-xs font-medium leading-relaxed text-ink/70 sm:text-sm">{doc.summary}</p>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="mt-5 w-fit px-0 text-forest">
                        Baca selengkapnya <ArrowUpRight size={14} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{doc.title}</DialogTitle>
                        <DialogDescription>{doc.detail}</DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
