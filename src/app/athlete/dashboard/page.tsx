import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Activity, MapPin, CheckCircle2, ChevronRight, PlayCircle, Target, TrendingUp } from 'lucide-react';

import StatCard from '@/components/dashboard/StatCard';
import PainTrendChart from '@/components/dashboard/charts/PainTrendChart';
import MilestoneTracker from '@/components/dashboard/MilestoneTracker';
import ProfileSidebar from '@/components/dashboard/ProfileSidebar';

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
        .limit(10);
        
    // 5. Fetch Active Cases
    const { data: activeCases } = await supabase
        .from('case_files')
        .select('id, injury_type, body_part, target_date, status, physio_profiles(last_name)')
        .eq('athlete_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    // Mock Pain Trend data matching Recharts format
    const painTrend = [...(recoveries || [])].reverse().map(r => ({
        date: format(new Date(r.logged_at), 'MMM dd'),
        pain: r.pain_level
    }));

    // Mock Milestones
    const mockMilestones = [
        { id: '1', title: 'Full Knee Extension', status: 'completed' as const, target_date: new Date().toISOString() },
        { id: '2', title: 'Jogging 5 mins', status: 'pending' as const, target_date: new Date(Date.now() + 86400000 * 5).toISOString() },
        { id: '3', title: 'Return to Sport Training', status: 'pending' as const, target_date: new Date(Date.now() + 86400000 * 14).toISOString() }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* PROFILE SIDEBAR */}
                <div className="lg:col-span-1">
                    <ProfileSidebar 
                        id={profile.id}
                        firstName={profile.first_name}
                        lastName={profile.last_name}
                        role="athlete"
                        specialization={profile.primary_sport}
                        location={profile.location_locality || 'India'}
                        avatarInitials={`${profile.first_name?.[0]}${profile.last_name?.[0]}`}
                        stats={[
                            { label: 'Sessions', value: pastSessions.length + upcomingSessions.length },
                            { label: 'Records', value: recoveries?.length || 0 }
                        ]}
                    />
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="lg:col-span-3 space-y-8">
                    
                    {/* TOP STATS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard 
                            title="Active Cases" 
                            value={activeCases?.length || 0} 
                            icon={<Activity size={20} />}
                            trend={{ value: '1', label: 'new', isPositive: false }}
                        />
                        <StatCard 
                            title="Upcoming Sessions" 
                            value={upcomingSessions.length} 
                            icon={<Calendar size={20} />}
                        />
                        <StatCard 
                            title="Recovery Score" 
                            value="82/100" 
                            icon={<Target size={20} />}
                            gradient
                            trend={{ value: '5%', label: 'improvement', isPositive: true }}
                        />
                    </div>

                    {/* CHARTS ROW */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="card p-6 border-transparent bg-[#11141A]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <TrendingUp size={18} className="text-warning" /> Pain Progression
                                </h3>
                                <Link href="/athlete/recovery" className="text-sm text-primary hover:underline">Log Pain</Link>
                            </div>
                            <PainTrendChart 
                                data={painTrend} 
                                xKey="date" 
                                yKey="pain" 
                            />
                        </div>

                        <div className="card p-6 border-transparent bg-[#11141A]">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                                <Target size={18} className="text-success" /> Goal Tracker
                            </h3>
                            <MilestoneTracker milestones={mockMilestones} />
                        </div>
                    </div>

                    {/* TWO COLUMN LOWER SECTION */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Upcoming Session */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Calendar size={20} className="text-primary" /> Next Session
                                </h3>
                                <Link href="/athlete/sessions" className="text-sm text-primary hover:underline">View All</Link>
                            </div>
                            
                            {upcomingSessions.length === 0 ? (
                                <div className="card p-8 border-dashed border-border bg-transparent text-center flex flex-col items-center justify-center">
                                    <p className="font-bold text-white mb-2">No upcoming visits</p>
                                    <Link href="/athlete/search" className="btn-outline text-sm">Find Physio</Link>
                                </div>
                            ) : (
                                <div className="card p-0 overflow-hidden group border-primary/20 hover:border-primary/50 transition-colors">
                                    <div className="p-1 bg-primary"></div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                                                <span className="font-syne font-bold text-primary text-xl">
                                                    {format(new Date(upcomingSessions[0].scheduled_at), 'dd')}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                                                    {format(new Date(upcomingSessions[0].scheduled_at), 'MMM yyyy, h:mm a')}
                                                </div>
                                                <h3 className="font-bold text-white">Dr. {upcomingSessions[0].physio_profiles.last_name}</h3>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {upcomingSessions[0].consultation_mode === 'Online' && (
                                                <button className="w-full btn-primary bg-success hover:bg-success/80 text-white border-none justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] gap-2">
                                                    <PlayCircle size={18} /> Join Video Call
                                                </button>
                                            )}
                                            <Link href={`/athlete/physio/${upcomingSessions[0].physio_id}`} className="w-full btn-outline justify-center">View Profile</Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Top Matches */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Activity size={20} className="text-primary" /> Top Matches
                                </h3>
                                <Link href="/athlete/search" className="text-sm text-primary hover:underline">Search</Link>
                            </div>

                            <div className="space-y-4">
                                {feed?.map(p => (
                                    <Link key={p.id} href={`/athlete/physio/${p.id}`} className="card p-4 flex items-center gap-4 hover:border-primary/50 transition-colors group">
                                        <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                                            <span className="font-syne font-bold text-white text-xs group-hover:text-primary transition-colors">{p.first_name?.[0]}{p.last_name?.[0]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-white truncate flex items-center gap-1">
                                                Dr. {p.last_name}
                                                <CheckCircle2 size={12} className="text-primary" />
                                            </h4>
                                            <div className="text-xs text-text-muted mt-1 flex items-center gap-1">
                                                <MapPin size={10} /> {p.location_locality?.split(',')[0] || 'Remote'}
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-border group-hover:text-primary transition-colors shrink-0" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
