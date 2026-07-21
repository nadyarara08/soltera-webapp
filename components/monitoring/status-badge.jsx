import { cn } from "@/lib/utils";

export function StatusBadge({ label, active = true, neutral = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold",
        neutral ? "bg-ink/10 text-ink/50" : active ? "bg-leaf/20 text-forest" : "bg-sun/40 text-ink/70"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          neutral ? "bg-ink/30" : active ? "bg-forest" : "bg-ink/30"
        )}
      />
      {label}
    </span>
  );
}
