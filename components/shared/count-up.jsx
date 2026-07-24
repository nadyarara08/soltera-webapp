"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * Animates a number counting up from 0 to `value` once `start` becomes true.
 * `start` should come from the parent's own viewport detection (e.g. a
 * motion.div's onViewportEnter) so there's a single source of truth for
 * "this has scrolled into view" — avoids a second, independently-timed
 * IntersectionObserver racing with the parent's.
 */
export function CountUp({ value, start = false, decimals = 0, suffix = "", prefix = "", className }) {
  const ref = useRef(null);
  const hasAnimated = useRef(false);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 24, stiffness: 90 });

  useEffect(() => {
    if (start && !hasAnimated.current) {
      hasAnimated.current = true;
      motionValue.set(value);
    }
  }, [start, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      }
    });
    return unsubscribe;
  }, [springValue, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}