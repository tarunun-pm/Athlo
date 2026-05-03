'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, Languages, CheckCircle2, Navigation, MessageSquare, Calendar } from 'lucide-react';

const TABS = ['About', 'Reviews', 'Treatments', 'Tips & QnA', 'Packages'];

export default function PhysioProfileClient({ profile, reviews }: { profile: any, reviews: any[] }) {
    const [activeTab, setActiveTab] = useState('About');

    // Defensive defaults for arrays mapping
    const sports = profile.sport_specializations || [];
    const injuries = profile.injury_specializations || [];
    const languages = profile.languages || [];

    return (
        <div className="max-w-6xl mx-auto pb-24 space-y-8">

            {/* Overview Head Card */}
            <div className="card p-8 bg-gradient-to-br from-[#1C1F26] to-[#121417] border-t-2 border-t-primary">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary shrink-0">
                            <span className="text-3xl font-bold font-syne">{profile.first_name?.[0]}{profile.last_name?.[0]}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-white tracking-tight">
                                    Dr. {profile.first_name} {profile.last_name}
                                </h1>
                                <CheckCircle2 className="text-primary" size={20} />
                            </div>
                            <p className="text-text-secondary font-medium text-lg mb-3">
                                {sports[0]} & {injuries[0]} Specialist
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
                                <span className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-full border border-border">
                                    <Star className="text-warning fill-warning" size={16} />
                                    <span className="text-white font-medium">4.9</span> (124)
                                </span>
                                <span className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-full border border-border">
                                    <MapPin size={16} />
                                    {profile.location_locality}
                                </span>
                                <span className="flex items-center gap-1.5 bg-background px-3 py-1 rounded-full border border-border">
                                    <Languages size={16} />
                                    {languages.join(', ') || 'English, Hindi'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                        <div className="text-right">
                            <span className="text-2xl font-bold text-white tracking-tight">₹{profile.consultation_rate || 500}</span>
                            <span className="text-sm text-text-secondary">/session</span>
                        </div>
                        <Link
                            href={`/athlete/book/${profile.id}`}
                            className="btn-primary w-full md:w-48 shadow-glow"
                        >
                            Book Session
                        </Link>
                    </div>

                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
                <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 text-sm font-bold relative whitespace-nowrap transition-colors ${activeTab === tab
                                    ? 'text-white'
                                    : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full shadow-[0_-2px_8px_rgba(0,102,255,0.8)]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left Column (Main Content) */}
                <div className="md:col-span-2 space-y-8">

                    {activeTab === 'About' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">

                            <section>
                                <h3 className="text-lg font-bold text-white mb-4">About Me</h3>
                                <p className="text-text-secondary leading-relaxed bg-surface p-6 rounded-[24px] border border-border">
                                    {profile.personal_statement || `Hi, I'm Dr. ${profile.last_name}. I specialize in sports rehabilitation with a focus on fast recovery for competitive athletes. I believe in evidence-based protocols combined with active movement.`}
                                </p>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-4">Specializations</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-surface p-5 rounded-[20px] border border-border">
                                        <span className="text-xs text-text-muted font-bold tracking-wider uppercase mb-3 block">Sports</span>
                                        <div className="flex flex-wrap gap-2">
                                            {sports.map((s: string) => <span key={s} className="pill py-1 px-3 text-white border-border-strong">{s}</span>)}
                                        </div>
                                    </div>
                                    <div className="bg-surface p-5 rounded-[20px] border border-border">
                                        <span className="text-xs text-text-muted font-bold tracking-wider uppercase mb-3 block">Injuries</span>
                                        <div className="flex flex-wrap gap-2">
                                            {injuries.map((i: string) => <span key={i} className="pill py-1 px-3 text-white border-border-strong">{i}</span>)}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-lg font-bold text-white mb-4">Focus Record</h3>
                                <div className="bg-surface border border-border rounded-[24px] p-6 flex items-center justify-between">
                                    <div>
                                        <div className="text-2xl font-bold text-white mb-1">20+</div>
                                        <div className="text-sm text-text-muted">{sports[0]} Athletes Recovered</div>
                                    </div>
                                    <div className="w-[1px] h-12 bg-border"></div>
                                    <div>
                                        <div className="text-2xl font-bold text-white mb-1">100%</div>
                                        <div className="text-sm text-text-muted">Return-to-play Rate</div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    )}

                    {activeTab === 'Reviews' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {reviews.length === 0 ? (
                                <div className="bg-surface border border-border rounded-[24px] p-12 text-center text-text-muted">
                                    <MessageSquare size={32} className="mx-auto mb-4 opacity-50" />
                                    No reviews available yet.
                                </div>
                            ) : (
                                reviews.map(r => (
                                    <div key={r.id} className="bg-surface border border-border rounded-[24px] p-6">
                                        <div className="flex items-center gap-1 mb-3 text-warning">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill={i <= r.rating ? 'currentColor' : 'none'} />)}
                                        </div>
                                        <p className="text-text-primary text-sm leading-relaxed mb-4">{r.review_text}</p>
                                        <div className="flex items-center gap-2 text-xs text-text-muted">
                                            <span className="font-bold">Athlete A.</span>
                                            <span>•</span>
                                            <span>{new Date(r.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Placeholders for other tabs to meet Phase 3 MVP rules */}
                    {['Treatments', 'Tips & QnA', 'Packages'].includes(activeTab) && (
                        <div className="bg-surface border border-border rounded-[24px] p-12 text-center text-text-muted animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <p className="font-medium text-white mb-2">{activeTab}</p>
                            <p className="text-sm">Information will be available soon.</p>
                        </div>
                    )}

                </div>

                {/* Right Column (Widget Context) */}
                <div className="md:col-span-1 border-l border-border/50 pl-0 md:pl-8 space-y-6">
                    <div className="card p-6 border-transparent bg-gradient-to-b from-[#1C1F26] to-background">
                        <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Consultation Details</h4>

                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <Navigation size={18} className="text-primary shrink-0" />
                                <span className="text-sm text-text-secondary">{profile.consultation_modes?.join(', ') || 'Online'}</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Calendar size={18} className="text-primary shrink-0" />
                                <span className="text-sm text-text-secondary">Mon-Sun (Flexible slots)</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
