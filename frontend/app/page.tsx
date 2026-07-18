'use client';

import { Navbar } from '@/components/landing/navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { ModernSections } from '@/components/landing/modern-sections';
import { TestimonialsSection } from '@/components/landing/testimonials';
import { DashboardPreviewSection } from '@/components/landing/dashboard-preview';
import { CTASection } from '@/components/landing/cta-section';
import { AICompanion } from '@/components/landing/ai-companion';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <TestimonialsSection />
      <DashboardPreviewSection />
      <ModernSections />
      <CTASection />
      <Footer />
      <AICompanion />
    </main>
  );
}
