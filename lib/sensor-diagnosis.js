// lib/sensor-diagnosis.js
//
// Turns 24-hour sensor history into a plain-language diagnosis.
//
// Deliberately reuses deriveSystemStatus() from lib/use-sensor-data.js
// instead of redefining "aman"/"tinggi" thresholds here — that keeps the
// 24-hour verdict permanently in sync with whatever the live dashboard
// cards are showing. Change a threshold once (in deriveSystemStatus) and
// both the live cards and this 24-hour diagnosis follow.

import { deriveSystemStatus } from "@/lib/use-sensor-data";

/**
 * Diagnosis sekarang murni berdasarkan suhu. Gas TIDAK diklasifikasikan
 * atau diberi ambang batas apa pun — avgGas hanya dilaporkan sebagai
 * angka mentah rata-rata (informasional), tanpa memengaruhi status/verdict.
 */
export function diagnoseCondition(avgTemperature, avgGas) {
  const gasIntensity = Number.isFinite(avgGas) ? Math.round(avgGas) : null;

  if (!Number.isFinite(avgTemperature)) {
    return {
      status: "unknown",
      title: "Data Tidak Cukup",
      explanation:
        "Belum cukup data suhu dalam 24 jam terakhir untuk membuat diagnosis. Pastikan ESP32 aktif mengirim data secara berkala.",
      gasIntensity,
    };
  }

  const tempOk = avgTemperature <= 32; // suhu ≤ 32°C

  if (!tempOk) {
    return {
      status: "warning",
      title: "Perlu Perhatian",
      explanation: `Suhu rata-rata berada di atas 32°C selama 24 jam terakhir. Sistem pendingin (Peltier/kipas) kemungkinan belum bekerja maksimal — cek daya baterai, panel surya, dan sirkulasi udara pada unit.`,
      gasIntensity,
    };
  }

  return {
    status: "optimal",
    title: "Kondisi Optimal",
    explanation: `Suhu rata-rata berada di rentang aman (≤32°C) selama 24 jam terakhir. Unit penyimpanan (kulkas mini) SOLTERA beroperasi dalam kondisi optimal.`,
    gasIntensity,
  };
}

/**
 * Aggregates a 24-hour array of readings ({ temperature, humidity,
 * battery_voltage, mq135_raw, peltier_status, timestamp, ... }) into
 * summary stats + a diagnosis + a list of critical moments.
 */
export function analyzeSensorHistory(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return {
      count: 0,
      avgTemperature: null,
      avgHumidity: null,
      avgGas: null,
      avgBattery: null,
      minTemperature: null,
      maxTemperature: null,
      coolingActivePercent: 0,
      batteryHealthyPercent: 0,
      diagnosis: {
        status: "unknown",
        title: "Belum Ada Data",
        explanation:
          "Riwayat 24 jam belum terkumpul. Buka dashboard ini sesekali agar data mulai tersimpan dari pembacaan Firebase secara langsung.",
        gasIntensity: null,
      },
      criticalMoments: [],
    };
  }

  const nums = (key) =>
    history.map((h) => h[key]).filter((v) => typeof v === "number" && Number.isFinite(v));

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  const temps = nums("temperature");
  const humidities = nums("humidity");
  const gasReadings = nums("mq135_raw");
  const batteries = nums("battery_voltage");

  const avgTemperature = avg(temps);
  const avgHumidity = avg(humidities);
  const avgGas = avg(gasReadings);
  const avgBattery = avg(batteries);

  const minTemperature = temps.length ? Math.min(...temps) : null;
  const maxTemperature = temps.length ? Math.max(...temps) : null;

  const pointStatuses = history.map((h) => deriveSystemStatus(h));

  const coolingActiveCount = pointStatuses.filter((s) => s.cooling.active).length;
  const coolingActivePercent = Math.round((coolingActiveCount / history.length) * 100);

  const batteryHealthyCount = pointStatuses.filter((s) => s.battery.healthy).length;
  const batteryHealthyPercent = Math.round((batteryHealthyCount / history.length) * 100);

  const diagnosis = diagnoseCondition(avgTemperature, avgGas);

  // Kritis sekarang murni dari suhu di luar rentang aman — gas tidak lagi
  // punya ambang batas jadi tidak ikut menentukan momen kritis.
  const criticalMoments = history.filter((h, i) => !pointStatuses[i].temperature.inRange);

  return {
    count: history.length,
    avgTemperature,
    avgHumidity,
    avgGas,
    avgBattery,
    minTemperature,
    maxTemperature,
    coolingActivePercent,
    batteryHealthyPercent,
    diagnosis,
    criticalMoments,
  };
}