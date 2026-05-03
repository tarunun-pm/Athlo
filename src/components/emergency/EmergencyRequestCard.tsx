'use client';

import { useState, useEffect } from 'react';
import { Siren, Clock, User, CheckCircle2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function EmergencyRequestCard({ attempt, onRequestResolved }: { attempt: any, onRequestResolved: () => void }) {
    const supabase = createClient();
    const req = attempt.emergency_requests;
    const athlete = req.athlete_profiles;
    
    const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        const expiryTime = new Date(attempt.expires_at).getTime();
        
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
            setTimeLeft(diff);
            
            if (diff === 0) {
                clearInterval(interval);
                onRequestResolved(); // Assume expired handled by DB/cron
            }
        }, 1000);
        
        return () => clearInterval(interval);
    }, [attempt.expires_at, onRequestResolved]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleAccept = async () => {
        setIsSubmitting(true);
        // Call RPC
        const { error } = await supabase.rpc('accept_emergency_request', {
            p_attempt_id: attempt.id
        });
        setIsSubmitting(false);
        if (!error) onRequestResolved();
    };

    const handleDecline = async () => {
        setIsSubmitting(true);
        // Update attempt immediately so physio doesn't wait for cascade logic
        await supabase.from('emergency_request_attempts').update({ response: 'declined', responded_at: new Date().toISOString() }).eq('id', attempt.id);
        
        // Trigger cascade RPC in background
        supabase.rpc('cascade_emergency_request', { p_request_id: req.id });
        
        setIsSubmitting(false);
        onRequestResolved();
    };

    return (
        <div className="card p-0 border-error/40 shadow-[0_0_30px_rgba(239,68,68,0.2)] overflow-hidden relative animate-in zoom-in-95">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-error via-warning to-error bg-[length:200%_auto] animate-[shimmer_2s_linear_infinite]"></div>
            
            <div className="bg-error/10 p-4 border-b border-error/20 flex justify-between items-center">
                <div className="flex items-center gap-2 text-error font-bold">
                    <Siren size={20} className="animate-pulse" />
                    Emergency Request
                </div>
                <div className={`flex items-center gap-1.5 font-bold font-syne ${timeLeft < 60 ? 'text-error animate-pulse' : 'text-warning'}`}>
                    <Clock size={16} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                        <User size={20} className="text-text-muted" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white leading-tight">{athlete.first_name} {athlete.last_name}</h3>
                        <p className="text-sm text-text-secondary">{athlete.primary_sport || 'Athlete'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-background rounded-lg p-3 border border-border">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Injury</div>
                        <div className="font-bold text-white text-sm">{req.body_part}</div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-border">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Urgency</div>
                        <div className={`font-bold text-sm ${req.urgency === 'critical' ? 'text-error' : req.urgency === 'moderate' ? 'text-warning' : 'text-success'}`}>
                            {req.urgency.toUpperCase()}
                        </div>
                    </div>
                </div>

                {req.description && (
                    <div className="mb-6">
                        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Details</div>
                        <p className="text-sm text-text-secondary line-clamp-2 italic">"{req.description}"</p>
                    </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-border mt-2 mb-6">
                    <span className="text-text-secondary text-sm font-medium">Platform Surcharge Included</span>
                    <span className="text-success font-bold font-syne">+ ₹500</span>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={handleDecline}
                        disabled={isSubmitting}
                        className="btn-outline flex-1 border-border text-text-muted hover:text-white hover:border-white transition-colors"
                    >
                        Decline
                    </button>
                    <button 
                        onClick={handleAccept}
                        disabled={isSubmitting}
                        className="flex-[2] bg-success hover:bg-success/90 text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex justify-center, items-center gap-2"
                    >
                        <CheckCircle2 size={18} />
                        Accept Immediate Case
                    </button>
                </div>
            </div>
        </div>
    );
}
