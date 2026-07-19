"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, align = "center", className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "flex flex-col gap-2.5 sm:gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <span className="rounded-full bg-leaf/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest sm:px-4 sm:py-1.5 sm:text-xs">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display max-w-2xl text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-xl font-accent text-sm font-medium leading-relaxed text-ink/70 sm:text-base">{description}</p>
      )}
    </motion.div>
  );
}
