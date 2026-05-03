'use client';

import Link from 'next/link';

const NAV_LINKS = [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Join as Physio', href: '/auth/signup?role=physio' },
];

export default function LandingFooter() {
    return (
        <footer
            id="footer"
            style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', padding: '60px 0 40px' }}
        >
            <div className="max-w-[1280px] mx-auto px-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* Brand */}
                    <div>
                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
                            <span style={{ color: '#F97316' }}>⚡</span> Athlos
                        </div>
                        <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Sports Recovery, Simplified.</div>
                        <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>India · 2026-2027</div>
                    </div>

                    {/* Links */}
                    <div className="flex flex-col gap-2.5">
                        {NAV_LINKS.map((l) => (
                            <Link
                                key={l.label}
                                href={l.href}
                                className="transition-colors"
                                style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-secondary)' }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                            >
                                {l.label}
                            </Link>
                        ))}
                    </div>

                    {/* Tagline */}
                    <div className="md:text-right">
                        <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            &ldquo;Built for athletes.<br />Trusted by physios.&rdquo;
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div
                    style={{
                        borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 40,
                        fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center',
                    }}
                >
                    © 2026-2027 Athlos. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
