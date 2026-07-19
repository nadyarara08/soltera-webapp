"use client";

// lib/use-sensor-history.js
//
// Builds a 24-hour rolling history of sensor readings + a rule-based
// diagnosis of the last 24 hours.
//
// WHY THIS DOESN'T JUST QUERY FIREBASE FOR "THE LAST 24H":
// per use-sensor-data.js, the ESP32 overwrites sensor_data/* in place on
// every publish — there is no history node in the database. And the
// `timestamp` field on each reading is the ESP32's own uptime counter in
// seconds (see utils.js formatUptime), not a real epoch time — so it
// can't be used to filter "last 24 hours" either.
//
// So instead, this hook listens to the exact same live `sensor_data`
// node useSensorData() does, stamps each reading with the *browser's*
// wall-clock time when it arrives, and persists a rolling 24-hour window
// to localStorage. That means:
//   - History survives page reloads (unlike the in-memory 60-point
//     buffer in useSensorData(), which resets every time the dashboard
//     is closed).
//   - It only accumulates while at least one browser tab has this
//     dashboard open at some point during the day — there's no backend
//     job logging snapshots while nobody is watching.
//
// For "always-on" history that keeps growing with zero browsers open,
// log snapshots to Firebase instead — either have the ESP32 firmware
// push timestamped entries to a sensor_data/history node itself (needs
// real time via NTP on the device), or add a small scheduled Cloud
// Function that snapshots sensor_data periodically. Ask if you want
// help wiring either of those up.

import { useEffect, useMemo, useRef, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { analyzeSensorHistory } from "@/lib/sensor-diagnosis";

const STORAGE_KEY = "soltera_sensor_history_24h";
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 jam
const SAMPLE_INTERVAL_MS = 5 * 60 * 1000; // simpan 1 titik tiap 5 menit — ubah sesuai kebutuhan

function loadStoredHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Gagal membaca riwayat sensor dari localStorage:", err);
    return [];
  }
}

function saveStoredHistory(entries) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn("Gagal menyimpan riwayat sensor ke localStorage:", err);
  }
}

function pruneToWindow(entries, now) {
  const since = now - WINDOW_MS;
  return entries.filter((e) => e.timestamp >= since);
}

export function useSensorHistory24h() {
  const [history, setHistory] = useState(() => pruneToWindow(loadStoredHistory(), Date.now()));
  const [loading, setLoading] = useState(true);
  const lastSampledAt = useRef(0);

  // Seed the throttle timer from whatever was already stored, so
  // reopening the dashboard doesn't immediately log a duplicate point.
  useEffect(() => {
    if (history.length > 0) {
      lastSampledAt.current = history[history.length - 1].timestamp;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sensorRef = ref(db, "sensor_data");

    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        const data = snapshot.val();
        setLoading(false);
        if (!data) return;

        const now = Date.now();
        if (now - lastSampledAt.current < SAMPLE_INTERVAL_MS) return; // throttle
        lastSampledAt.current = now;

        const point = {
          timestamp: now,
          time: new Date(now).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          temperature: Number(data.temperature) || 0,
          humidity: Number(data.humidity) || 0,
          battery_voltage: Number(data.battery_voltage) || 0,
          mq135_ppm: Number(data.mq135_ppm) || 0,
          peltier_status: data.peltier_status ?? null,
          fan_status: data.fan_status ?? null,
        };

        setHistory((prev) => {
          const next = pruneToWindow([...prev, point], now);
          saveStoredHistory(next);
          return next;
        });
      },
      (error) => {
        console.error("Firebase sensor_data listener error (history):", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Re-prune every minute even without new readings, so old points still
  // age out of the 24-hour window while the dashboard sits open.
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory((prev) => {
        const next = pruneToWindow(prev, Date.now());
        if (next.length !== prev.length) saveStoredHistory(next);
        return next;
      });
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const analysis = useMemo(() => analyzeSensorHistory(history), [history]);

  return { history, analysis, loading };
}
