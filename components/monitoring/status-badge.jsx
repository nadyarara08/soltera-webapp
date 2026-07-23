import { cn } from "@/lib/utils";

// Dipakai saat badge diberi prop `severity` (mis. status gas 5-tingkat)
// alih-alih boolean `active` biasa.
const SEVERITY_STYLES = {
  safe: { pill: "bg-leaf/20 text-forest", dot: "bg-forest" },
  caution: { pill: "bg-sun/40 text-ink/80", dot: "bg-sun" },
  warning: { pill: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  critical: { pill: "bg-red-50 text-red-700", dot: "bg-red-500" },
  unknown: { pill: "bg-ink/10 text-ink/50", dot: "bg-ink/30" },
};

/**
 * Props:
 *  - active/neutral: dipakai badge biner lama (cooling, battery, suhu, dst).
 *  - severity: opsional — "safe" | "caution" | "warning" | "critical" | "unknown".
 *              Kalau diisi, ini menggantikan warna dari `active` (dipakai
 *              badge gas yang punya 5 tingkat, bukan cuma aman/tidak).
 */
export function StatusBadge({ label, active = true, neutral = false, severity }) {
  const styles = severity ? SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.unknown : null;

  const pillClass = neutral
    ? "bg-ink/10 text-ink/50"
    : styles
    ? styles.pill
    : active
    ? "bg-leaf/20 text-forest"
    : "bg-sun/40 text-ink/70";

  const dotClass = neutral ? "bg-ink/30" : styles ? styles.dot : active ? "bg-forest" : "bg-ink/30";

  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold", pillClass)}>
      <span className={cn("h-2 w-2 rounded-full", dotClass)} />
      {label}
    </span>
  );
}
