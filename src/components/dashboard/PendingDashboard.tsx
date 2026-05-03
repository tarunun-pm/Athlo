'use client';

import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PendingDashboard({ profile, demandCounts }: { profile: any, demandCounts: any[] }) {
    const [statement, setStatement] = useState(profile.personal_statement || '');
    const supabase = createClient();

    const handleSaveStatement = async () => {
        await supabase.from('physio_profiles').update({ personal_statement: statement }).eq('id', profile.id);
        alert('Statement saved!');
    };

    return (
        <div className="space-y-6">

            {/* Zone 1: Review Status */}
            <div className="card p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Clock className="text-warning" size={24} />
                    Verification in Progress
                </h2>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-success text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <CheckCircle2 size={20} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-4 border-success/20 bg-success/5">
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-bold text-success">Profile Submitted</div>
                                <time className="text-xs font-mono text-text-muted">{new Date(profile.submitted_at || Date.now()).toLocaleDateString()}</time>
                            </div>
                            <div className="text-sm text-text-secondary">We have received your application.</div>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-surface text-warning shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <svg className="animate-spin" viewBox="0 0 24 24" fill="none" width="20" height="20">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                            </svg>
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-4 border-warning/20">
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-bold text-white">Document Verification</div>
                            </div>
                            <div className="text-sm text-text-secondary">
                                Cross-checking DCPTOT registration ({profile.dcptot_reg_id}) and degree records. Expected within 48 hours.
                            </div>
                        </div>
                    </div>

                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background text-text-muted shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <div className="w-3 h-3 rounded-full bg-border" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-4 opacity-50">
                            <div className="flex items-center justify-between mb-1">
                                <div className="font-bold text-text-muted">Go Live</div>
                            </div>
                            <div className="text-sm text-text-secondary">You'll be visible to athletes the moment we approve.</div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Zone 2: Profile Checklist */}
                <div className="card p-6 md:p-8 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-white mb-2">Complete your profile</h3>
                    <p className="text-sm text-text-secondary mb-6">Athletes see a complete profile — finish these before you go live.</p>

                    <ul className="space-y-4 flex-1">
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="text-success shrink-0" size={20} />
                            <span className="text-sm text-text-muted">Basic details</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="text-success shrink-0" size={20} />
                            <span className="text-sm text-text-muted">Specializations</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="text-success shrink-0" size={20} />
                            <span className="text-sm text-text-muted">Credentials submitted</span>
                        </li>

                        <li className="flex items-start gap-3 pt-2">
                            {profile.is_availability_set ? <CheckCircle2 className="text-success shrink-0 mt-0.5" size={20} /> : <div className="w-5 h-5 rounded-full border border-border shrink-0 mt-0.5" />}
                            <div>
                                <span className={`text-sm block ${profile.is_availability_set ? 'text-text-muted' : 'text-white'}`}>Availability slots</span>
                                {!profile.is_availability_set && <Link href="/physio/availability" className="text-sm text-primary hover:underline block mt-1">Set now →</Link>}
                            </div>
                        </li>

                        <li className="flex items-start gap-3">
                            {profile.personal_statement ? <CheckCircle2 className="text-success shrink-0 mt-0.5" size={20} /> : <div className="w-5 h-5 rounded-full border border-border shrink-0 mt-0.5" />}
                            <div className="w-full">
                                <span className={`text-sm block ${profile.personal_statement ? 'text-text-muted' : 'text-white'}`}>Personal statement</span>
                                {!profile.personal_statement && (
                                    <div className="mt-2 space-y-2">
                                        <textarea value={statement} onChange={e => setStatement(e.target.value)} className="input-field min-h-[80px] text-sm resize-none" placeholder="Write a short pitch to athletes..." />
                                        <button onClick={handleSaveStatement} className="text-sm text-primary font-medium hover:underline">Save</button>
                                    </div>
                                )}
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Zone 3: Demand Signal */}
                {demandCounts.length > 0 && (
                    <div className="card p-6 md:p-8 flex flex-col h-full bg-primary/5 border-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-primary"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-6 relative z-10">What's waiting for you</h3>

                        <div className="space-y-4 mb-6 relative z-10 flex-1">
                            {demandCounts.map(d => (
                                <div key={d.sport} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-white font-medium">{d.count} athletes</span>
                                    <span className="text-text-secondary">looking for {d.sport} physios</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary/50" />
                                <span className="text-white font-medium">{Math.floor(Math.random() * 10) + 1} athletes</span>
                                <span className="text-text-secondary">looking for {profile.injury_specializations[0]} specialists</span>
                            </div>
                        </div>

                        <p className="text-sm text-text-muted relative z-10 mt-auto pt-4 border-t border-border">
                            These athletes will see your profile the moment you're approved.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}
