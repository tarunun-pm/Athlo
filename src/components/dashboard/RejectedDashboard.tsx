'use client';

import { CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function RejectedDashboard({ profile, demandCounts }: { profile: any, demandCounts: any[] }) {
    return (
        <div className="space-y-6">

            {/* Zone 1: Rejection Status */}
            <div className="card p-6 md:p-8 border-error/50 bg-[#2b1616]/50">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-error/20 text-error flex items-center justify-center shrink-0">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Action needed to verify profile</h2>
                        <p className="text-error/90 mb-4">{profile.rejection_reason || 'There was an issue verifying your documents. Please review and update them.'}</p>

                        <div className="flex gap-4">
                            <Link href="/onboarding/physio/step-2" className="btn-primary bg-error hover:bg-error/80 text-white rounded-[10px] py-2">
                                Update Documents
                            </Link>
                            <button className="btn-outline border-error/30 text-error hover:border-error/80 hover:bg-error/10 py-2 rounded-[10px]">
                                Contact Support
                            </button>
                        </div>
                        <p className="text-xs text-text-muted mt-4">Once you resubmit, we'll re-review within 48 working hours.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile completion and Demand signals reuse simple layouts here or could extract components */}
                <div className="card p-6 md:p-8 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-white mb-6">Complete your profile</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3">
                            <CheckCircle2 className="text-success shrink-0" size={20} />
                            <span className="text-sm text-text-muted">Basic details & Specializations</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <AlertTriangle className="text-error shrink-0" size={20} />
                            <span className="text-sm text-error">Credentials rejected</span>
                        </li>
                        <li className="flex items-start gap-3">
                            {profile.is_availability_set ? <CheckCircle2 className="text-success shrink-0 mt-0.5" size={20} /> : <div className="w-5 h-5 rounded-full border border-border shrink-0 mt-0.5" />}
                            <div>
                                <span className={`text-sm block ${profile.is_availability_set ? 'text-text-muted' : 'text-white'}`}>Availability slots</span>
                                {!profile.is_availability_set && <Link href="/physio/availability" className="text-sm text-primary hover:underline block mt-1">Set now →</Link>}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
