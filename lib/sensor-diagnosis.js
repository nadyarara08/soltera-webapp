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
      gasPercent: null,
      gasCategory: null,
    };
  }

  // avgGas di sini adalah rata-rata nilai RAW/ADC MQ135 (bukan ppm).
  // deriveSystemStatus() mengklasifikasikannya lewat lib/gas-thresholds.js
  // menjadi 3 kategori (Segar/Matang/Busuk) + indeks persentase kebusukan.
  const derived = deriveSystemStatus({ temperature: avgTemperature, mq135_ppm: avgGas });
  const tempOk = derived.temperature.inRange; // suhu ≤ 32°C
  const gasTier = derived.gas; // klasifikasi 3-tingkat dari lib/gas-thresholds.js
  const gasPercent = gasTier.spoilageIndex; // 0–100, indeks kebusukan hasil kalibrasi
  // derived.gas.label sudah dipakai ulang oleh deriveSystemStatus() untuk
  // badge status (mis. "Gas: Makanan Segar") — buang prefix "Gas: " di sini
  // supaya kategori tampil apa adanya: "Makanan Segar" | "Makanan Matang" | "Kemungkinan Busuk"
  const gasCategory = gasTier.label?.replace(/^Gas:\s*/, "") ?? "Tidak Diketahui";
    
  // Tier "busuk" selalu dianggap kritis, terlepas dari suhu — makanan yang
  // sudah terindikasi busuk butuh tindakan segera.
  if (gasTier.severity === "critical") {
    return {
      status: "critical",
      title: "Kondisi Kritis",
      explanation: `Konsentrasi gas rata-rata berada di ${gasPercent}% (${gasCategory.toLowerCase()}) ${
        tempOk ? "meski suhu masih dalam rentang aman" : "dan suhu rata-rata juga di atas 32°C"
      } selama 24 jam terakhir. Segera periksa unit pendingin dan kondisi fisik komoditas, pertimbangkan evakuasi produk yang berisiko.`,
      gasPercent,
      gasCategory,
    };
  }

  // Tier "matang" — mendekati ambang pembusukan, perlu diwaspadai.
  if (gasTier.severity === "caution") {
    return {
      status: "warning",
      title: "Perlu Diwaspadai",
      explanation: `Konsentrasi gas rata-rata berada di ${gasPercent}% (${gasCategory.toLowerCase()}) selama 24 jam terakhir. ${
        tempOk
          ? "Suhu masih dalam rentang aman, namun"
          : "Suhu rata-rata juga di atas 32°C —"
      } disarankan memantau lebih sering dan memeriksa kondisi fisik komoditas secara langsung.`,
      gasPercent,
      gasCategory,
    };
  }

  // Tier "segar" — gas aman, tinggal cek suhu.
  if (!tempOk) {
    return {
      status: "warning",
      title: "Perlu Perhatian",
      explanation: `Konsentrasi gas masih aman di ${gasPercent}% (${gasCategory.toLowerCase()}), tetapi suhu rata-rata berada di atas 32°C. Sistem pendingin (Peltier/kipas) kemungkinan belum bekerja maksimal — cek daya baterai, panel surya, dan sirkulasi udara pada unit.`,
      gasPercent,
      gasCategory,
    };
  }

  return {
    status: "optimal",
    title: "Kondisi Optimal",
    explanation: `Suhu ruang simpan rata-rata berada di rentang aman (≤32°C) dan konsentrasi gas berada di ${gasPercent}% (${gasCategory.toLowerCase()}), tidak menunjukkan tanda pembusukan selama 24 jam terakhir. Komoditas hortikultura tersimpan dalam kondisi ideal.`,
    gasPercent,
    gasCategory,
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
        gasPercent: null,
        gasCategory: null,
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