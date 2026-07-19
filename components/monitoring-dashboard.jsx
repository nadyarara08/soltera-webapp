"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Thermometer,
  Droplets,
  BatteryFull,
  SunMedium,
  Fan,
  Wind,
  Radio,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { SensorCard } from "@/components/monitoring/sensor-card";
import { StatusBadge } from "@/components/monitoring/status-badge";
import { useSensorData, deriveSystemStatus } from "@/lib/use-sensor-data";
import { useToast } from "@/components/ui/toast";

export function MonitoringDashboard() {
  const { latest, status, isLive } = useSensorData();
  const { toast } = useToast();
  const derived = deriveSystemStatus(latest);
  const prevStatus = useRef(status);

  useEffect(() => {
    if (prevStatus.current !== status) {
      if (status === "live") {
        toast({
          title: "Terhubung ke Firebase",
          description: "Data sensor SOLTERA kini diperbarui secara real-time.",
          variant: "success",
        });
      } else if (status === "error") {
        toast({
          title: "Koneksi realtime terputus",
          description: "Menampilkan data terakhir yang tersedia.",
          variant: "warning",
        });
      }
      prevStatus.current = status;
    }
  }, [status, toast]);

  return (
    <section id="monitoring" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Live Monitoring"
            title="Kondisi ruang simpan, dipantau detik demi detik"
            description="Data langsung dari sensor ESP32 melalui Firebase Realtime Database — tanpa perlu refresh halaman."
            className="sm:items-start sm:text-left"
          />
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-ink/60 shadow-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                isLive ? "bg-leaf animate-pulse-soft" : "bg-ink/20"
              }`}
            />
            {isLive ? "Realtime · Terhubung" : "Menunggu koneksi…"}
          </div>
        </div>

        {/* system status pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <StatusBadge label={derived.cooling.label} active={derived.cooling.active} />
          <StatusBadge label={derived.battery.label} active={derived.battery.healthy} />
          <StatusBadge label={derived.gas.label} active={derived.gas.safe} />
          <StatusBadge label={derived.temperature.label} active={derived.temperature.inRange} />
        </motion.div>

        {/* live sensor cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          <SensorCard
            icon={Thermometer}
            label="Suhu Ruang Simpan"
            value={latest.temperature}
            unit="°C"
            tone="forest"
            healthy={derived.temperature.inRange}
          />
          <SensorCard
            icon={Droplets}
            label="Kelembapan"
            value={latest.humidity}
            unit="%"
            tone="leaf"
          />
          <SensorCard
            icon={BatteryFull}
            label="Tegangan Baterai"
            value={latest.battery_voltage}
            unit="V"
            tone="sun"
            healthy={derived.battery.healthy}
          />
          <SensorCard
            icon={SunMedium}
            label="Status Peltier"
            value={latest.peltier_status}
            unit=""
            tone="forest"
            healthy={derived.cooling.active}
          />
          <SensorCard
            icon={Fan}
            label="Status Kipas"
            value={latest.fan_status}
            unit=""
            tone="leaf"
          />
          <SensorCard
            icon={Wind}
            label="Kualitas Udara (MQ135)"
            value={latest.mq135_ppm}
            unit="ppm"
            tone="neutral"
            healthy={derived.gas.safe}
          />
        </div>
      </div>
    </section>
  );
}
