"use client";

// lib/use-sensor-data.js
//
// Subscribes to the Firebase Realtime Database path "sensor_data" and
// keeps two things in React state:
//   1. `latest`   — the most recent reading, used by the live cards
//   2. `history`  — a capped rolling buffer of readings, used by the
//                    Recharts graphs in Historical Analytics
//
// The ESP32 firmware overwrites sensor_data/* on every publish rather
// than pushing new child nodes, so we build the history client-side by
// appending each update we receive while the dashboard is open. Swap
// the `ref(db, "sensor_data")` path for a "sensor_history" list node
// if you later log readings server-side instead.

import { useEffect, useRef, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

const MAX_HISTORY_POINTS = 60;

const FALLBACK_READING = {
  battery_voltage: "0.00",
  fan_status: "OFF",
  humidity: "0.00",
  mq135_ppm: "0.00",
  peltier_status: "OFF",
  temperature: "0.00",
  timestamp: 0,
};

export function useSensorData() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("connecting"); // connecting | live | error
  const hasReceivedFirst = useRef(false);

  useEffect(() => {
    const sensorRef = ref(db, "sensor_data");

    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        hasReceivedFirst.current = true;
        setStatus("live");
        setLatest(data);

        setHistory((prev) => {
          const point = {
            time: new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            temperature: Number(data.temperature) || 0,
            humidity: Number(data.humidity) || 0,
            battery_voltage: Number(data.battery_voltage) || 0,
            mq135_ppm: Number(data.mq135_ppm) || 0,
          };
          const next = [...prev, point];
          return next.length > MAX_HISTORY_POINTS
            ? next.slice(next.length - MAX_HISTORY_POINTS)
            : next;
        });
      },
      (error) => {
        console.error("Firebase sensor_data listener error:", error);
        setStatus("error");
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    latest: latest ?? FALLBACK_READING,
    history,
    status,
    isLive: status === "live",
  };
}

/**
 * Derive human-readable system status flags from a raw reading.
 * Kept separate from the hook so it's easy to unit test or reuse
 * (e.g. for a status summary in the navbar).
 */
export function deriveSystemStatus(reading) {
  const temp = Number(reading?.temperature);
  const battery = Number(reading?.battery_voltage);
  const gas = Number(reading?.mq135_ppm);

  return {
    cooling: {
      active: reading?.peltier_status === "ON",
      label: reading?.peltier_status === "ON" ? "Cooling Active" : "Cooling Idle",
    },
    battery: {
      healthy: Number.isFinite(battery) && battery >= 3.3,
      label: Number.isFinite(battery) && battery >= 3.3 ? "Battery Healthy" : "Battery Low",
    },
    gas: {
      safe: Number.isFinite(gas) && gas < 1000,
      label: Number.isFinite(gas) && gas < 1000 ? "Safe Gas Level" : "Gas Level Elevated",
    },
    temperature: {
      inRange: Number.isFinite(temp) && temp <= 32,
      label: Number.isFinite(temp) && temp <= 32 ? "Temperature Nominal" : "Temperature High",
    },
  };
}
