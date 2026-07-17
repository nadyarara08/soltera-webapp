import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes safely, resolving conflicting utility classes.
 * Used across every UI component in components/ui.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a Firebase "timestamp" (in this project it's a running uptime
 * counter from the ESP32, not a unix epoch) into a readable label.
 * Falls back gracefully if the value is missing or malformed.
 */
export function formatUptime(seconds) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s < 0) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}
