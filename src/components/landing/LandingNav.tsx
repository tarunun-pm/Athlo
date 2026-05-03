'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme, THEMES } from '@/components/ThemeProvider';

export default function LandingNav() {
    const [scrolled, setScrolled] = useState(false);
    const { theme, setTheme } = useTheme();

    // Determine if we're in a "dark" mode relative to our simple landing page
    const isDark = THEMES.find(t => t.id === theme)?.type !== 'light';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        setTheme(isDark ? 'clinical-white' : 'midnight');
    };

    return (
        <nav
            id="landing-nav"
            className="fixed top-0 w-full h-16 z-50 flex items-center justify-between px-12"
            style={{
                background: scrolled
                    ? (isDark ? 'rgba(6,10,18,0.97)' : 'rgba(248,250,252,0.97)')
                    : (isDark ? 'rgba(6,10,18,0.75)' : 'rgba(248,250,252,0.85)'),
                backdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid var(--border)',
                transition: 'background 0.3s',
            }}
        >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5">
                <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>
                    <span style={{ color: '#F97316' }}>⚡</span> Athlos
                </span>
            </Link>

            {/* Center Links */}
            <div className="hidden md:flex gap-8">
                {[
                    { label: 'Home', href: '#' },
                    { label: 'How it Works', href: '#hiw' },
                    { label: 'For Physios', href: '#for-physios' },
                    { label: 'Sports', href: '#sports' },
                ].map((link) => (
                    <a
                        key={link.label}
                        href={link.href}
                        className="relative group text-sm font-medium transition-colors"
                        style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                        {link.label}
                        <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-current transition-all duration-300 group-hover:w-full" />
                    </a>
                ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-11 h-6 rounded-full border flex items-center relative transition-all"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                    aria-label="Toggle theme"
                >
                    <div
                        className="w-[18px] h-[18px] rounded-full absolute transition-all duration-300 flex items-center justify-center text-[10px]"
                        style={{
                            background: isDark ? '#2563EB' : '#F59E0B',
                            left: isDark ? '3px' : 'calc(100% - 21px)',
                        }}
                    >
                        {isDark ? '🌙' : '☀️'}
                    </div>
                </button>

                <div className="flex items-center gap-3 relative">
                    <Link
                        href="/auth/signin"
                        className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors pr-2 border-r border-border/50"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                    >
                        Log In
                    </Link>

                    <Link
                        href="/auth/signup?role=physio"
                        className="hidden sm:inline-flex items-center px-4 h-9 rounded-full text-sm font-semibold transition-all"
                        style={{
                            fontFamily: 'var(--font-dm-sans)',
                            color: '#10B981',
                            border: '1px solid #10B981',
                            background: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = '#10B981';
                            (e.currentTarget as HTMLElement).style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.color = '#10B981';
                        }}
                    >
                        Join as Physio
                    </Link>
                </div>

                <Link
                    href="/auth/signup"
                    className="inline-flex items-center px-4 h-9 rounded-full text-sm font-bold text-white transition-all"
                    style={{
                        fontFamily: 'var(--font-dm-sans)',
                        background: '#2563EB',
                        boxShadow: '0 0 20px rgba(37,99,235,0.35)',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1.03)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = 'scale(1)')}
                >
                    Find a Physio →
                </Link>
            </div>
        </nav>
    );
}
