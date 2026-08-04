// lib/export-sensor-history.js
//
// Mengubah array `history` 24 jam terakhir (dari useSensorHistory24h())
// menjadi file CSV yang bisa diunduh — dipakai untuk lampiran
// laporan/proposal atau analisis lanjutan di Excel/Sheets.

import { diagnoseCondition } from "@/lib/sensor-diagnosis";

const CSV_HEADERS = [
  "Waktu",
  "Suhu (°C)",
  "Kelembapan (%)",
  "Intensitas Gas (ADC)",
  "Status Diagnosis",
];

function escapeCsvCell(value) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Status diagnosis per baris dipakai dari logika yang sama dengan panel
// diagnosis (lib/sensor-diagnosis.js) — dievaluasi per titik data, bukan
// rata-rata 24 jam, supaya kolom ini menandai persis di baris mana kondisi
// sensor sempat "Warning".
function diagnosisStatusLabel(h) {
  const { status } = diagnoseCondition(Number(h.temperature), Number(h.mq135_raw));
  if (status === "optimal") return "Optimal";
  if (status === "warning") return "Warning";
  return "Tidak Diketahui";
}

function historyToCsvRows(history) {
  return history.map((h) => [
    h.time ?? "",
    h.temperature ?? "",
    h.humidity ?? "",
    h.mq135_raw ?? "",
    diagnosisStatusLabel(h),
  ]);
}

/** Bangun string CSV mentah dari array history. Diekspor terpisah supaya mudah di-unit test. */
export function buildSensorHistoryCsv(history) {
  const rows = [CSV_HEADERS, ...historyToCsvRows(history)];
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
}

function buildFilename(extension) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(
    now.getHours()
  )}${pad(now.getMinutes())}`;
  return `soltera-riwayat-sensor-24jam-${stamp}.${extension}`;
}

/**
 * Memicu unduhan browser untuk riwayat sensor 24 jam terakhir sebagai CSV.
 * Mengembalikan `false` (dan tidak melakukan apa pun) jika belum ada data.
 */
export function downloadSensorHistoryCsv(history) {
  if (!history || history.length === 0) return false;

  const csv = buildSensorHistoryCsv(history);
  // Prefix BOM (\uFEFF) supaya Excel membaca karakter UTF-8 (°, dsb.) dengan benar.
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = buildFilename("csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}