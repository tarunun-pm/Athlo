import LandingNav from '@/components/landing/LandingNav';
import LandingHero from '@/components/landing/LandingHero';
import LandingStatsBar from '@/components/landing/LandingStatsBar';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingSports from '@/components/landing/LandingSports';
import LandingPhysios from '@/components/landing/LandingPhysios';
import LandingPhysioCTA from '@/components/landing/LandingPhysioCTA';
import LandingFooter from '@/components/landing/LandingFooter';

/**
 * Root landing page — Athlos Sports Physiotherapy Marketplace
 *
 * Pipeline:
 *   "Find My Physio" → /auth/signup
 *   "Join as Physio" → /auth/signup?role=physio
 *   After signup     → /onboarding/tc → /onboarding/user-type → role-specific onboarding
 */
export default function HomePage() {
    return (
        <main className="overflow-x-hidden">
            <LandingNav />
            <LandingHero />
            <LandingStatsBar />
            <LandingHowItWorks />
            <LandingSports />
            <LandingPhysios />

            <LandingFooter />
        </main>
    );
}
