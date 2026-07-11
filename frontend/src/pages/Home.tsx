/**
 * Home — section-by-section marketing landing for the prediction market.
 */

import CampusDemoSection from "../components/landing/CampusDemoSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import FinalCtaSection from "../components/landing/FinalCtaSection";
import HeroSection from "../components/landing/HeroSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import MarketsPreviewSection from "../components/landing/MarketsPreviewSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <MarketsPreviewSection />
      <FeaturesSection />
      <CampusDemoSection />
      <FinalCtaSection />
    </div>
  );
}
