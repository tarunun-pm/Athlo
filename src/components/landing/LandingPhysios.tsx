'use client';

import { useEffect } from 'react';

const TESTIMONIALS = [
    {
        initials: 'AK', gradient: 'linear-gradient(135deg,#2563EB,#60A5FA)',
        name: 'Arjun Khanna', type: 'State-Level Sprinter',
        quote: "After my hamstring tear, I thought my season was over. Found a sports-specific physio on Athlos who got me back on the track in 6 weeks. The daily recovery tracking kept me sane.",
        injury: 'Hamstring Tear',
    },
    {
        initials: 'SM', gradient: 'linear-gradient(135deg,#10B981,#34D399)',
        name: 'Sneha Menon', type: 'Amateur Powerlifter',
        quote: "Traditional clinics just told me to 'stop lifting.' My Athlos physio actually understood my sport, filmed my form, and gave me a rehab plan that kept a barbell in my hands.",
        injury: 'Lower Back Strain',
    },
    {
        initials: 'RD', gradient: 'linear-gradient(135deg,#8B5CF6,#A78BFA)',
        name: 'Rohan Desai', type: 'Weekend Footballer',
        quote: "I’ve had ankle sprains before, but this time I booked through Athlos. The difference is night and day. Having my whole recovery timeline mapped out made the process so clear.",
        injury: 'Grade 2 Ankle Sprain',
    },
];

export default function LandingTestimonials() {
    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        import('gsap').then(({ gsap }) => {
            import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
                gsap.registerPlugin(ScrollTrigger);
                document.querySelectorAll('.testimonial-card').forEach((card, i) => {
                    if (!prefersReduced) {
                        gsap.to(card, {
                            scrollTrigger: { trigger: '#testimonials', start: 'top 80%', once: true },
                            y: 0, opacity: 1, duration: 0.7, delay: i * 0.15, ease: 'power3.out',
                        });
                        // Parallax scrub
                        gsap.to(card, {
                            scrollTrigger: { trigger: '#testimonials', start: 'top bottom', end: 'bottom top', scrub: 1 },
                            y: [0, -20, -40][i] ?? 0,
                        });
                    } else {
                        (card as HTMLElement).style.opacity = '1';
                        (card as HTMLElement).style.transform = 'none';
                    }
                });
            });
        });
    }, []);

    return (
        <section id="testimonials" style={{ background: 'var(--bg-primary)', padding: '120px 0' }}>
            <div className="max-w-[1280px] mx-auto px-12">
                <div className="text-center mb-10">
                    <span className="landing-eyebrow">Recovery Stories</span>
                    <h2 className="landing-headline">Don't just take our word for it.</h2>
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 17, color: 'var(--text-secondary)', maxWidth: 560, margin: '16px auto 0', lineHeight: 1.65 }}>
                        Athletes who trusted the process and got back to their sport stronger than before.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {TESTIMONIALS.map((t) => (
                        <div
                            key={t.name}
                            className="testimonial-card rounded-[24px] p-8 cursor-default flex flex-col justify-between"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                opacity: 0, transform: 'translateY(30px)',
                                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.transform = 'translateY(-8px)';
                                el.style.boxShadow = '0 24px 48px rgba(0,0,0,0.3), 0 0 0 1px rgba(37,99,235,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.transform = 'translateY(0)';
                                el.style.boxShadow = 'none';
                            }}
                        >
                            {/* Quote Icon */}
                            <div style={{ color: '#2563EB', opacity: 0.5, fontSize: 32, lineHeight: 1, marginBottom: 16 }}>"</div>
                            
                            {/* Quote Text */}
                            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.6, flexGrow: 1, marginBottom: 24 }}>
                                {t.quote}
                            </p>

                            {/* Divider */}
                            <div style={{ height: 1, background: 'var(--border)', width: '100%', marginBottom: 20 }} />

                            {/* Author */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0" style={{ background: t.gradient, fontFamily: 'var(--font-inter)', fontSize: 14 }}>
                                    {t.initials}
                                </div>
                                <div>
                                    <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: 15, color: 'white' }}>{t.name}</div>
                                    <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{t.type} · Recov. from {t.injury}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
