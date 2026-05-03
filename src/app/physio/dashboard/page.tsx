import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PendingDashboard from '@/components/dashboard/PendingDashboard';
import ApprovedDashboard from '@/components/dashboard/ApprovedDashboard';
import RejectedDashboard from '@/components/dashboard/RejectedDashboard';

export const revalidate = 0; // Ensure fresh data on every load

export default async function PhysioDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/signin');
    }

    // Fetch complete profile alongside demand signal
    const { data: profile } = await supabase
        .from('physio_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) {
        redirect('/onboarding/physio/step-1');
    }

    // Calculate demand signal
    let demandCounts: { sport: string, count: number }[] = [];
    if (profile.sport_specializations && profile.sport_specializations.length > 0 && profile.location_locality) {
        // Direct raw query wrapper logic via RPC or complex filter
        // For demo, we fetch a count of athletes with matching sports in matching locality
        // Next.js note: complex aggregations over Supabase usually require RPC or raw SQL.
        // For now, doing a broad count match.
        const { data: athletes } = await supabase
            .from('athlete_profiles')
            .select('primary_sport')
            .ilike('location_locality', `%${profile.location_locality.split(' ')[0]}%`)
            .in('primary_sport', profile.sport_specializations);

        if (athletes) {
            const counts: Record<string, number> = {};
            athletes.forEach(a => {
                counts[a.primary_sport] = (counts[a.primary_sport] || 0) + 1;
            });
            demandCounts = Object.entries(counts).map(([sport, count]) => ({ sport, count }));
        }
    }

    // Fetch active cases for the CRM widget
    const { data: activeCases } = await supabase
        .from('case_files')
        .select('id, injury_type, body_part, athlete_profiles(first_name, last_name)')
        .eq('physio_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);

    const { verification_status } = profile;

    return (
        <div className="max-w-7xl mx-auto h-full space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        Welcome back, Dr. {profile.last_name}
                    </h1>
                    <p className="text-text-secondary text-sm">
                        Overview of your practice and schedule
                    </p>
                </div>
            </div>

            {verification_status === 'pending' && <PendingDashboard profile={profile} demandCounts={demandCounts} />}
            {verification_status === 'rejected' && <RejectedDashboard profile={profile} demandCounts={demandCounts} />}
            {verification_status === 'approved' && <ApprovedDashboard profile={profile} activeCases={activeCases || []} />}

        </div>
    );
}
