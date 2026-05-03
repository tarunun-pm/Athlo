'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { Calendar, CheckCircle2, XCircle, Clock, Video, MapPin, Loader2, FileText } from 'lucide-react';
import { createNotification } from '@/lib/notifications';

type Session = {
    id: string;
    scheduled_at: string;
    status: 'upcoming' | 'completed' | 'cancelled' | 'no_show';
    consultation_mode: string;
    amount: number;
    physio_profiles: {
        id: string;
        first_name: string;
        last_name: string;
        sport_specializations: string[];
        location_locality: string;
    } | null;
};

export default function SessionsClient({ initialSessions }: { initialSessions: any[] }) {
    const [sessions, setSessions] = useState<Session[]>(initialSessions);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    const supabase = createClient();

    const upcoming = sessions.filter(s => s.status === 'upcoming' && new Date(s.scheduled_at) > new Date());
    const completed = sessions.filter(s => s.status === 'completed' || (s.status === 'upcoming' && new Date(s.scheduled_at) <= new Date()));
    const cancelled = sessions.filter(s => s.status === 'cancelled' || s.status === 'no_show');

    const handleCancel = async (id: string, scheduledAt: string) => {
        const hoursUntil = (new Date(scheduledAt).getTime() - new Date().getTime()) / (1000 * 60 * 60);
        if (hoursUntil < 24) {
            alert('Cannot cancel within 24 hours of the session.');
            return;
        }

        if (!confirm('Are you sure you want to cancel this session?')) return;

        setCancellingId(id);
        const { error } = await supabase.from('sessions').update({ status: 'cancelled' }).eq('id', id);
        setCancellingId(null);

        if (!error) {
            setSessions(sessions.map(s => s.id === id ? { ...s, status: 'cancelled' } : s));

            // Notify the physio about the cancellation
            const session = sessions.find(s => s.id === id);
            if (session?.physio_profiles?.id) {
                const { data: { user } } = await supabase.auth.getUser();
                const { data: athleteProfile } = await supabase
                    .from('athlete_profiles')
                    .select('first_name, last_name')
                    .eq('id', user?.id)
                    .single();

                await createNotification(supabase, {
                    userId: session.physio_profiles.id,
                    type: 'booking_cancelled',
                    title: 'Session Cancelled',
                    message: `${athleteProfile?.first_name || 'An athlete'} cancelled their session on ${format(new Date(scheduledAt), 'MMM dd')}.`,
                    link: '/physio/sessions',
                });
            }
        } else {
            alert('Failed to cancel session.');
        }
    };

    const SessionCard = ({ s, type }: { s: Session, type: string }) => {
        const isOnline = s.consultation_mode === 'Online';
        const d = new Date(s.scheduled_at);

        return (
            <div className="card p-0 overflow-hidden border-border/50 hover:border-primary/50 transition-colors">
                <div className={`p-1 ${type === 'upcoming' ? 'bg-primary' : type === 'cancelled' ? 'bg-error' : 'bg-success'}`}></div>
                <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 opacity-100">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${type === 'upcoming' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface border-border text-text-muted'}`}>
                            <div className="text-center">
                                <div className="text-2xl font-syne font-bold leading-none">{format(d, 'dd')}</div>
                                <div className="text-xs uppercase tracking-widest mt-1 opacity-80">{format(d, 'MMM')}</div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-white">Dr. {s.physio_profiles?.last_name}</h3>
                                {type === 'upcoming' && <span className="pill text-[10px] py-0.5 px-2 bg-primary/20 text-primary border-none">Upcoming</span>}
                                {type === 'cancelled' && <span className="pill text-[10px] py-0.5 px-2 bg-error/20 text-error border-none">Cancelled</span>}
                            </div>
                            <div className="text-sm font-medium text-text-secondary mb-2 flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1"><Clock size={14} /> {format(d, 'h:mm a')}</span>
                                <span className="text-border">•</span>
                                <span className="flex items-center gap-1">{isOnline ? <Video size={14} /> : <MapPin size={14} />} {s.consultation_mode}</span>
                            </div>
                            <div className="text-xs text-text-muted">{s.physio_profiles?.sport_specializations?.[0] || 'Sports'} Recovery Session</div>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col md:items-end gap-3">
                        <div className="text-lg font-bold font-syne text-white">₹{s.amount}</div>
                        <div className="flex gap-3 w-full md:w-auto">
                            {type === 'upcoming' && (
                                <button
                                    onClick={() => handleCancel(s.id, s.scheduled_at)}
                                    disabled={cancellingId === s.id}
                                    className="btn-outline text-xs px-4 py-2 hover:bg-error/10 hover:text-error hover:border-error/30"
                                >
                                    {cancellingId === s.id ? <Loader2 size={14} className="animate-spin" /> : 'Cancel Session'}
                                </button>
                            )}
                            {type === 'completed' && (
                                <Link href="/athlete/recovery" className="btn-outline text-xs px-4 py-2 hover:bg-success/10 hover:text-success hover:border-success/30 flex items-center justify-center gap-2">
                                    <FileText size={14} /> View Report
                                </Link>
                            )}
                            <Link href={`/athlete/physio/${s.physio_profiles?.id}`} className="btn-primary text-xs w-full md:w-auto justify-center">
                                View Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-border/50 mb-8 pb-px">
                {(['upcoming', 'completed', 'cancelled'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`capitalize px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === t ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-white hover:border-text-secondary'}`}
                    >
                        {t} ({t === 'upcoming' ? upcoming.length : t === 'completed' ? completed.length : cancelled.length})
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4">
                {activeTab === 'upcoming' && (upcoming.length === 0 ? <p className="text-text-muted py-8 text-center bg-surface rounded-2xl border border-dashed border-border">No upcoming sessions. <Link href="/athlete/search" className="text-primary hover:underline">Find a physio</Link></p> : upcoming.map(s => <SessionCard key={s.id} s={s} type="upcoming" />))}
                {activeTab === 'completed' && (completed.length === 0 ? <p className="text-text-muted py-8 text-center bg-surface rounded-2xl border border-border">No completed sessions.</p> : completed.map(s => <SessionCard key={s.id} s={s} type="completed" />))}
                {activeTab === 'cancelled' && (cancelled.length === 0 ? <p className="text-text-muted py-8 text-center bg-surface rounded-2xl border border-border">No cancelled sessions.</p> : cancelled.map(s => <SessionCard key={s.id} s={s} type="cancelled" />))}
            </div>
        </div>
    );
}
