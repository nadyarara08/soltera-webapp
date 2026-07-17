"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Brief-specified chart color mapping: Forest = suhu, Leaf = kelembapan,
// Terracotta/Orange = baterai.
const METRIC_COLORS = {
  temperature: "#416D19", // Forest
  humidity: "#9BCF53", // Leaf
  battery_voltage: "#D97B3F", // Terracotta/orange
  mq135_ppm: "#C9A227",
};

const METRIC_LABELS = {
  temperature: "Suhu (°C)",
  humidity: "Kelembapan (%)",
  battery_voltage: "Tegangan Baterai (V)",
  mq135_ppm: "Kualitas Udara (ppm)",
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-ink px-4 py-3 text-xs text-white shadow-lg">
      <p className="mb-1 font-semibold text-white/70">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {METRIC_LABELS[entry.dataKey] ?? entry.dataKey}: {entry.value}
        </p>
      ))}
    </div>
  );
}

/**
 * Renders one historical metric as a smooth area chart.
 *
 * Props:
 *  - data: array of { time, temperature, humidity, battery_voltage, mq135_ppm }
 *  - metricKey: which field of `data` to plot
 *  - title / description: card copy
 */
export function SensorChart({ data, metricKey, title, description, unit = "" }) {
  const color = METRIC_COLORS[metricKey] ?? "#416D19";
  const gradientId = `gradient-${metricKey}`;

  return (
    <Card className="p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-ink/40">
            Menunggu data sensor pertama…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,46,18,0.08)" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "#1F2E12", opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#1F2E12", opacity: 0.5 }}
                tickLine={false}
                axisLine={false}
                width={36}
                unit={unit}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey={metricKey}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                isAnimationActive
                animationDuration={400}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
