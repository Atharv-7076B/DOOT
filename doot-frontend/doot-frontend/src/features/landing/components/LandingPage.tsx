import { LandingNav } from '@/features/landing/components/LandingNav';
import { Hero } from '@/features/landing/components/Hero';
import { FlowStrip } from '@/features/landing/components/FlowStrip';
import { FeatureGrid } from '@/features/landing/components/FeatureGrid';
import { LandingFooter } from '@/features/landing/components/LandingFooter';

export function LandingPage() {
  return (
    <div>
      <LandingNav />
      <Hero />
      <FlowStrip />
      <FeatureGrid />
      <LandingFooter />
    </div>
  );
}
