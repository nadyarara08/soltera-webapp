"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  optimal: {
    icon: CheckCircle2,
    badge: "bg-leaf/20 text-forest",
    dot: "bg-forest",
  },
  warning: {
    icon: AlertTriangle,
    badge: "bg-sun/40 text-ink",
    dot: "bg-sun",
  },
  critical: {
    // Tailwind default red — swap for a custom "kritis" token if you have one.
    icon: AlertOctagon,
    badge: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  unknown: {
    icon: HelpCircle,
    badge: "bg-ink/5 text-ink/50",
    dot: "bg-ink/30",
  },
};

function StatCell({ label, value, unit = "" }) {
  return (
    <div className="rounded-xl bg-telor/60 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3">
      <p className="text-[11px] font-semibold text-ink/55 sm:text-xs">{label}</p>
      <p className="font-display mt-1 text-base font-semibold text-ink sm:text-lg">
        {value === null || value === undefined ? "—" : value}
        {value !== null && value !== undefined && unit && (
          <span className="ml-1 text-xs font-semibold text-ink/45 sm:text-sm">{unit}</span>
        )}
      </p>
    </div>
  );
}

/**
 * Explanation panel that turns 24-hour sensor history into a plain-language
 * diagnosis, e.g. "suhu rendah + gas tidak terdeteksi → kondisi optimal".
 *
 * Props:
 *  - analysis: return value of analyzeSensorHistory() from lib/sensor-diagnosis
 *  - loading: boolean
 */
export function HistoryDiagnosisPanel({ analysis, loading }) {
  const status = analysis?.diagnosis?.status ?? "unknown";
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.unknown;
  const Icon = styles.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="p-4 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                styles.badge
              )}
            >
              <Icon size={22} />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-xl font-bold text-ink">
                  {loading ? "Menganalisis data…" : analysis?.diagnosis?.title ?? "Belum Ada Data"}
                </h3>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                    styles.badge
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
                  24 Jam Terakhir
                </span>
              </div>
              <p className="mt-2 max-w-2xl font-serif text-sm font-medium leading-relaxed text-ink/70">
                {loading
                  ? "Mengambil riwayat sensor 24 jam terakhir dari Firebase…"
                  : analysis?.diagnosis?.explanation}
              </p>

              {!loading && analysis?.criticalMoments?.length > 0 && (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <Clock size={13} />
                  {analysis.criticalMoments.length}x kondisi kritis terdeteksi dalam 24 jam terakhir
                  {" · terakhir pukul "}
                  {analysis.criticalMoments[analysis.criticalMoments.length - 1].time}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          <StatCell
            label="Rata-rata Suhu"
            value={analysis?.avgTemperature != null ? analysis.avgTemperature.toFixed(1) : null}
            unit="°C"
          />
          <StatCell
            label="Suhu Min / Maks"
            value={
              analysis?.minTemperature != null && analysis?.maxTemperature != null
                ? `${analysis.minTemperature.toFixed(1)}–${analysis.maxTemperature.toFixed(1)}`
                : null
            }
            unit="°C"
          />
          <StatCell
            label="Rata-rata Kelembapan"
            value={analysis?.avgHumidity != null ? analysis.avgHumidity.toFixed(0) : null}
            unit="%"
          />
          <StatCell
            label="Rata-rata Gas (MQ135)"
            value={analysis?.avgGas != null ? analysis.avgGas.toFixed(0) : null}
            unit="ppm"
          />
          <StatCell label="Gas Terdeteksi" value={analysis?.gasDetectedPercent ?? null} unit="% waktu" />
          <StatCell label="Pendingin Aktif" value={analysis?.coolingActivePercent ?? null} unit="% waktu" />
          <StatCell label="Baterai Sehat" value={analysis?.batteryHealthyPercent ?? null} unit="% waktu" />
          <StatCell label="Jumlah Titik Data" value={analysis?.count ?? 0} unit="titik" />
        </div>

        <p className="mt-4 font-serif text-xs font-medium text-ink/45">
          Diambil dari node Firebase <code className="font-mono">sensor_data</code>, disampel tiap
          beberapa menit dan disimpan lokal di browser ini untuk jendela bergulir 24 jam.
        </p>
      </Card>
    </motion.div>
  );
}
