// lib/gas-thresholds.js
//
// Single source of truth for interpreting MQ135 PPM readings.
// Mirrors the 5-tingkat tabel referensi:
//
//   0–50    ppm  → Udara bersih / makanan masih segar
//   50–150  ppm  → Masih normal, mulai ada sedikit gas
//   150–300 ppm  → Perlu diwaspadai, kemungkinan mulai terjadi pembusukan
//   300–500 ppm  → Indikasi makanan mulai busuk
//   >500    ppm  → Makanan kemungkinan busuk dan menghasilkan banyak gas
//
// Both deriveSystemStatus() (lib/use-sensor-data.js, dipakai live cards +
// badge) dan diagnoseCondition() (lib/sensor-diagnosis.js, dipakai ringkasan
// 24 jam) import fungsi classifyGasPPM() dari sini, jadi kalau suatu saat
// ambang batasnya perlu diubah, cukup diubah di satu tempat ini saja.

export const GAS_TIERS = [
  {
    key: "bersih",
    max: 150,
    label: "Udara Bersih",
    description: "Udara bersih/makanan masih segar.",
    severity: "safe",
  },
  {
    key: "normal",
    max: 250,
    label: "Normal",
    description: "Masih normal, belum terdeteksi sedikit gas.",
    severity: "safe",
  },
  {
    key: "waspada",
    max: 350,
    label: "Perlu Diwaspadai",
    description: "Perlu diwaspadai, mulai ada sedikit gas terdeteksi",
    severity: "caution",
  },
  {
    key: "mulai_busuk",
    max: 500,
    label: "Indikasi Mulai Busuk",
    description: "Hati-hati, kemungkinan mulai terjadi pembusukan.",
    severity: "warning",
  },
  {
    key: "busuk",
    max: Infinity,
    label: "Kemungkinan Busuk",
    description: "Makanan kemungkinan busuk dan menghasilkan banyak gas.",
    severity: "critical",
  },
];

/**
 * Classify a raw MQ135 PPM value into one of the 5 tiers above.
 *
 * Returns:
 *  - key, label, description, severity ("safe" | "caution" | "warning" | "critical")
 *  - tier: 1-5 (1 = paling bersih, 5 = paling parah)
 *  - value: angka ppm yang sudah di-parse
 *  - safe: boolean kompatibilitas-mundur, true hanya untuk tier "bersih"/"normal"
 */
export function classifyGasPPM(ppm) {
  const value = Number(ppm);

  if (!Number.isFinite(value)) {
    return {
      key: "unknown",
      tier: 0,
      label: "Data Tidak Tersedia",
      description: "Nilai PPM tidak tersedia atau tidak valid.",
      severity: "unknown",
      value: null,
      safe: false,
    };
  }

  const index = GAS_TIERS.findIndex((t) => value <= t.max);
  const tierData = index === -1 ? GAS_TIERS[GAS_TIERS.length - 1] : GAS_TIERS[index];
  const tierNumber = (index === -1 ? GAS_TIERS.length - 1 : index) + 1;

  return {
    ...tierData,
    tier: tierNumber,
    value,
    safe: tierData.severity === "safe",
  };
}
