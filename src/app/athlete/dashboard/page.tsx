import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Activity, MapPin, CheckCircle2, ChevronRight, PlayCircle } from 'lucide-react';

export const revalidate = 0;

export default async function AthleteDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/signin');
    }

    // 1. Fetch Profile
    const { data: profile } = await supabase
        .from('athlete_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        redirect('/onboarding/athlete');
    }

    // 2. Fetch Sessions
    const { data: sessions } = await supabase
        .from('sessions')
        .select('*, physio_profiles(first_name, last_name, sport_specializations)')
        .eq('athlete_id', user.id)
        .order('scheduled_at', { ascending: true });

    const upcomingSessions = sessions?.filter(s => new Date(s.scheduled_at) > new Date() && s.status !== 'cancelled') || [];
    const pastSessions = sessions?.filter(s => new Date(s.scheduled_at) <= new Date() || s.status === 'cancelled') || [];

    // 3. Fetch Feed (Nearby or matching sport)
    const { data: feed } = await supabase
        .from('physio_profiles')
        .select('id, first_name, last_name, sport_specializations, location_locality, consultation_rate')
        .eq('verification_status', 'approved')
        .eq('is_availability_set', true)
        .limit(3);

    // 4. Fetch Recovery Logs
    const { data: recoveries } = await supabase
        .from('recovery_records')
        .select('*')
        .eq('athlete_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(5);
        
    // 5. Fetch Active Cases
    const { data: activeCases } = await supabase
        .from('case_files')
        .select('id, injury_type, body_part, physio_profiles(last_name)')
        .eq('athlete_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(2);

    return (
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

                    {/* Upcoming Appointment Widget (MedEx Style) */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Calendar size={18} className="text-primary" /> Upcoming Sessions
                        </h2>

                        {upcomingSessions.length === 0 ? (
                            <div className="card p-8 border-dashed border-border bg-transparent text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted mb-4">
                                    <Calendar size={20} />
                                </div>
                                <p className="font-bold text-white mb-1">No sessions booked</p>
                                <p className="text-sm text-text-secondary mb-4">You have no upcoming recovery sessions.</p>
                                <Link href="/athlete/search" className="btn-outline text-sm">Browse Physios</Link>
                            </div>
                        ) : (
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
                                                {session.consultation_mode === 'Online' && (
                                                    <button className="flex-1 md:flex-none btn-primary gap-2 bg-success hover:bg-success/80 text-white border-none shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                                        <PlayCircle size={18} /> Join Call
                                                    </button>
                                                )}
                                                <Link href={`/athlete/physio/${session.physio_id}`} className="flex-1 md:flex-none btn-outline">
                                                    View details
                                                </Link>
                                            </div>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Active Cases / Recovery Plans */}
                    {activeCases && activeCases.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Activity size={18} className="text-primary" /> Active Recovery Plans
                                </h2>
                                <Link href="/athlete/recovery" className="text-sm font-medium text-primary hover:underline">View All</Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeCases.map((c: any) => (
                                    <Link key={c.id} href={`/athlete/recovery/${c.id}`} className="card p-5 border-border hover:border-primary/50 transition-colors group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="font-bold text-white mb-1 group-hover:text-primary transition-colors">{c.injury_type}</h3>
                                                <p className="text-xs text-text-secondary">{c.body_part}</p>
                                            </div>
                                            <span className="pill text-[10px] py-0.5 px-2 bg-primary/20 text-primary border-primary/30">Active</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-text-muted font-medium">Dr. {c.physio_profiles.last_name}</span>
                                            <span className="text-primary flex items-center gap-1 group-hover:underline">Timeline <ChevronRight size={14}/></span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Recovery Log / Trackers */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity size={18} className="text-warning" /> Recovery Log
                            </h2>
                            <button className="text-sm font-medium text-primary hover:underline">Add Entry</button>
                        </div>

                        <div className="card p-6 bg-gradient-to-br from-surface to-background pb-0 overflow-hidden">
                            {recoveries && recoveries.length > 0 ? (
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
                            ) : (
                                <div className="pb-6 pt-4 text-center">
                                    <p className="text-text-muted text-sm mb-4">No pain or recovery entries logged yet.</p>
                                    <button className="text-sm font-medium text-warning hover:underline cursor-pointer border px-4 py-2 rounded-full border-border">Start Tracking</button>
                                </div>
                            )}
                        </div>
                    </section>

                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-1 space-y-8">

                    {/* Feed / Nearby Recommendations */}
                    <section>
                        <h2 className="text-lg font-bold text-white mb-4">Top Matches</h2>
                        <div className="space-y-4">
                            {feed?.map(p => (
                                <Link key={p.id} href={`/athlete/physio/${p.id}`} className="card p-4 flex gap-4 hover:border-primary/50 transition-colors group">
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
                                </Link>
                            ))}
                        </div>

                        <Link href="/athlete/search" className="block text-center text-sm font-medium text-primary mt-4 hover:underline">
                            View all 20+ physios
                        </Link>
                    </section>

                    {/* Past Sessions Summary */}
                    {pastSessions.length > 0 && (
                        <section className="card p-6 border-transparent bg-[#1C1F26]">
                            <h3 className="text-sm font-bold text-white mb-4 tracking-wider uppercase">History</h3>
                            <div className="space-y-4">
                                {pastSessions.slice(0, 3).map(s => (
                                    <div key={s.id} className="flex justify-between items-center text-sm">
                                        <span className="text-text-secondary">Dr. {s.physio_profiles.last_name}</span>
                                        <span className="text-white">{new Date(s.scheduled_at).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>

            </div>
        </div>
    );
}
