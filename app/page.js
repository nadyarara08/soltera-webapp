import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProblemSection } from "@/components/problem-section";
import { SolutionSection } from "@/components/solution-section";
import { TechnologySection } from "@/components/technology-section";
import { MonitoringDashboard } from "@/components/monitoring-dashboard";
import { HistoricalAnalytics } from "@/components/historical-analytics";
import { ResearchDocumentation } from "@/components/research-documentation";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <TechnologySection />
      <MonitoringDashboard />
      <HistoricalAnalytics />
      <ResearchDocumentation />
      <Footer />
    </main>
  );
}
