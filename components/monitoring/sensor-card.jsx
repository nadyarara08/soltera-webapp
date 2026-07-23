"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Dot color untuk kartu yang punya 5 tingkat (mis. gas) lewat prop
// `severity`, alih-alih cuma boolean `healthy` (hijau/kuning).
const SEVERITY_DOT = {
  safe: "bg-leaf",
  caution: "bg-sun",
  warning: "bg-orange-500",
  critical: "bg-red-500",
  unknown: "bg-ink/25",
};

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
 *  - severity: optional "safe" | "caution" | "warning" | "critical" | "unknown"
 *              — kalau diisi, ini menggantikan warna dot dari `healthy`
 *              (dipakai kartu gas yang punya 5 tingkat)
 *  - caption: optional short text shown under the value (mis. nama tingkat
 *             gas, "Perlu Diwaspadai")
 *  - stale: optional boolean — when true, dot renders neutral gray
 *           regardless of `healthy`/`severity` (data isn't live anymore)
 */
export function SensorCard({
  icon: Icon,
  label,
  value,
  unit,
  tone = "forest",
  healthy,
  severity,
  caption,
  stale = false,
}) {
  const toneStyles = {
    forest: "bg-forest/10 text-forest",
    leaf: "bg-leaf/20 text-forest",
    sun: "bg-sun/40 text-ink",
    neutral: "bg-ink/5 text-ink",
  };

  const showDot = healthy !== undefined || severity !== undefined || stale;
  const dotClass = stale
    ? "bg-ink/25"
    : severity
    ? SEVERITY_DOT[severity] ?? SEVERITY_DOT.unknown
    : healthy
    ? "bg-leaf"
    : "bg-sun";

  return (
    <Card className="relative overflow-hidden p-3.5 sm:p-6">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl",
            toneStyles[tone]
          )}
        >
          {Icon && (
            <>
              <Icon size={16} className="sm:hidden" />
              <Icon size={20} className="hidden sm:block" />
            </>
          )}
        </div>
        {showDot && (
          <span
            className={cn("h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5", dotClass, !stale && "animate-pulse-soft")}
            aria-hidden="true"
          />
        )}
      </div>

      <p className="mt-2.5 text-xs font-semibold leading-snug text-ink/60 sm:mt-4 sm:text-sm">{label}</p>

      <AnimatePresence mode="popLayout">
        <motion.p
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="font-display mt-1 text-xl font-bold text-ink sm:text-3xl"
        >
          {value}
          <span className="ml-1 text-sm font-semibold text-ink/45 sm:text-base">{unit}</span>
        </motion.p>
      </AnimatePresence>

      {caption && <p className="mt-1 text-[11px] font-semibold text-ink/50 sm:text-xs">{caption}</p>}
    </Card>
  );
}