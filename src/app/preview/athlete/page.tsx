import AthleteLayout from '@/app/athlete/layout';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Activity, MapPin, CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react';

export default function PreviewAthlete() {
    const profile = { first_name: 'Alex', primary_sport: 'Basketball' };

    const upcomingSessions = [
        {
            id: 'mock-1',
            scheduled_at: new Date(new Date().getTime() + 86400000).toISOString(),
            consultation_mode: 'Online',
            physio_profiles: { last_name: 'Carder', sport_specializations: ['Basketball'] }
        }
    ];

    const recoveries = [
        { id: 'rec-1', logged_at: new Date().toISOString(), notes: 'Left shoulder strain post game', pain_level: 6 },
        { id: 'rec-2', logged_at: new Date(new Date().getTime() - 86400000 * 3).toISOString(), notes: 'Routine icing', pain_level: 3 },
    ];

    const feed = [
        { id: 'p1', first_name: 'Jakob', last_name: 'Carder', sport_specializations: ['Basketball'], location_locality: 'Delhi NCR', consultation_rate: 1200 },
        { id: 'p2', first_name: 'Charlie', last_name: 'Madsen', sport_specializations: ['Basketball'], location_locality: 'Gurugram', consultation_rate: 1500 }
    ];

    return (
        <AthleteLayout>
            <div className="max-w-7xl mx-auto pb-24 space-y-8">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                            Welcome back, {profile.first_name}
                        </h1>
                        <p className="text-text-secondary">
                            Your primary sport: <span className="text-primary font-medium">{profile.primary_sport}</span>
                        </p>
                    </div>
                    <Link href="/athlete/search" className="btn-primary text-sm shadow-glow">
                        Find Physio
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT/MAIN COLUMN */}
                    <div className="lg:col-span-2 space-y-8">

                        <section>
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Calendar size={18} className="text-primary" /> Upcoming Sessions
                            </h2>
                            <div className="space-y-4">
                                {upcomingSessions.map(session => (
                                    <div key={session.id} className="card p-0 overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors">
                                        <div className="p-1 bg-primary"></div>
                                        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                                                    <span className="font-syne font-bold text-primary text-xl">
                                                        {format(new Date(session.scheduled_at), 'dd')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                                                        {format(new Date(session.scheduled_at), 'MMM yyyy, h:mm a')}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-white mb-1">
                                                        Dr. {session.physio_profiles.last_name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                        <span className="pill py-0.5 px-2 text-[10px] bg-surface">{session.consultation_mode}</span>
                                                        <span>{session.physio_profiles.sport_specializations[0]} Recovery</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full md:w-auto flex gap-3">
                                                <button className="flex-1 md:flex-none btn-primary gap-2 bg-success hover:bg-success/80 text-white border-none shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                                    <PlayCircle size={18} /> Join Call
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Activity size={18} className="text-warning" /> Recovery Log
                                </h2>
                            </div>
                            <div className="card p-6 bg-gradient-to-br from-surface to-background pb-0 overflow-hidden">
                                <div className="space-y-6 pb-6 border-l-2 border-border ml-2 pl-6">
                                    {recoveries.map(rec => (
                                        <div key={rec.id} className="relative">
                                            <div className="absolute -left-[35px] top-1 w-4 h-4 rounded-full bg-warning ring-4 ring-background" />
                                            <div className="text-xs text-text-muted font-bold tracking-wider mb-1">
                                                {new Date(rec.logged_at).toLocaleDateString()}
                                            </div>
                                            <h4 className="text-white font-medium mb-1">{rec.notes}</h4>
                                            <p className="text-sm text-text-secondary">Pain Level: {rec.pain_level}/10</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-1 space-y-8">

                        <section>
                            <h2 className="text-lg font-bold text-white mb-4">Top Matches</h2>
                            <div className="space-y-4">
                                {feed.map(p => (
                                    <div key={p.id} className="card p-4 flex gap-4 hover:border-primary/50 transition-colors group">
                                        <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                                            <span className="font-syne font-bold text-white group-hover:text-primary transition-colors">{p.first_name?.[0]}{p.last_name?.[0]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-white truncate flex items-center gap-1">
                                                Dr. {p.last_name}
                                                <CheckCircle2 size={12} className="text-primary" />
                                            </h4>
                                            <p className="text-xs text-text-secondary truncate mt-0.5">{p.sport_specializations[0]}</p>
                                            <div className="text-xs text-text-muted mt-2 flex items-center gap-1">
                                                <MapPin size={10} /> {p.location_locality?.split(',')[0]}
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col justify-between shrink-0">
                                            <span className="text-xs font-bold text-primary">₹{p.consultation_rate}</span>
                                            <ChevronRight size={16} className="text-border group-hover:text-primary transition-colors" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </AthleteLayout>
    );
}
