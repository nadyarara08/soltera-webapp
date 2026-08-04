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
 * Core interpretation matrix, exactly as requested:
 * suhu (rendah/aman vs tinggi) × gas (tidak terdeteksi/aman vs terdeteksi).
 */
export function diagnoseCondition(avgTemperature, avgGas) {
  if (!Number.isFinite(avgTemperature) || !Number.isFinite(avgGas)) {
    return {
      status: "unknown",
      title: "Data Tidak Cukup",
      explanation:
        "Belum cukup data suhu dan gas dalam 24 jam terakhir untuk membuat diagnosis. Pastikan ESP32 aktif mengirim data secara berkala.",
      gasIntensity: null,
      gasSeverity: null,
    };
  }

  // avgGas di sini adalah rata-rata nilai RAW/ADC MQ135 (bukan ppm) — angka
  // mentah yang sama dengan yang dikirim ESP32 ke Firebase. deriveSystemStatus()
  // mengklasifikasikannya lewat lib/gas-thresholds.js menjadi 3 tingkat
  // intensitas (Normal/Meningkat/Tinggi). Diagnosis ini menilai kondisi
  // UNIT penyimpanan (kulkas mini) secara keseluruhan — bukan tingkat
  // kesegaran komoditas di dalamnya.
  const derived = deriveSystemStatus({ temperature: avgTemperature, mq135_raw: avgGas });
  const tempOk = derived.temperature.inRange; // suhu ≤ 32°C
  const gasTier = derived.gas; // klasifikasi 3-tingkat dari lib/gas-thresholds.js
  const gasIntensity = Math.round(avgGas); // angka mentah rata-rata dari Firebase, bukan persentase
  const gasSeverity = gasTier.severity; // "safe" | "caution" | "critical"

  // Tier "tinggi" selalu dianggap kritis, terlepas dari suhu — intensitas gas
  // tinggi di dalam unit perlu dicek segera.
  if (gasSeverity === "critical") {
    return {
      status: "critical",
      title: "Kondisi Kritis",
      explanation: `Intensitas gas rata-rata di dalam unit berada di angka ${gasIntensity} (tinggi) ${
        tempOk ? "meski suhu masih dalam rentang aman" : "dan suhu rata-rata juga di atas 32°C"
      } selama 24 jam terakhir. Segera periksa kondisi fisik unit — sirkulasi udara, segel wadah, dan sistem pendingin.`,
      gasIntensity,
      gasSeverity,
    };
  }

  // Tier "meningkat" — mendekati ambang, perlu diwaspadai.
  if (gasSeverity === "caution") {
    return {
      status: "warning",
      title: "Perlu Diwaspadai",
      explanation: `Intensitas gas rata-rata di dalam unit berada di angka ${gasIntensity} (meningkat) selama 24 jam terakhir. ${
        tempOk
          ? "Suhu masih dalam rentang aman, namun"
          : "Suhu rata-rata juga di atas 32°C —"
      } disarankan memantau lebih sering dan memeriksa sirkulasi udara pada unit.`,
      gasIntensity,
      gasSeverity,
    };
  }

  // Tier "normal" — gas aman, tinggal cek suhu.
  if (!tempOk) {
    return {
      status: "warning",
      title: "Perlu Perhatian",
      explanation: `Intensitas gas masih normal di angka ${gasIntensity}, tetapi suhu rata-rata berada di atas 32°C. Sistem pendingin (Peltier/kipas) kemungkinan belum bekerja maksimal — cek daya baterai, panel surya, dan sirkulasi udara pada unit.`,
      gasIntensity,
      gasSeverity,
    };
  }

  return {
    status: "optimal",
    title: "Kondisi Optimal",
    explanation: `Suhu rata-rata berada di rentang aman (≤32°C) dan intensitas gas berada di angka normal (${gasIntensity}) selama 24 jam terakhir. Unit penyimpanan (kulkas mini) SOLTERA beroperasi dalam kondisi optimal.`,
    gasIntensity,
    gasSeverity,
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
      gasDetectedCount: 0,
      gasDetectedPercent: 0,
      coolingActivePercent: 0,
      batteryHealthyPercent: 0,
      diagnosis: {
        status: "unknown",
        title: "Belum Ada Data",
        explanation:
          "Riwayat 24 jam belum terkumpul. Buka dashboard ini sesekali agar data mulai tersimpan dari pembacaan Firebase secara langsung.",
        gasIntensity: null,
        gasSeverity: null,
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

  const gasDetectedCount = pointStatuses.filter((s) => !s.gas.safe).length;
  const gasDetectedPercent = Math.round((gasDetectedCount / history.length) * 100);

  const coolingActiveCount = pointStatuses.filter((s) => s.cooling.active).length;
  const coolingActivePercent = Math.round((coolingActiveCount / history.length) * 100);

  const batteryHealthyCount = pointStatuses.filter((s) => s.battery.healthy).length;
  const batteryHealthyPercent = Math.round((batteryHealthyCount / history.length) * 100);

  const diagnosis = diagnoseCondition(avgTemperature, avgGas);

  const criticalMoments = history.filter((h, i) => {
    const s = pointStatuses[i];
    // Titik data dianggap kritis kalau gas sudah di tier "busuk" sendirian,
    // ATAU kombinasi suhu tinggi + gas tidak aman.
    return s.gas.severity === "critical" || (!s.temperature.inRange && !s.gas.safe);
  });

  return {
    count: history.length,
    avgTemperature,
    avgHumidity,
    avgGas,
    avgBattery,
    minTemperature,
    maxTemperature,
    gasDetectedCount,
    gasDetectedPercent,
    coolingActivePercent,
    batteryHealthyPercent,
    diagnosis,
    criticalMoments,
  };
}