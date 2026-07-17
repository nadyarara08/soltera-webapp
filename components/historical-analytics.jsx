"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SensorChart } from "@/components/monitoring/sensor-chart";
import { SectionHeading } from "@/components/shared/section-heading";
import { useSensorData } from "@/lib/use-sensor-data";

export function HistoricalAnalytics() {
  const { history } = useSensorData();

  return (
    <section className="bg-telor py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <SectionHeading
          eyebrow="Historical Analytics"
          title="Tren data sensor selama sesi pemantauan berjalan"
          description="Grafik terisi otomatis dari pembacaan sensor sejak dashboard dibuka. Hubungkan ke node riwayat Firebase untuk data jangka panjang."
        />

        <div className="mt-12">
          <Tabs defaultValue="temperature">
            <div className="flex justify-center">
              <TabsList>
                <TabsTrigger value="temperature">Suhu</TabsTrigger>
                <TabsTrigger value="humidity">Kelembapan</TabsTrigger>
                <TabsTrigger value="battery">Baterai</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="temperature">
              <SensorChart
                data={history}
                metricKey="temperature"
                title="Suhu Ruang Simpan"
                description="Target operasional: di bawah 32°C untuk menjaga kesegaran komoditas."
                unit="°C"
              />
            </TabsContent>

            <TabsContent value="humidity">
              <SensorChart
                data={history}
                metricKey="humidity"
                title="Kelembapan Relatif"
                description="Kelembapan stabil membantu memperlambat penyusutan hasil panen."
                unit="%"
              />
            </TabsContent>

            <TabsContent value="battery">
              <SensorChart
                data={history}
                metricKey="battery_voltage"
                title="Tegangan Baterai"
                description="Menunjukkan kesehatan penyimpanan daya dari panel surya."
                unit="V"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
