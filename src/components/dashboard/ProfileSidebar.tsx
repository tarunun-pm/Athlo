import Link from 'next/link';
import { Star, MapPin, CheckCircle2 } from 'lucide-react';

interface ProfileSidebarProps {
    id: string;
    firstName: string;
    lastName: string;
    role: 'physio' | 'athlete';
    specialization: string;
    location: string;
    rating?: number;
    avatarInitials: string;
    isVerified?: boolean;
    stats?: { label: string; value: string | number }[];
}

export default function ProfileSidebar({ id, firstName, lastName, role, specialization, location, rating, avatarInitials, isVerified, stats }: ProfileSidebarProps) {
    return (
        <div className="card p-6 border-transparent bg-gradient-to-b from-surface to-background shadow-[0_8px_30px_rgba(0,0,0,0.5)] h-full">
            <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary font-syne font-bold text-3xl border-2 border-primary/50 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                        {avatarInitials}
                    </div>
                    {isVerified && (
                        <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-background flex items-center justify-center">
                            <CheckCircle2 size={20} className="text-success fill-success/10" />
                        </div>
                    )}
                </div>

                <h3 className="text-xl font-bold text-white mb-1">
                    {role === 'physio' && 'Dr. '} {firstName} {lastName}
                </h3>
                <p className="text-sm font-medium text-primary mb-2 line-clamp-1">{specialization}</p>
                <div className="flex flex-wrap justify-center items-center gap-1 text-xs text-text-muted mb-6">
                    <MapPin size={12} /> {location}
                </div>

                {rating !== undefined && (
                    <div className="flex items-center gap-2 mb-6 bg-[#1C1F26] px-3 py-1.5 rounded-full border border-border">
                        <Star size={14} className="text-warning fill-warning" />
                        <span className="text-sm font-bold text-white">{Number(rating).toFixed(1)}</span>
                        <span className="text-xs text-text-muted">Avg Rating</span>
                    </div>
                )}
            </div>

            {stats && stats.length > 0 && (
                <div className="mt-2 mb-6 pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <div className="text-[10px] uppercase tracking-wider text-text-muted mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-3 pt-6 border-t border-border/50 mt-auto">
                <Link href={role === 'physio' ? "/physio/profile" : "/athlete/profile"} className="block w-full btn-primary text-center">
                    Edit Profile
                </Link>
                {role === 'physio' && (
                    <Link href="/physio/availability" className="block w-full btn-outline text-center">
                        Manage Schedule
                    </Link>
                )}
            </div>
        </div>
    );
}
