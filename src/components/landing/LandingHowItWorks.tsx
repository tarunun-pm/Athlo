'use client';

import { useEffect } from 'react';

const ATHLETE_STEPS = [
    { n: '01', icon: '🔍', title: 'Find Your Physio', desc: 'Filter verified physios by sport, injury type, and location in Delhi NCR.' },
    { n: '02', icon: '📅', title: 'Book a Session', desc: 'Secure online or in-person slots instantly at transparent rates.' },
    { n: '03', icon: '💪', title: 'Recover With a Plan', desc: 'Follow a structured recovery timeline and return to peak performance.' },
];

const PHYSIO_STEPS = [
    { n: '01', icon: '🪪', title: 'Verify Profile', desc: 'Submit credentials. We cross-check registration ID and degree — manually.' },
    { n: '02', icon: '⏰', title: 'Set Availability', desc: 'Open clinic or digital slots at your own schedule and custom rates.' },
    { n: '03', icon: '🏃', title: 'See Matched Athletes', desc: 'Receive bookings from athletes who need exactly your specialization.' },
];

function JourneyLabel({ type }: { type: 'athlete' | 'physio' }) {
    const isPhysio = type === 'physio';
    return (
        <span
            className="inline-block mb-8"
            style={{
                fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 11,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                borderRadius: 999, padding: '5px 14px',
                color: isPhysio ? '#10B981' : '#2563EB',
                background: isPhysio ? 'rgba(16,185,129,0.1)' : 'rgba(37,99,235,0.1)',
                border: isPhysio ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(37,99,235,0.25)',
            }}
        >
            {isPhysio ? 'For Physios' : 'For Athletes'}
        </span>
    );
}

function StepCard({ step, accentColor, className = '' }: { step: typeof ATHLETE_STEPS[0]; accentColor: string; className?: string }) {
    return (
        <div
            className={`step-card relative overflow-hidden rounded-[20px] p-7 ${className}`}
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                opacity: 0, transform: 'translateY(30px)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,99,235,0.3)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 32px rgba(37,99,235,0.08)';
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
        >
            {/* Background number */}
            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 80, color: 'var(--text-muted)', opacity: 0.1, position: 'absolute', top: -10, right: 16, lineHeight: 1, userSelect: 'none' }}>
                {step.n}
            </div>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{step.icon}</div>
            <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 8 }}>{step.title}</div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-secondary)', maxWidth: 200, lineHeight: 1.6 }}>{step.desc}</p>
        </div>
    );
}

export default function LandingHowItWorks() {
    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            document.querySelectorAll<HTMLElement>('.step-card').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
            return;
        }
        import('gsap').then(({ gsap }) => {
            import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
                gsap.registerPlugin(ScrollTrigger);
                document.querySelectorAll('.step-card').forEach((card, i) => {
                    gsap.to(card, {
                        scrollTrigger: { trigger: card, start: 'top 85%', once: true },
                        y: 0, opacity: 1, duration: 0.65, delay: (i % 3) * 0.13, ease: 'power3.out',
                    });
                });
            });
        });
    }, []);

    return (
        <section id="hiw" style={{ background: 'var(--bg-primary)', padding: '120px 0' }}>
            <div className="max-w-[1280px] mx-auto px-12">
                <div className="text-center mb-16">
                    <span className="landing-eyebrow">The Process</span>
                    <h2 className="landing-headline">From injury to back on the field.</h2>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 18, color: 'var(--text-secondary)', maxWidth: 480, margin: '16px auto 0', lineHeight: 1.65 }}>
                        Simple for athletes. Powerful for physios.
                    </p>
                </div>

                {/* Athlete Journey */}
                <div className="mb-10">
                    <JourneyLabel type="athlete" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {ATHLETE_STEPS.map(s => <StepCard key={s.n} step={s} accentColor="#2563EB" />)}
                    </div>
                </div>

                {/* Physio Journey */}
                <div className="mt-12" style={{ paddingTop: 32, borderTop: '1px solid var(--border)' }}>
                    <JourneyLabel type="physio" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PHYSIO_STEPS.map(s => <StepCard key={s.n} step={s} accentColor="#10B981" />)}
                    </div>
                </div>
            </div>
        </section>
    );
}
