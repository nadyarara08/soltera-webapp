# SOLTERA — Website

Website untuk proyek **SOLTERA (Solar dan Termoelektrik untuk Agrikultur)**:
wadah simpan dingin cerdas berbasis energi surya, modul termoelektrik
(Peltier), ESP32, dan Firebase Realtime Database. Dibangun dengan Next.js 15,
Tailwind CSS v4, shadcn/ui, Recharts, dan Framer Motion.

## Menjalankan secara lokal

```bash
npm install
cp .env.local.example .env.local   # isi dengan config Firebase kamu
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Konfigurasi Firebase

1. Buat project Firebase → aktifkan **Realtime Database** (bukan Firestore).
2. Salin konfigurasi SDK dari *Project Settings → General → Your apps* ke
   `.env.local` (lihat `.env.local.example`).
3. Pastikan struktur data sesuai:

   ```json
   {
     "sensor_data": {
       "battery_voltage": "3.37",
       "fan_status": "ON",
       "humidity": "59.10",
       "mq135_ppm": "401.00",
       "peltier_status": "ON",
       "temperature": "30.00",
       "timestamp": 89
     }
   }
   ```

4. Terapkan rules di `database.rules.json` (read publik, write hanya dari
   device/service ter-autentikasi) melalui Firebase Console atau
   `firebase deploy --only database`.

## Struktur proyek

```
app/
  layout.js              → font, metadata, ToastProvider
  page.js                → merangkai semua section landing page
  globals.css             → design tokens Tailwind v4 (warna, font, shadow)
components/
  navbar.jsx, hero.jsx, problem-section.jsx, solution-section.jsx,
  technology-section.jsx, monitoring-dashboard.jsx,
  historical-analytics.jsx, research-documentation.jsx, footer.jsx
  monitoring/
    sensor-card.jsx       → contoh card monitoring (live value + status dot)
    sensor-chart.jsx      → contoh chart Recharts (area chart per metrik)
    status-badge.jsx      → pill status (Cooling Active, dsb.)
  shared/
    count-up.jsx          → animasi angka naik (Framer Motion)
    section-heading.jsx   → heading section yang konsisten
  ui/                      → primitives ala shadcn/ui (Card, Button, Tabs,
                              Dialog, Toast) yang sudah ditema ke palet SOLTERA
lib/
  firebase.js             → inisialisasi Firebase App + Realtime Database
  use-sensor-data.js       → hook onValue() + riwayat rolling + status sistem
  utils.js                → helper cn() dan formatUptime()
```

## Menghubungkan data historis jangka panjang

Saat ini grafik di **Historical Analytics** dibangun dari pembacaan yang
diterima selama dashboard terbuka (`lib/use-sensor-data.js`, maks. 60 titik).
Untuk riwayat jangka panjang:

1. Di firmware ESP32, tulis tiap pembacaan sebagai child baru, misalnya
   `sensor_history/{pushId}`, alih-alih menimpa `sensor_data`.
2. Ganti listener di `use-sensor-data.js` agar membaca dari
   `sensor_history` dengan query `limitToLast()`.

## Deployment

Proyek ini siap di-deploy ke **Vercel**:

```bash
vercel
```

Tambahkan environment variables yang sama seperti `.env.local` di dashboard
Vercel (Project Settings → Environment Variables).

## Palet warna

| Nama   | Kode      | Token Tailwind      |
| ------ | --------- | -------------------- |
| Cream  | `#FBF7EC` | `bg-cream`            |
| Forest | `#416D19` | `bg-forest`           |
| Leaf   | `#9BCF53` | `bg-leaf`              |
| Sun    | `#FFEF67` | `bg-sun`               |
| Ink    | `#1F2E12` | `text-ink`             |
| Mist   | `#FFF3CE` | `bg-mist`              |
| Telor  | `#EDFEE5` | `bg-telor`             |
| Bark   | `#3B2C15` | `bg-bark`              |

Semua token didefinisikan sekali di `app/globals.css` melalui `@theme`
(Tailwind v4 CSS-first config), jadi mengubah warna cukup di satu tempat.
