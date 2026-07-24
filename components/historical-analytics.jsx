"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SensorChart } from "@/components/monitoring/sensor-chart";
import { HistoryDiagnosisPanel } from "@/components/monitoring/history-diagnosis-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { useSensorHistory24h } from "@/lib/use-sensor-history";

export function HistoricalAnalytics() {
  const { history, analysis, loading } = useSensorHistory24h();

  return (
    <section className="bg-telor py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Historical Analytics"
          title="Riwayat & diagnosis kondisi 24 jam terakhir"
          description="Sistem menganalisis data suhu, kelembapan, dan gas secara berkala untuk menyimpulkan kondisi dalam 24 jam terakhir."
        />

        {/* rule-based explanation of the last 24 hours */}
        <div className="mt-10">
          <HistoryDiagnosisPanel analysis={analysis} loading={loading} />
        </div>

        <div className="mt-10">
          <Tabs defaultValue="temperature">
            <div className="flex justify-center">
              <TabsList>
                <TabsTrigger value="temperature">Suhu</TabsTrigger>
                <TabsTrigger value="humidity">Kelembapan</TabsTrigger>
                <TabsTrigger value="gas">Gas</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="temperature">
              <SensorChart
                data={history}
                metricKey="temperature"
                title="Suhu Ruang Simpan · 24 Jam Terakhir"
                description="Target operasional: di bawah 32°C untuk menjaga kesegaran komoditas."
                unit="°C"
              />
            </TabsContent>

            <TabsContent value="humidity">
              <SensorChart
                data={history}
                metricKey="humidity"
                title="Kelembapan Relatif · 24 Jam Terakhir"
                description="Kelembapan stabil membantu memperlambat penyusutan hasil panen."
                unit="%"
              />
            </TabsContent>

            <TabsContent value="gas">
              <SensorChart
                data={history}
                metricKey="mq135_ppm"
                title="Kualitas Udara · 24 Jam Terakhir"
                description="Lonjakan ppm bisa menandakan gas dari komoditas yang mulai membusuk."
                unit=" ppm"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
