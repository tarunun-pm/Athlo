'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle2, XCircle, Search, MapPin, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function EmergencyStatusPage({ params }: { params: { requestId: string } }) {
    const supabase = createClient();
    const [request, setRequest] = useState<any>(null);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch initial state
        const fetchState = async () => {
            const { data: req } = await supabase.from('emergency_requests')
                .select('*, physio_profiles!accepted_physio_id(first_name, last_name, consultation_rate)')
                .eq('id', params.requestId)
                .single();
            
            const { data: att } = await supabase.from('emergency_request_attempts')
                .select('physio_id, response, expires_at, physio_profiles(first_name, last_name)')
                .eq('request_id', params.requestId)
                .order('sent_at', { ascending: false });

            if (req) setRequest(req);
            if (att) setAttempts(att);
            setLoading(false);
        };
        
        fetchState();

        // Subscribe to changes on the request and attempts tables realtime
        const channel = supabase.channel(`emergency_${params.requestId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'emergency_requests', filter: `id=eq.${params.requestId}` }, (payload) => {
                fetchState(); // Re-fetch heavy join to be safe
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_request_attempts', filter: `request_id=eq.${params.requestId}` }, (payload) => {
                fetchState();
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'emergency_request_attempts', filter: `request_id=eq.${params.requestId}` }, (payload) => {
                fetchState();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [params.requestId, supabase]);


    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-text-muted">
                <Loader2 size={32} className="animate-spin text-primary" />
                <p>Establishing secure connection...</p>
            </div>
        </div>
    );

    if (!request) return <div>Request not found.</div>;

    const isPending = request.status === 'pending';
    const isAccepted = request.status === 'accepted';
    const isNoMatch = request.status === 'no_match';
    const isExpired = request.status === 'expired';

    return (
        <div className="max-w-xl mx-auto pb-24 h-full flex flex-col pt-12">
            
            <div className="text-center mb-10">
                <div className="relative inline-flex mb-8">
                    {/* Pulsing rings if pending */}
                    {isPending && (
                        <>
                            <div className="absolute inset-0 rounded-full bg-error/20 animate-ping scale-150"></div>
                            <div className="absolute inset-0 rounded-full bg-error/40 animate-pulse scale-125"></div>
                        </>
                    )}
                    
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center relative z-10 shadow-2xl ${
                        isPending ? 'bg-error text-white' :
                        isAccepted ? 'bg-success text-white' : 'bg-surface border border-border text-text-muted'
                    }`}>
                        {isPending ? <Search size={40} className="animate-pulse" /> : 
                         isAccepted ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">
                    {isPending ? 'Scanning for Specialists...' :
                     isAccepted ? 'Match Confirmed' : 'No Specialists Available'}
                </h1>
                
                <p className="text-text-secondary">
                    {isPending ? `Contacting verified experts within 10km for ${request.body_part}...` :
                     isAccepted ? `Dr. ${request.physio_profiles.last_name} has accepted your request.` :
                     "We couldn't find an available physio to take this case right now."}
                </p>
            </div>

            {/* If Accepted Show Physio Details */}
            {isAccepted && (
                <div className="card p-6 bg-surface border-success/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] mb-8 animate-in slide-in-from-bottom-8">
                    <h3 className="text-xs uppercase font-bold text-success tracking-wider mb-4 border-b border-success/20 pb-3">Provider Locked</h3>
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-xl font-bold text-white">Dr. {request.physio_profiles.first_name} {request.physio_profiles.last_name}</div>
                        <div className="btn-primary py-1.5 px-3 text-xs shadow-glow pointer-events-none">On The Way / Ready</div>
                    </div>
                    <div className="bg-background rounded-xl p-4 border border-border">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-text-secondary">Emergency Base Rate</span>
                            <span className="text-white text-right">₹{request.physio_profiles.consultation_rate}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                            <span className="text-text-secondary flex items-center gap-1"><AlertTriangle size={12} className="text-warning"/> Emergency Surcharge</span>
                            <span className="text-white text-right">{request.physio_profiles.consultation_rate >= 2500 ? 'Waived (Capped)' : '₹500'}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-3 border-t border-border mt-2">
                            <span className="text-white">Estimated Total</span>
                            <span className="text-primary text-lg">₹{request.physio_profiles.consultation_rate >= 2500 ? request.physio_profiles.consultation_rate : request.physio_profiles.consultation_rate + 500}</span>
                        </div>
                    </div>
                    
                    <Link href="/athlete/sessions" className="btn-outline w-full justify-center mt-6">View Session Details</Link>
                </div>
            )}

            {/* Rejection / Timeout Card */}
            {isNoMatch && (
                <div className="card p-6 border-dashed border-border bg-transparent text-center mb-8">
                    <p className="text-text-secondary mb-4">All available specialists are currently engaged or unable to accept emergency requests at this exact moment.</p>
                    <Link href="/athlete/search" className="btn-primary shadow-glow">Browse All Specialists Manually</Link>
                </div>
            )}

            {/* Cascade Log */}
            <div className="card p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
                    <MapPin size={16} className="text-primary" /> Live Search Ping Log
                </h3>
                
                <div className="space-y-4">
                    {attempts.length === 0 && <p className="text-sm text-text-muted italic">Initiating radar ping...</p>}
                    
                    {attempts.map((att, i) => (
                        <div key={i} className="flex justify-between items-center bg-background rounded-xl p-3 border border-border/50">
                            <div>
                                <div className="text-sm font-bold text-white">Dr. {att.physio_profiles.last_name}</div>
                                <div className="text-xs text-text-muted">Ping sent</div>
                            </div>
                            <div className="text-right">
                                {att.response === 'accepted' ? (
                                    <span className="text-success text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle2 size={12}/> Match</span>
                                ) : att.response === 'declined' ? (
                                    <span className="text-text-secondary text-xs font-bold uppercase tracking-wider">Declined</span>
                                ) : att.response === 'expired' ? (
                                    <span className="text-text-muted text-xs font-bold uppercase tracking-wider">Timeout</span>
                                ) : (
                                    <span className="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse"><Loader2 size={12} className="animate-spin"/> Waiting...</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
