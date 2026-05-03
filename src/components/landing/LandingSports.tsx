'use client';

import { useEffect } from 'react';

const SPORTS = [
    { emoji: '🏏', name: 'Cricket' },
    { emoji: '⚽', name: 'Football' },
    { emoji: '🏸', name: 'Badminton' },
    { emoji: '🎾', name: 'Tennis' },
    { emoji: '🏃', name: 'Athletics' },
    { emoji: '🏊', name: 'Swimming' },
    { emoji: '🤼', name: 'Wrestling' },
    { emoji: '🏑', name: 'Kabaddi' },
];

export default function LandingSports() {
    useEffect(() => {
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduced) {
            document.querySelectorAll<HTMLElement>('.sport-card').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
            return;
        }
        import('gsap').then(({ gsap }) => {
            import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
                gsap.registerPlugin(ScrollTrigger);
                gsap.utils.toArray('.sport-card').forEach((card: any, i: number) => {
                    gsap.to(card, {
                        scrollTrigger: { trigger: '#sports', start: 'top 80%', once: true },
                        y: 0, opacity: 1, duration: 0.55, delay: i * 0.06, ease: 'power3.out',
                    });
                });
            });
        });
    }, []);

    return (
        <section id="sports" style={{ background: 'var(--bg-secondary)', padding: '100px 0' }}>
            <div className="max-w-[1280px] mx-auto px-12 text-center">
                <span className="landing-eyebrow">Sports We Cover</span>
                <h2 className="landing-headline">Built for every competitive athlete.</h2>

                <div className="flex flex-wrap justify-center gap-3 mt-12">
                    {SPORTS.map((s) => (
                        <div
                            key={s.name}
                            className="sport-card flex flex-col items-center justify-center gap-2.5 rounded-2xl cursor-default transition-all duration-200"
                            style={{
                                width: 130, height: 150,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid var(--border)',
                                opacity: 0, transform: 'translateY(20px)',
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.borderColor = '#2563EB';
                                el.style.background = 'rgba(37,99,235,0.08)';
                                el.style.transform = 'translateY(-6px)';
                                const name = el.querySelector<HTMLElement>('.sport-name');
                                if (name) name.style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget as HTMLElement;
                                el.style.borderColor = 'var(--border)';
                                el.style.background = 'rgba(255,255,255,0.04)';
                                el.style.transform = 'translateY(0)';
                                const name = el.querySelector<HTMLElement>('.sport-name');
                                if (name) name.style.color = 'var(--text-secondary)';
                            }}
                        >
                            <span style={{ fontSize: 36, lineHeight: 1 }}>{s.emoji}</span>
                            <span className="sport-name" style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', transition: 'color 0.2s' }}>{s.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
