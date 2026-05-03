'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { IndianRupee, TrendingUp, AlertCircle, ArrowDownRight, Wallet, Siren, ShieldCheck } from 'lucide-react';

export default function PhysioEarningsClient({ initialSessions }: { initialSessions: any[] }) {
    const [filter, setFilter] = useState<'all' | 'marketplace' | 'private_client' | 'emergency'>('all');

    // Derived statistics
    const totalGross = initialSessions.reduce((sum, s) => sum + (s.amount || 0) + (s.emergency_surcharge || 0), 0);
    const totalSurcharges = initialSessions.reduce((sum, s) => sum + (s.emergency_surcharge || 0), 0);
    const totalCommissions = initialSessions.reduce((sum, s) => {
        const amt = s.amount || 0;
        const rate = s.commission_rate || 0;
        return sum + ((amt * rate) / 100);
    }, 0);
    
    // Net is already computed by the trigger, but fallback for safety
    const netEarnings = initialSessions.reduce((sum, s) => sum + (s.net_physio_earnings || 0), 0);

    const filteredSessions = initialSessions.filter(s => {
        if (filter === 'all') return true;
        if (filter === 'marketplace') return s.session_origin === 'marketplace';
        if (filter === 'private_client') return s.session_origin === 'private_client';
        if (filter === 'emergency') return s.emergency_surcharge > 0;
        return true;
    });

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Top Level KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-6 border-transparent bg-gradient-to-br from-surface to-[#11141A]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-text-secondary font-bold uppercase tracking-wider text-xs">Net Earnings</div>
                        <div className="w-8 h-8 rounded-full bg-success/20 text-success flex items-center justify-center"><Wallet size={16} /></div>
                    </div>
                    <div className="text-3xl font-syne font-bold text-white mb-1 flex items-center gap-1">
                        <IndianRupee size={24} className="opacity-50" />
                        {Math.floor(netEarnings).toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-success flex items-center gap-1 mt-2">
                        <TrendingUp size={14} /> Available to withdraw
                    </div>
                </div>

                <div className="card p-6 border-transparent bg-surface">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-text-secondary font-bold uppercase tracking-wider text-xs">Total Gross</div>
                        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center"><IndianRupee size={16} /></div>
                    </div>
                    <div className="text-3xl font-syne font-bold text-white mb-1 flex items-center gap-1">
                        <span className="text-text-muted text-xl">₹</span>
                        {Math.floor(totalGross).toLocaleString()}
                    </div>
                    <div className="text-sm text-text-muted mt-2">Before deductions</div>
                </div>

                <div className="card p-6 border-transparent bg-surface">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-text-secondary font-bold uppercase tracking-wider text-xs">Platform Fee</div>
                        <div className="w-8 h-8 rounded-full bg-error/20 text-error flex items-center justify-center"><ArrowDownRight size={16} /></div>
                    </div>
                    <div className="text-3xl font-syne font-bold text-white mb-1 flex items-center gap-1">
                        <span className="text-text-muted text-xl">₹</span>
                        {Math.floor(totalCommissions).toLocaleString()}
                    </div>
                    <div className="text-sm text-text-muted mt-2">15% Marketplace / 5% Private</div>
                </div>

                <div className="card p-6 border-transparent bg-error/5 border-error/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-error font-bold uppercase tracking-wider text-xs">Emergency Bonus</div>
                        <div className="w-8 h-8 rounded-full bg-error/20 text-error flex items-center justify-center"><Siren size={16} /></div>
                    </div>
                    <div className="text-3xl font-syne font-bold text-white mb-1 flex items-center gap-1">
                        <span className="text-text-muted text-xl">₹</span>
                        {Math.floor(totalSurcharges).toLocaleString()}
                    </div>
                    <div className="text-sm text-error/80 mt-2">100% retained by you</div>
                </div>
            </div>

            {/* Minimum Floor Info Box */}
            <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl flex items-start gap-4 shadow-[0_0_20px_rgba(37,99,235,0.05)]">
                <ShieldCheck className="text-primary shrink-0 mt-0.5" size={24} />
                <div className="flex-1">
                    <h3 className="font-bold text-primary mb-1">Athlo Minimum Earnings Guarantee</h3>
                    <p className="text-sm text-text-secondary">If a marketplace session falls below ₹200 after commission deductions, Athlo automatically waives the fee diff to ensure your net takeout never drops below ₹200. Private clients are untaxed below ₹200.</p>
                </div>
            </div>

            {/* Ledger */}
            <div className="card p-0 overflow-hidden border-border bg-surface">
                <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-white">Earnings Ledger</h3>
                    <div className="flex bg-background border border-border p-1 rounded-lg">
                        {(['all', 'marketplace', 'private_client', 'emergency'] as const).map(f => (
                            <button 
                                key={f} 
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-xs font-bold transition-colors rounded-md capitalize ${filter === f ? 'bg-primary text-white shadow-glow' : 'text-text-muted hover:text-white'}`}
                            >
                                {f.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background text-text-muted text-xs uppercase tracking-wider border-b border-border/50">
                                <th className="p-4 font-bold">Date</th>
                                <th className="p-4 font-bold">Patient</th>
                                <th className="p-4 font-bold">Origin</th>
                                <th className="p-4 font-bold text-right text-warning">Gross</th>
                                <th className="p-4 font-bold text-right text-error">Fee/Surcharge</th>
                                <th className="p-4 font-bold text-right text-success">Net Earnings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredSessions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-text-muted">No sessions found matching this filter.</td>
                                </tr>
                            ) : (
                                filteredSessions.map(s => {
                                    const baseAmt = s.amount || 0;
                                    const surcharge = s.emergency_surcharge || 0;
                                    const rate = s.commission_rate || 0;
                                    const fee = (baseAmt * rate) / 100;
                                    const net = s.net_physio_earnings || (baseAmt - fee + surcharge);

                                    return (
                                        <tr key={s.id} className="hover:bg-background/50 transition-colors">
                                            <td className="p-4 text-sm text-white">{format(new Date(s.scheduled_at), 'dd MMM yyyy')}</td>
                                            <td className="p-4 text-sm text-white font-medium">{s.athlete_profiles?.first_name} {s.athlete_profiles?.last_name}</td>
                                            <td className="p-4">
                                                <span className={`pill text-[10px] px-2 py-0.5 ${
                                                    s.session_origin === 'private_client' ? 'bg-primary/20 text-primary border-primary/30' : 
                                                    'bg-surface text-text-secondary border-border'
                                                }`}>
                                                    {s.session_origin === 'private_client' ? 'Private Link (5%)' : 'Marketplace (15%)'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm font-syne font-bold text-white text-right">
                                                ₹{(baseAmt + surcharge).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="text-xs font-bold text-error break-words w-max ml-auto">-₹{Math.floor(fee)}</div>
                                                {surcharge > 0 && <div className="text-xs font-bold text-success mt-0.5 w-max ml-auto">+₹{surcharge} <Siren size={10} className="inline mb-0.5" /></div>}
                                            </td>
                                            <td className="p-4 text-sm font-syne font-bold text-success text-right">
                                                ₹{Math.floor(net).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
