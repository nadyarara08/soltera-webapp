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
    };
  }

  const derived = deriveSystemStatus({ temperature: avgTemperature, mq135_ppm: avgGas });
  const tempOk = derived.temperature.inRange; // suhu ≤ 32°C
  const gasOk = derived.gas.safe; // gas < 1000 ppm

  if (tempOk && gasOk) {
    return {
      status: "optimal",
      title: "Kondisi Optimal",
      explanation:
        "Suhu ruang simpan rata-rata berada di rentang aman (≤32°C) dan kadar gas MQ135 tidak menunjukkan tanda pembusukan selama 24 jam terakhir. Komoditas hortikultura tersimpan dalam kondisi ideal.",
    };
  }

  if (tempOk && !gasOk) {
    return {
      status: "warning",
      title: "Perlu Perhatian",
      explanation:
        "Suhu sudah berada di rentang aman, namun kadar gas MQ135 rata-rata di atas ambang aman. Ini bisa menandakan sebagian komoditas mulai membusuk atau melepaskan gas etilen meski pendinginan berjalan baik — disarankan memeriksa kondisi fisik produk secara langsung.",
    };
  }

  if (!tempOk && gasOk) {
    return {
      status: "warning",
      title: "Perlu Perhatian",
      explanation:
        "Gas tidak terdeteksi (aman), tetapi suhu rata-rata berada di atas 32°C. Sistem pendingin (Peltier/kipas) kemungkinan belum bekerja maksimal — cek daya baterai, panel surya, dan sirkulasi udara pada unit.",
    };
  }

  return {
    status: "critical",
    title: "Kondisi Kritis",
    explanation:
      "Suhu di atas 32°C dan kadar gas MQ135 di atas ambang aman terjadi bersamaan selama 24 jam terakhir — indikasi kuat proses pembusukan aktif pada komoditas. Segera periksa unit pendingin dan pertimbangkan evakuasi produk yang berisiko.",
  };
}

/**
 * Aggregates a 24-hour array of readings ({ temperature, humidity,
 * battery_voltage, mq135_ppm, peltier_status, timestamp, ... }) into
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
      },
      criticalMoments: [],
    };
  }

  const nums = (key) =>
    history.map((h) => h[key]).filter((v) => typeof v === "number" && Number.isFinite(v));

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

  const temps = nums("temperature");
  const humidities = nums("humidity");
  const gasReadings = nums("mq135_ppm");
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
    return !s.temperature.inRange && !s.gas.safe;
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
