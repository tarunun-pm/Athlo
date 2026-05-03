import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RecoveryListClient from './RecoveryListClient';

export const revalidate = 0;

export default async function AthleteRecoveryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/signin');

    // Fetch case files WITHOUT embedded joins (FK constraints may not exist)
    const { data: cases, error: athleteError } = await supabase
        .from('case_files')
        .select('id, injury_type, body_part, severity, status, created_at, physio_id')
        .eq('athlete_id', user.id)
        .order('created_at', { ascending: false });

    if (athleteError) {
        console.error('SUPABASE ATHLETE RECOVERY ERROR:', athleteError);
    }

    // Enrich each case with the physio's name via a separate query
    const enrichedCases = await Promise.all(
        (cases || []).map(async (c: any) => {
            if (c.physio_id) {
                const { data: physio } = await supabase
                    .from('physio_profiles')
                    .select('id, first_name, last_name')
                    .eq('id', c.physio_id)
                    .single();
                return { ...c, physio_profiles: physio };
            }
            return { ...c, physio_profiles: null };
        })
    );

    return (
        <div className="max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Recovery</h1>
                <p className="text-text-secondary">Track your clinical cases, milestones, and progress.</p>
            </div>
            
            <RecoveryListClient cases={enrichedCases} />
        </div>
    );
}
