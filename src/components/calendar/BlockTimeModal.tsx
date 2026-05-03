'use client';

import { useState } from 'react';
import { ShieldAlert, Loader2, X, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function BlockTimeModal({ 
    physioId, 
    onClose 
}: { 
    physioId: string, 
    onClose: () => void 
}) {
    const [date, setDate] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [conflicts, setConflicts] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const handleCheckConflicts = async () => {
        if (!date) return;
        setIsChecking(true);
        setError(null);
        setConflicts(null);

        try {
            const { data, error: rpcError } = await supabase.rpc('check_block_conflicts', {
                p_physio_id: physioId,
                p_target_date: date
            });

            if (rpcError) throw rpcError;
            
            if (data.has_conflicts) {
                setConflicts(data.conflicts);
            } else {
                setConflicts([]);
            }
        } catch (err: any) {
            console.error(err);
            setError('Failed to check for scheduling conflicts.');
        } finally {
            setIsChecking(false);
        }
    };

    const handleApplyBlock = async () => {
        setIsApplying(true);
        setError(null);
        
        try {
            const { data, error: rpcError } = await supabase.rpc('apply_day_block', {
                p_physio_id: physioId,
                p_target_date: date
            });

            if (rpcError) throw rpcError;
            if (!data.success) throw new Error(data.message);

            setSuccess(true);
            setTimeout(() => {
                onClose();
                window.location.reload();
            }, 1000);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to block the selected day.');
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
            <div className="card w-full max-w-lg p-8 bg-surface border-border shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-white"
                >
                    <X size={20} />
                </button>

                <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center text-error mb-6">
                    <ShieldAlert size={24} />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Block Time Off</h3>
                <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                    Prevent athletes from booking sessions on a specific day. All open slots will be removed.
                </p>

                {error && <div className="bg-error/10 text-error p-3 rounded-lg text-sm font-bold mb-6">{error}</div>}
                
                {success ? (
                    <div className="text-center py-6">
                        <div className="text-success text-lg font-bold">Successfully Blocked!</div>
                        <p className="text-text-secondary text-sm mt-2">Refreshing calendar...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-white mb-1.5">Date to Block</label>
                            <div className="flex gap-3">
                                <input 
                                    type="date" 
                                    required 
                                    value={date}
                                    onChange={e => {
                                        setDate(e.target.value);
                                        setConflicts(null);
                                    }}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-error focus:outline-none" 
                                />
                                <button
                                    type="button"
                                    onClick={handleCheckConflicts}
                                    disabled={!date || isChecking}
                                    className="btn-outline border-border shrink-0 px-6 disabled:opacity-50"
                                >
                                    {isChecking ? <Loader2 className="animate-spin w-4 h-4" /> : 'Scan Day'}
                                </button>
                            </div>
                        </div>

                        {/* CONFLICTS VIEW */}
                        {conflicts !== null && (
                            <div className="pt-4 border-t border-border/50">
                                {conflicts.length > 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3 text-warning bg-warning/10 p-3 rounded-xl border border-warning/20">
                                            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                            <p className="text-sm font-medium">
                                                You cannot block this day yet. You have {conflicts.length} confirmed session{conflicts.length > 1 ? 's' : ''} or pending invite{conflicts.length > 1 ? 's' : ''}. Please resolve them first by cancelling or rescheduling.
                                            </p>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                            {conflicts.map((c: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center bg-background rounded-lg p-3 border border-border text-sm">
                                                    <span className="text-white font-medium">{c.start_time.substring(0, 5)} - {c.end_time.substring(0, 5)}</span>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${c.status === 'booked' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                                                        {c.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-success p-3 rounded-xl border border-success/20 bg-success/5">
                                        <ShieldAlert size={18} />
                                        <p className="text-sm font-medium">Day is clear of existing bookings. Safe to block.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={handleApplyBlock}
                            disabled={conflicts === null || conflicts.length > 0 || isApplying}
                            className="w-full py-3 px-4 bg-error hover:bg-error/90 text-white placeholder-opacity-50 font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(200,50,50,0.3)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
                        >
                            {isApplying ? <Loader2 className="animate-spin w-5 h-5" /> : 'Apply Full Day Block'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
