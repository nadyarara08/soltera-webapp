import { cn } from "@/lib/utils";

export function StatusBadge({ label, active = true }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold",
        active ? "bg-leaf/20 text-forest" : "bg-sun/40 text-ink/70"
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          active ? "bg-forest" : "bg-ink/30"
        )}
      />
      {label}
    </span>
  );
}
