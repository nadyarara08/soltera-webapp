"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * A single live-metric card for the monitoring dashboard.
 *
 * Props:
 *  - icon: Lucide icon component
 *  - label: e.g. "Suhu Ruang Simpan"
 *  - value: current numeric/string reading
 *  - unit: e.g. "°C"
 *  - tone: "forest" | "leaf" | "sun" | "neutral" — accent color
 *  - healthy: optional boolean to tint the value red/green
 */
export function SensorCard({ icon: Icon, label, value, unit, tone = "forest", healthy }) {
  const toneStyles = {
    forest: "bg-forest/10 text-forest",
    leaf: "bg-leaf/20 text-forest",
    sun: "bg-sun/40 text-ink",
    neutral: "bg-ink/5 text-ink",
  };

  return (
    <Card className="relative overflow-hidden p-6">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            toneStyles[tone]
          )}
        >
          {Icon && <Icon size={20} />}
        </div>
        {healthy !== undefined && (
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              healthy ? "bg-leaf animate-pulse-soft" : "bg-sun animate-pulse-soft"
            )}
            aria-hidden="true"
          />
        )}
      </div>

      <p className="mt-4 text-sm font-medium text-ink/55">{label}</p>

      <AnimatePresence mode="popLayout">
        <motion.p
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="font-display mt-1 text-3xl font-bold text-ink"
        >
          {value}
          <span className="ml-1 text-base font-medium text-ink/40">{unit}</span>
        </motion.p>
      </AnimatePresence>
    </Card>
  );
}
