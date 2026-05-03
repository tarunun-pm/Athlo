import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Search, MapPin, Star, Filter, Calendar, CheckCircle2 } from 'lucide-react';
import SearchFilters from '@/components/athlete/SearchFilters';

export const revalidate = 0;

export default async function AthleteSearchPage({
    searchParams,
}: {
    searchParams: { sport?: string; injury?: string; q?: string }
}) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    
    let athleteSport = 'General';
    if (user) {
        const { data: athlete } = await supabase.from('athlete_profiles').select('primary_sport').eq('id', user.id).single();
        if (athlete?.primary_sport) athleteSport = athlete.primary_sport;
    }

    // Call the matching algorithm RPC
    let { data: physios, error } = await supabase.rpc('match_physios', {
        athlete_sport: searchParams.sport || athleteSport,
        athlete_lat: 28.6139, // Defaulting to somewhere central in India (Delhi) for demo purposes
        athlete_lng: 77.2090
    });

    // Client-side quick filter for 'injury' and text 'q' if provided, since RPC handles the heavy weighting
    if (physios && searchParams.injury) {
        physios = physios.filter((p: any) => p.injury_specializations?.includes(searchParams.injury));
    }
    if (physios && searchParams.q) {
        const queryLower = searchParams.q.toLowerCase();
        physios = physios.filter((p: any) => 
            p.first_name?.toLowerCase().includes(queryLower) || 
            p.last_name?.toLowerCase().includes(queryLower)
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-24 h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Find your specialist</h1>
                <p className="text-text-secondary">Search verified sports physiotherapists in your area.</p>
            </div>

            <SearchFilters />

            {error && (
                <div className="bg-error/10 text-error p-4 rounded-[14px] border border-error/50 mb-8">
                    Error loading physios: {error.message}
                </div>
            )}

            {!physios || physios.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 card border-dashed border-border bg-transparent">
                    <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted mb-4">
                        <Search size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No experts found</h3>
                    <p className="text-text-secondary max-w-sm">
                        Try adjusting your filters or search terms to find available physiotherapists.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {physios.map((p: any) => (
                        <Link key={p.id} href={`/athlete/physio/${p.id}`} className="card p-6 flex flex-col hover:border-primary/50 hover:shadow-[0_0_20px_rgba(0,102,255,0.15)] transition-all group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/50 group-hover:bg-primary group-hover:text-white transition-colors">
                                    <span className="font-syne font-bold text-xl">{p.first_name?.[0]}{p.last_name?.[0]}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-1.5">
                                        Dr. {p.first_name} {p.last_name}
                                        <CheckCircle2 size={16} className="text-primary" />
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-text-muted">
                                        <span className="flex items-center gap-1">
                                            <Star size={12} className="text-primary fill-primary" /> {Math.round(p.match_score * 100)}% Match
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin size={12} /> {p.location_locality?.split(',')[0]}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1">
                                <div>
                                    <p className="text-xs text-text-muted font-bold tracking-wider uppercase mb-2">Expertise</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className="pill text-[10px] py-0.5 px-2 bg-[#121417] text-text-secondary">{p.sport_specializations?.[0]}</span>
                                        <span className="pill text-[10px] py-0.5 px-2 bg-[#121417] text-text-secondary">{p.injury_specializations?.[0]}</span>
                                        {(p.sport_specializations?.length > 1 || p.injury_specializations?.length > 1) && (
                                            <span className="pill text-[10px] py-0.5 px-2 bg-[#121417] text-text-secondary">+{Math.max(p.sport_specializations?.length - 1, 0) + Math.max(p.injury_specializations?.length - 1, 0)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                                <div>
                                    <span className="text-white font-bold tracking-tight">₹{p.consultation_rate}</span>
                                    <span className="text-xs text-text-muted ml-1">/ session</span>
                                </div>
                                <span className="text-primary text-sm font-medium group-hover:underline">View Profile →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
