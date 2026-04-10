"use client";

import { HeroBanner } from "@/components/home/hero-banner";
import { FeaturesSection } from "@/components/home/features-section";
import { AboutSection } from "@/components/home/about-section";

export function HomeContent() {
  return (
    <main className="flex-1">
      <HeroBanner />
      <FeaturesSection />
      <AboutSection />
    </main>
  );
}