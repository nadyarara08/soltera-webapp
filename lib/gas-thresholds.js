// lib/gas-thresholds.js
//
// Single source of truth untuk interpretasi nilai RAW/ADC MQ135.
//
// Nilai ini menggambarkan intensitas gas di dalam UNIT penyimpanan
// (kulkas mini SOLTERA) — dipakai untuk memantau kondisi alat secara
// keseluruhan, bukan untuk mengklasifikasikan tingkat kesegaran makanan.
//
// Hasil kalibrasi:
//   raw < 1770          -> Normal
//   1770 <= raw < 1850  -> Meningkat
//   raw >= 1850         -> Tinggi
//
// Normalisasi indeks intensitas (dipakai untuk kebutuhan internal,
// tidak ditampilkan sebagai angka utama ke pengguna):
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
  BASELINE_RAW: 1500, // dianggap 0% intensitas
  FRESH_MAX_RAW: 1770, // batas atas intensitas normal
  RIPE_MAX_RAW: 1850, // batas atas intensitas meningkat
  MAX_RAW: 2500, // dianggap 100% intensitas
  SAMPLE_COUNT: 15, // jumlah sampel untuk averaging
};

// ============================================================
// TIER / KATEGORI
// ============================================================

export const GAS_TIERS = [
  {
    key: "normal",
    label: "Intensitas Gas Normal",
    description: "Intensitas gas di dalam unit berada pada rentang normal, tidak ada indikasi gangguan.",
    severity: "safe",
  },
  {
    key: "meningkat",
    label: "Intensitas Gas Meningkat",
    description: "Intensitas gas mulai meningkat dibanding kondisi normal — perlu dipantau lebih sering.",
    severity: "caution",
  },
  {
    key: "tinggi",
    label: "Intensitas Gas Tinggi",
    description: "Intensitas gas berada pada level tinggi — periksa sirkulasi udara dan kondisi unit penyimpanan.",
    severity: "critical",
  },
];

// ============================================================
// HITUNG INDEKS INTENSITAS GAS
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