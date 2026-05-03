'use client';

import Link from 'next/link';

const CHECKLIST = [
    'Manual verification — credentials properly checked, not auto-approved',
    'Sport-specific matching — athletes filtered to your exact specialization',
    'Platform-locked reputation — your reviews stay with you, not transferable',
];

export default function LandingPhysioCTA() {
    return (
        <section
            id="for-physios"
            style={{
                background: 'linear-gradient(160deg,#060A12 0%,#0D1525 60%,#060A12 100%)',
                borderTop: '1px solid rgba(37,99,235,0.2)',
                padding: '120px 0',
            }}
        >
            <div className="max-w-[1280px] mx-auto px-12">
                <div className="grid grid-cols-1 md:grid-cols-[55fr_45fr] gap-16 items-center">

                    {/* Left */}
                    <div>
                        <span
                            style={{
                                fontFamily: 'var(--font-dm-sans)', fontWeight: 700, fontSize: 11,
                                textTransform: 'uppercase', letterSpacing: '0.12em',
                                color: '#10B981', display: 'block', marginBottom: 16,
                            }}
                        >
                            For Physios
                        </span>
                        <h2
                            style={{
                                fontFamily: 'var(--font-syne)', fontWeight: 700,
                                fontSize: 'clamp(32px,3.5vw,50px)', lineHeight: 1.05,
                                color: 'var(--text-primary)', marginBottom: 16,
                            }}
                        >
                            Your expertise deserves better than word-of-mouth.
                        </h2>
                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.65 }}>
                            Join a verified network of sports physios. Get matched to athletes who need your exact specialization — automatically.
                        </p>

                        {CHECKLIST.map((item, i) => (
                            <div key={i} className="flex gap-3 items-start mb-4">
                                <div
                                    className="flex items-center justify-center shrink-0 mt-0.5"
                                    style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,0.15)' }}
                                >
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4l3 3 5-6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-primary)' }}>{item}</span>
                            </div>
                        ))}

                        <Link
                            href="/auth/signup?role=physio"
                            className="inline-flex items-center mt-4 px-8 py-3.5 rounded-full font-bold text-white transition-opacity hover:opacity-90"
                            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, background: '#10B981' }}
                        >
                            Apply as a Physio →
                        </Link>
                    </div>

                    {/* Right — Glassmorphism Application Card */}
                    <div
                        style={{
                            background: 'rgba(13,21,37,0.7)', backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24,
                            padding: 32,
                        }}
                    >
                        <div style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 6 }}>
                            Start your application
                        </div>
                        <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                            Takes less than 10 minutes
                        </div>

                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full mb-3 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                                color: 'var(--text-primary)', fontFamily: 'var(--font-dm-sans)',
                            }}
                            onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#10B981'; }}
                            onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                        />
                        <input
                            type="text"
                            placeholder="Primary Specialization (e.g. Cricket · ACL)"
                            className="w-full mb-3 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                                color: 'var(--text-primary)', fontFamily: 'var(--font-dm-sans)',
                            }}
                            onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#10B981'; }}
                            onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                        />
                        <input
                            type="email"
                            placeholder="Professional Email"
                            className="w-full mb-4 px-4 py-3 rounded-xl text-sm outline-none transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                                color: 'var(--text-primary)', fontFamily: 'var(--font-dm-sans)',
                            }}
                            onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#10B981'; }}
                            onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                        />

                        <Link
                            href="/auth/signup?role=physio"
                            className="block w-full text-center py-3.5 rounded-full font-bold text-white transition-opacity hover:opacity-90"
                            style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, background: '#10B981' }}
                        >
                            Start Application →
                        </Link>

                        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
                            Zero upfront cost · 48hr verification · Delhi NCR
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
