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

// Kalau tidak ada data baru sama sekali dalam 2x24 jam, anggap perangkat
// offline meski listener Firebase-nya sendiri masih "terhubung" — ini
// menangkap kasus ESP32 mati/putus tapi koneksi browser ke Firebase baik-baik saja.
const STALE_THRESHOLD_MS = 2 * 24 * 60 * 60 * 1000; // 2x24 jam
const STALE_CHECK_INTERVAL_MS = 5 * 60 * 1000; // cek tiap 5 menit, cukup untuk jendela 48 jam

const FALLBACK_READING = {
  battery_voltage: "0.00",
  fan_status: "OFF",
  humidity: "0.00",
  mq135_raw: "0.00",
  peltier_status: "OFF",
  temperature: "0.00",
  timestamp: 0,
};

export function useSensorData() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("connecting"); // connecting | live | error | offline
  const hasReceivedFirst = useRef(false);
  const lastUpdatedAtRef = useRef(null);

  useEffect(() => {
    const sensorRef = ref(db, "sensor_data");

    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        hasReceivedFirst.current = true;
        lastUpdatedAtRef.current = Date.now();
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
            mq135_raw: Number(data.mq135_raw) || 0,
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

    // Cek berkala apakah data sudah "basi" (tidak update >2x24 jam).
    // Kalau data baru masuk lagi, callback onValue di atas otomatis
    // mereset status ke "live", jadi ini self-healing.
    const staleCheck = setInterval(() => {
      if (
        hasReceivedFirst.current &&
        lastUpdatedAtRef.current &&
        Date.now() - lastUpdatedAtRef.current > STALE_THRESHOLD_MS
      ) {
        setStatus("offline");
      }
    }, STALE_CHECK_INTERVAL_MS);

    return () => {
      unsubscribe();
      clearInterval(staleCheck);
    };
  }, []);

  return {
    latest: latest ?? FALLBACK_READING,
    history,
    status,
    isLive: status === "live",
    // true kalau koneksi Firebase error ATAU perangkat sudah >2x24 jam tidak kirim data
    isOffline: status === "error" || status === "offline",
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
  const gas = Number(reading?.mq135_raw);
  const humidity = Number(reading?.humidity);

  return {
    cooling: {
      active: reading?.peltier_status === "ON",
      label: reading?.peltier_status === "ON" ? "Cooling Active" : "Cooling Idle",
    },
    battery: {
      healthy: Number.isFinite(battery) && battery >= 3.3,
      label: Number.isFinite(battery) && battery >= 3.3 ? "Battery Healthy" : "Battery Low",
    },
    // Tidak ada klasifikasi/threshold di sini — gas cuma ditampilkan sebagai
    // nilai mentah dari sensor MQ135, tanpa prediksi "normal/meningkat/tinggi".
    gas: {
      value: Number.isFinite(gas) ? gas : null,
      label: Number.isFinite(gas) ? "Intensitas Gas (Raw)" : "Data Gas Tidak Tersedia",
    },
    // Normal jika suhu ≤ 35°C — di atas itu dianggap tidak normal (kepanasan).
    temperature: {
      inRange: Number.isFinite(temp) && temp <= 35,
      label: Number.isFinite(temp) && temp <= 35 ? "Temperature Normal" : "Temperature Tidak Normal",
    },
    // Normal jika kelembapan ≤ 70% — di atas itu dianggap tidak normal (terlalu lembap).
    humidity: {
      inRange: Number.isFinite(humidity) && humidity <= 70,
      label: Number.isFinite(humidity) && humidity <= 70 ? "Humidity Normal" : "Humidity Tidak Normal",
    },
    fan: {
      active: reading?.fan_status === "ON",
      label: reading?.fan_status === "ON" ? "Fan Active" : "Fan Idle",
    },
  };
}