'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Calendar, Wallet, User as UserIcon, Activity, FileText, ChevronRight } from 'lucide-react';

export default function ApprovedDashboard({ profile, activeCases = [] }: { profile: any, activeCases?: any[] }) {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Show banner only on first load after approval
        const hasSeen = localStorage.getItem(`seen_approval_${profile.id}`);
        if (!hasSeen) {
            setShowBanner(true);
            localStorage.setItem(`seen_approval_${profile.id}`, 'true');
        }
    }, [profile.id]);

    return (
        <div className="space-y-6">

            {/* First Load Success Banner */}
            {showBanner && (
                <div className="bg-success/10 border border-success/30 p-4 rounded-xl flex items-start gap-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 className="text-success shrink-0 mt-0.5" size={24} />
                    <div className="flex-1">
                        <h3 className="font-bold text-success mb-1">You're live on Athlo!</h3>
                        <p className="text-sm text-success/80">
                            Your profile has been approved. Athletes near you can now find and book your services.
                        </p>
                    </div>
                    <button onClick={() => setShowBanner(false)} className="text-success/50 hover:text-success pb-2 px-2">&times;</button>
                </div>
            )}

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Stats/Quick Links) */}
                <div className="lg:col-span-1 space-y-6">

                    <div className="card p-6 border-transparent bg-gradient-to-br from-surface to-background shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4 border border-primary/50">
                            <UserIcon size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Dr. {profile.first_name} {profile.last_name}</h3>
                        <p className="text-sm text-primary font-medium">{profile.sport_specializations[0]} Specialist</p>

                        <div className="mt-6 pt-6 border-t border-border space-y-3">
                            <Link href="/physio/profile" className="text-sm text-text-secondary hover:text-white flex items-center justify-between group">
                                Edit Public Profile
                                <span className="text-border group-hover:text-primary transition-colors">→</span>
                            </Link>
                            <Link href="/physio/availability" className="text-sm text-text-secondary hover:text-white flex items-center justify-between group">
                                Manage Schedule
                                <span className="text-border group-hover:text-primary transition-colors">→</span>
                            </Link>
                        </div>
                    </div>

                    <div className="card p-6 flex flex-col justify-between h-40">
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-full bg-[#10B981]/10 flex items-center justify-center text-success">
                                <Wallet size={20} />
                            </div>
                            <span className="text-xs font-mono text-success uppercase font-bold tracking-wider">Earnings</span>
                        </div>
                        <div>
                            <div className="text-3xl font-syne font-bold text-white mb-1">₹0</div>
                            <p className="text-xs text-text-muted">Available for payout</p>
                        </div>
                    </div>

                </div>

                {/* Right Column (Core Actions / Feeds) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Availability Blocker */}
                    {!profile.is_availability_set && (
                        <div className="card p-8 border-primary/50 bg-primary/10 relative overflow-hidden flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">You remain hidden from search.</h3>
                            <p className="text-text-secondary mb-8 max-w-sm">
                                Athletes cannot book you until you define your consultation rates and weekly schedule.
                            </p>
                            <Link href="/physio/availability" className="btn-primary w-full max-w-[200px] shadow-glow">
                                Set Availability →
                            </Link>
                        </div>
                    )}

                    {/* Matches / Leads */}
                    {profile.is_availability_set && activeCases.length === 0 && (
                        <div className="card h-full flex flex-col">
                            <div className="p-6 border-b border-border flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Activity className="text-primary" size={20} />
                                    Live Leads
                                </h3>
                                <span className="px-3 py-1 rounded-full bg-[#121417] text-xs font-medium text-text-muted border border-border">
                                    Matching {profile.sport_specializations?.[0]}
                                </span>
                            </div>

                            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center min-h-[300px]">
                                {/* Empty State visual for Live Leads until bookings flow is active */}
                                <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted mb-4">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                                </div>
                                <h4 className="text-white font-bold mb-2">No active sessions yet</h4>
                                <p className="text-sm text-text-secondary max-w-xs">
                                    Your profile is live and actively matching with athletes in your locality.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Active Athlete Cases */}
                    {activeCases.length > 0 && (
                        <div className="card p-0 overflow-hidden flex flex-col h-full">
                            <div className="p-6 border-b border-border/50 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <FileText className="text-primary" size={20} />
                                    Active Cases
                                </h3>
                                <Link href="/physio/patients" className="text-sm font-medium text-primary hover:underline">
                                    View Patients
                                </Link>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <div className="divide-y divide-border/50">
                                    {activeCases.map((c: any) => (
                                        <Link key={c.id} href={`/physio/cases/${c.id}`} className="block p-6 hover:bg-surface/50 transition-colors group">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="text-white font-bold text-lg group-hover:text-primary transition-colors">
                                                    {c.athlete_profiles.first_name} {c.athlete_profiles.last_name}
                                                </h4>
                                                <ChevronRight size={16} className="text-text-muted group-hover:text-primary transition-colors" />
                                            </div>
                                            <div className="text-sm text-text-secondary">
                                                <span className="text-white font-medium">{c.injury_type}</span> • {c.body_part}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}
