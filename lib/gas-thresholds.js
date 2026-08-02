// lib/gas-thresholds.js
//
// Single source of truth untuk interpretasi nilai RAW/ADC MQ135.
//
// Hasil kalibrasi:
//   raw < 1770          -> Segar
//   1770 <= raw < 1850  -> Matang
//   raw >= 1850         -> Busuk
//
// Normalisasi indeks kebusukan:
//   raw <= 1500 -> 0%
//   raw >= 2500 -> 100%
//
// Catatan:
// Nilai ini adalah threshold empiris hasil kalibrasi sistem,
// bukan standar universal MQ135.
//
// classifyGasPPM() dipertahankan sebagai nama kompatibilitas
// dengan kode frontend yang sudah ada. Secara aktual inputnya
// adalah nilai RAW/ADC MQ135, bukan PPM.

// ============================================================
// KALIBRASI MQ135
// ============================================================

export const MQ135_CALIBRATION = {
  BASELINE_RAW: 1500, // dianggap 0% kebusukan
  FRESH_MAX_RAW: 1770, // batas atas kondisi segar
  RIPE_MAX_RAW: 1850, // batas atas kondisi matang
  MAX_RAW: 2500, // dianggap 100% indeks kebusukan
  SAMPLE_COUNT: 15, // jumlah sampel untuk averaging
};

// ============================================================
// TIER / KATEGORI
// ============================================================

export const GAS_TIERS = [
  {
    key: "segar",
    label: "Makanan Segar",
    description: "Kondisi makanan masih segar dan belum menunjukkan indikasi pembusukan.",
    severity: "safe",
  },
  {
    key: "matang",
    label: "Makanan Matang",
    description: "Makanan berada pada kondisi matang berdasarkan hasil kalibrasi sensor.",
    severity: "caution",
  },
  {
    key: "busuk",
    label: "Kemungkinan Busuk",
    description: "Sensor mendeteksi nilai gas yang mengindikasikan kemungkinan pembusukan.",
    severity: "critical",
  },
];

// ============================================================
// HITUNG INDEKS KEBOBUSUKAN
// ============================================================

export function calculateSpoilageIndex(raw) {
  const value = Number(raw);

  if (!Number.isFinite(value)) {
    return null;
  }

  const {
    BASELINE_RAW,
    MAX_RAW,
  } = MQ135_CALIBRATION;

  // Di bawah baseline tetap dianggap 0%
  if (value <= BASELINE_RAW) {
    return 0;
  }

  // Di atas titik maksimum dianggap 100%
  if (value >= MAX_RAW) {
    return 100;
  }

  const percentage =
    ((value - BASELINE_RAW) / (MAX_RAW - BASELINE_RAW)) * 100;

  return Math.round(percentage);
}

// ============================================================
// KLASIFIKASI RAW MQ135
// ============================================================

export function classifyGasRaw(raw) {
  const value = Number(raw);

  if (!Number.isFinite(value)) {
    return {
      key: "unknown",
      tier: 0,
      label: "Data Tidak Tersedia",
      description: "Nilai RAW MQ135 tidak tersedia atau tidak valid.",
      severity: "unknown",
      value: null,
      spoilageIndex: null,
      safe: false,
    };
  }

  const {
    FRESH_MAX_RAW,
    RIPE_MAX_RAW,
  } = MQ135_CALIBRATION;

  let tierData;
  let tierNumber;

  if (value < FRESH_MAX_RAW) {
    // raw < 1770
    tierData = GAS_TIERS[0];
    tierNumber = 1;
  } else if (value < RIPE_MAX_RAW) {
    // 1770 <= raw < 1850
    tierData = GAS_TIERS[1];
    tierNumber = 2;
  } else {
    // raw >= 1850
    tierData = GAS_TIERS[2];
    tierNumber = 3;
  }

  return {
    ...tierData,
    tier: tierNumber,
    value,
    spoilageIndex: calculateSpoilageIndex(value),
    safe: tierData.severity === "safe",
  };
}

// ============================================================
// KOMPATIBILITAS DENGAN KODE LAMA
// ============================================================
//
// Jangan langsung mengubah semua import di project kalau belum perlu.
// Fungsi lama tetap tersedia:
//
//   classifyGasPPM(value)
//
// Tetapi sekarang value yang diberikan harus berupa RAW MQ135,
// bukan PPM.

export function classifyGasPPM(raw) {
  return classifyGasRaw(raw);
}