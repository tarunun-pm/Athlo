'use client';

import { useEffect, useRef } from 'react';

const STATS = [
    { target: 1200, label: 'Athletes on Platform' },
    { target: 85, label: 'Verified Physios' },
    { target: 3400, label: 'Sessions Completed' },
];

export default function LandingStatsBar() {
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;

        const counters = document.querySelectorAll<HTMLElement>('.stat-num-val');

        const animate = (el: HTMLElement, target: number) => {
            const start = performance.now();
            const dur = 2000;
            const update = (now: number) => {
                const p = Math.min((now - start) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(eased * target).toLocaleString();
                if (p < 1) requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !ran.current) {
                    ran.current = true;
                    counters.forEach((el) => {
                        animate(el, parseInt(el.dataset.target || '0', 10));
                    });
                }
            },
            { threshold: 0.5 }
        );

        const bar = document.getElementById('stats-bar');
        if (bar) observer.observe(bar);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            id="stats-bar"
            className="flex items-center justify-center"
            style={{
                background: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                height: 80,
            }}
        >
            <div className="flex items-center">
                {STATS.map((s, i) => (
                    <div key={s.label} className="flex items-center">
                        {i > 0 && <div style={{ width: 1, height: 28, background: 'var(--border)', margin: '0 40px' }} />}
                        <div className="px-10 text-center">
                            <div style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                                <span
                                    className="stat-num-val"
                                    data-target={s.target}
                                >
                                    0
                                </span>
                                + {s.label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
