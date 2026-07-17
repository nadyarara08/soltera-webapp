import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata = {
  title: "SOLTERA — Smart Solar Cold Storage for Fresh Agriculture",
  description:
    "SOLTERA adalah wadah simpan dingin cerdas berbasis energi surya, modul termoelektrik/Peltier, ESP32, dan Firebase Realtime Database, dirancang untuk menekan food loss komoditas hortikultura.",
  keywords: [
    "SOLTERA",
    "cold storage surya",
    "food loss hortikultura",
    "IoT pertanian",
    "termoelektrik Peltier",
    "ESP32 Firebase",
  ],
  openGraph: {
    title: "SOLTERA — Smart Solar Cold Storage for Fresh Agriculture",
    description:
      "Penyimpanan dingin cerdas bertenaga surya dengan monitoring real-time untuk menekan food loss hortikultura.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
