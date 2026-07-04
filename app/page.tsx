import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { HighlightsSection } from "./components/HighlightsSection";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HighlightsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
