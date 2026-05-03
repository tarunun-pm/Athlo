'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    CheckCircle2, 
    Calendar, 
    Users, 
    Activity, 
    FileText, 
    TrendingUp, 
    Star, 
    Clock
} from 'lucide-react';
import StatCard from './StatCard';
import DonutChart from './charts/DonutChart';
import TrendLineChart from './charts/TrendLineChart';
import ProfileSidebar from './ProfileSidebar';
import AvatarStrip from './AvatarStrip';
import RatingList from './RatingList';
import ScheduleTimeline from './ScheduleTimeline';
import EarningsCard from './EarningsCard';
import EmergencyToggle from '../emergency/EmergencyToggle';

export default function ApprovedDashboard({ profile, activeCases = [] }: { profile: any, activeCases?: any[] }) {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const hasSeen = localStorage.getItem(`seen_approval_${profile.id}`);
        if (!hasSeen) {
            setShowBanner(true);
            localStorage.setItem(`seen_approval_${profile.id}`, 'true');
        }
    }, [profile.id]);

    // Mock/Calculated Data for Preview
    // In a real scenario, these would come from the RCP functions
    const stats = {
        activeCases: activeCases.length,
        newBookings: 8,
        completedSessions: 124,
        avgRating: 4.9,
        totalEarnings: 82400,
        monthlyEarnings: 12500
    };

    const sessionTrend = [
        { month: 'Jan', count: 18 },
        { month: 'Feb', count: 25 },
        { month: 'Mar', count: 21 },
        { month: 'Apr', count: 32 },
        { month: 'May', count: 28 },
        { month: 'Jun', count: 40 }
    ];

    const sessionDistribution = [
        { name: 'Online', value: 75, color: '#2563EB' },
        { name: 'In-Person', value: 49, color: '#10B981' }
    ];

    const mockSchedule = [
        { id: '1', time: new Date(new Date().setHours(10, 0)), title: 'A. Sharma (ACL)', type: 'Online', duration: 45 },
        { id: '2', time: new Date(new Date().setHours(11, 30)), title: 'R. Verma (MT)', type: 'In-Person', duration: 60 },
        { id: '3', time: new Date(new Date().setHours(14, 0)), title: 'K. Singh (Shoulder)', type: 'Online', duration: 30 }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">

            {/* Banner */}
            {showBanner && (
                <div className="bg-success/10 border border-success/30 p-4 rounded-xl flex items-start gap-4 shadow-[0_0_20px_rgba(16,185,129,0.1)] mb-6">
                    <CheckCircle2 className="text-success shrink-0 mt-0.5" size={24} />
                    <div className="flex-1">
                        <h3 className="font-bold text-success mb-1">You're live on Athlo!</h3>
                        <p className="text-sm text-success/80">Your profile is approved and matching with athletes near you.</p>
                    </div>
                    <button onClick={() => setShowBanner(false)} className="text-success/50 hover:text-success pb-2 px-2">&times;</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* PROFILE SIDEBAR */}
                <div className="lg:col-span-1">
                    <ProfileSidebar 
                        id={profile.id}
                        firstName={profile.first_name}
                        lastName={profile.last_name}
                        role="physio"
                        specialization={profile.sport_specializations?.[0] || 'Sports Specialist'}
                        location={profile.location_locality || 'Delhi NCR'}
                        rating={stats.avgRating}
                        avatarInitials={`${profile.first_name?.[0]}${profile.last_name?.[0]}`}
                        isVerified={true}
                        stats={[
                            { label: 'Cases', value: stats.activeCases },
                            { label: 'Followers', value: '2.1k' }
                        ]}
                    />
                    <div className="mt-6">
                        <EmergencyToggle initialStatus={profile.emergency_opt_in ?? true} physioId={profile.id} />
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="lg:col-span-3 space-y-8">
                    
                    {/* TOP STATS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <StatCard 
                            title="Active Cases" 
                            value={stats.activeCases} 
                            icon={<Activity size={20} />}
                            trend={{ value: '12%', label: 'vs last month', isPositive: true }}
                        />
                        <StatCard 
                            title="New Bookings" 
                            value={stats.newBookings} 
                            icon={<Calendar size={20} />}
                            trend={{ value: '8%', label: 'growth', isPositive: true }}
                        />
                        <StatCard 
                            title="Total Sessions" 
                            value={stats.completedSessions} 
                            icon={<Users size={20} />}
                        />
                        <StatCard 
                            title="Avg Rating" 
                            value={stats.avgRating} 
                            icon={<Star size={20} />}
                            gradient
                        />
                    </div>

                    {/* CHARTS ROW */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        <div className="xl:col-span-2 card p-6 border-transparent bg-[#11141A]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <TrendingUp size={18} className="text-primary" /> Session Volume
                                </h3>
                                <div className="flex bg-surface p-1 rounded-lg">
                                    <button className="px-3 py-1 text-xs font-bold text-white bg-primary rounded-md shadow-sm">Monthly</button>
                                    <button className="px-3 py-1 text-xs font-bold text-text-muted hover:text-white transition-colors">Yearly</button>
                                </div>
                            </div>
                            <TrendLineChart 
                                data={sessionTrend} 
                                xKey="month" 
                                yKey="count" 
                                lineColor="#2563EB" 
                            />
                        </div>

                        <div className="card p-6 border-transparent bg-[#11141A]">
                            <h3 className="font-bold text-white mb-8">Session Spread</h3>
                            <DonutChart 
                                data={sessionDistribution} 
                                centerLabel={{ value: stats.completedSessions, label: 'Total' }}
                            />
                        </div>
                    </div>

                    {/* SCHEDULE & EARNINGS ROW */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Clock size={20} className="text-primary" /> Today's Schedule
                            </h3>
                            <div className="card p-4 border-transparent bg-[#11141A]">
                                <ScheduleTimeline events={mockSchedule} />
                            </div>
                            
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Users size={20} className="text-primary" /> Recent Patients
                            </h3>
                            <div className="card p-4 border-transparent bg-[#11141A]">
                                <AvatarStrip 
                                    people={activeCases.map((c: any) => ({
                                        id: c.id,
                                        name: `${c.athlete_profiles.first_name} ${c.athlete_profiles.last_name}`,
                                        initials: `${c.athlete_profiles.first_name?.[0]}${c.athlete_profiles.last_name?.[0]}`
                                    }))} 
                                    hrefPrefix="/physio/cases"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp size={20} className="text-success" /> Practice Growth
                            </h3>
                            <EarningsCard 
                                total={stats.totalEarnings} 
                                monthly={stats.monthlyEarnings} 
                                count={stats.completedSessions} 
                            />

                            <div className="card p-6 border-transparent bg-[#11141A]">
                                <h3 className="font-bold text-white mb-6">Patient Feedback</h3>
                                <RatingList items={[
                                    { id: '1', name: 'Arjun S.', avatar: 'AS', rating: 5.0, comment: 'Exceptional diagnosis of my meniscus tear. Highly recommended.' },
                                    { id: '2', name: 'Priya M.', avatar: 'PM', rating: 4.8, comment: 'Great recovery plan, feeling stronger already.' }
                                ]} />
                            </div>
                        </div>
                    </div>

                    {/* Availability Blocker */}
                    {!profile.is_availability_set && (
                        <div className="card p-8 border-primary/50 bg-primary/10 relative overflow-hidden flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-4">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">You remain hidden from search.</h3>
                            <p className="text-text-secondary mb-8 max-w-sm">Athletes cannot book you until you define your consultation rates and weekly schedule.</p>
                            <Link href="/physio/availability" className="btn-primary w-full max-w-[200px] shadow-glow">Set Availability →</Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
