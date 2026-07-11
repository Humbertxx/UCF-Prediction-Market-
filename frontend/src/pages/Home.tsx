/**
 * Home — section-by-section marketing landing for the prediction market.
 * Framer Motion loads with this route only (see DESIGN.md §16).
 */

import { MotionConfig } from "framer-motion";

import CampusDemoSection from "../components/landing/CampusDemoSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import FinalCtaSection from "../components/landing/FinalCtaSection";
import HeroSection from "../components/landing/HeroSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import MarketsPreviewSection from "../components/landing/MarketsPreviewSection";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex flex-col bg-landing-deep">
        <HeroSection />
        <HowItWorksSection />
        <MarketsPreviewSection />
        <FeaturesSection />
        <CampusDemoSection />
        <FinalCtaSection />
      </div>
    </MotionConfig>
  );
}
