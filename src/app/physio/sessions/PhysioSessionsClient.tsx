'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, isToday } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { Calendar, CheckCircle2, Clock, Video, MapPin, Loader2, FileText, User } from 'lucide-react';
import { createNotification } from '@/lib/notifications';

type Session = {
    id: string;
    scheduled_at: string;
    status: 'upcoming' | 'completed' | 'cancelled' | 'no_show';
    consultation_mode: string;
    amount: number;
    athlete_id: string;
    athlete_profiles: {
        first_name: string;
        last_name: string;
        primary_sport: string;
    } | null;
};

export default function PhysioSessionsClient({ initialSessions }: { initialSessions: any[] }) {
    const [sessions, setSessions] = useState<Session[]>(initialSessions);
    const [actionId, setActionId] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // Grouping
    const todaySessions = sessions.filter(s => s.status === 'upcoming' && isToday(new Date(s.scheduled_at)));
    const upcomingSessions = sessions.filter(s => s.status === 'upcoming' && new Date(s.scheduled_at) > new Date() && !isToday(new Date(s.scheduled_at)));
    const completedSessions = sessions.filter(s => s.status === 'completed');

    const handleMarkComplete = async (id: string, athleteId: string | undefined) => {
        setActionId(id);
        const { error } = await supabase.from('sessions').update({ status: 'completed' }).eq('id', id);
        setActionId(null);

        if (!error) {
            setSessions(sessions.map(s => s.id === id ? { ...s, status: 'completed' } : s));

            // Notify the athlete
            if (athleteId) {
                const { data: physioProfile } = await supabase
                    .from('physio_profiles')
                    .select('first_name, last_name')
                    .eq('id', (await supabase.auth.getUser()).data.user?.id)
                    .single();

                await createNotification(supabase, {
                    userId: athleteId,
                    type: 'session_completed',
                    title: 'Session Completed',
                    message: `Dr. ${physioProfile?.last_name || 'Your physio'} marked your session as complete.`,
                    link: '/athlete/sessions',
                });
            }

            if (confirm('Session marked complete. Do you want to add session notes now?')) {
                router.push(`/physio/patients/${athleteId}`);
            }
        } else {
            alert('Failed to update session.');
        }
    };

    const SessionCard = ({ s, type }: { s: Session, type: 'today' | 'upcoming' | 'completed' }) => {
        const isOnline = s.consultation_mode === 'Online';
        const d = new Date(s.scheduled_at);

        return (
            <div className={`card p-0 overflow-hidden border-border/50 hover:border-primary/50 transition-colors ${type === 'today' ? 'border-primary/30 shadow-[0_0_20px_rgba(37,99,235,0.1)]' : ''}`}>
                <div className={`p-1 ${type === 'today' ? 'bg-primary' : type === 'upcoming' ? 'bg-border' : 'bg-success'}`}></div>
                <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 border ${type === 'today' ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-surface border-border text-text-muted'}`}>
                            <User size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-bold text-white">{s.athlete_profiles?.first_name} {s.athlete_profiles?.last_name}</h3>
                                {type === 'today' && <span className="pill text-[10px] py-0.5 px-2 bg-primary/20 text-primary border-none">Today</span>}
                            </div>
                            <div className="text-sm font-medium text-text-secondary mb-2 flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1"><Clock size={14} /> {format(d, 'h:mm a')}</span>
                                {type === 'upcoming' && <span className="text-border">• {format(d, 'MMM dd')}</span>}
                                <span className="text-border">•</span>
                                <span className="flex items-center gap-1">{isOnline ? <Video size={14} /> : <MapPin size={14} />} {s.consultation_mode}</span>
                            </div>
                            <div className="text-xs text-text-muted">{s.athlete_profiles?.primary_sport || 'Athlete'}</div>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3">
                        <div className="flex gap-3 w-full md:w-auto">
                            {(type === 'today' || type === 'upcoming') && (
                                <button
                                    onClick={() => handleMarkComplete(s.id, s.athlete_id)}
                                    disabled={actionId === s.id}
                                    className="btn-primary gap-2 text-xs w-full md:w-auto justify-center"
                                >
                                    {actionId === s.id ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle2 size={16}/> Mark Complete</>}
                                </button>
                            )}
                            {type === 'completed' && (
                                <button
                                    onClick={() => router.push(`/physio/patients/${s.athlete_id}`)}
                                    className="btn-outline gap-2 text-xs w-full md:w-auto justify-center hover:bg-success/10 hover:text-success hover:border-success/30"
                                >
                                    <FileText size={16}/> Add Notes
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        );
    };

    return (
        <div className="space-y-12">
            
            {/* Today's Sessions */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-xl font-bold text-white">Today's Sessions</h2>
                    <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">{todaySessions.length}</span>
                </div>
                <div className="space-y-4">
                    {todaySessions.length === 0 ? (
                        <div className="card p-8 text-center border-dashed border-border bg-transparent">
                            <Calendar size={24} className="mx-auto text-text-muted mb-2" />
                            <p className="text-text-secondary">No sessions scheduled for today.</p>
                        </div>
                    ) : (
                        todaySessions.map(s => <SessionCard key={s.id} s={s} type="today" />)
                    )}
                </div>
            </section>

            {/* Upcoming Next 7 Days */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-lg font-bold text-white">Upcoming</h2>
                </div>
                <div className="space-y-4">
                    {upcomingSessions.length === 0 ? (
                        <p className="text-sm text-text-muted">No future sessions currently booked.</p>
                    ) : (
                        upcomingSessions.map(s => <SessionCard key={s.id} s={s} type="upcoming" />)
                    )}
                </div>
            </section>

            {/* Past/Completed */}
            <section>
                <div className="flex items-center gap-2 mb-6 border-b border-border/50 pb-2">
                    <h2 className="text-lg font-bold text-white">Completed Sessions</h2>
                </div>
                <div className="space-y-4">
                    {completedSessions.length === 0 ? (
                        <p className="text-sm text-text-muted">No completed sessions yet.</p>
                    ) : (
                        completedSessions.map(s => <SessionCard key={s.id} s={s} type="completed" />)
                    )}
                </div>
            </section>

        </div>
    );
}
