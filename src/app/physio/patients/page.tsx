import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PatientsListClient from './PatientsListClient';

export const revalidate = 0;

export default async function PhysioPatientsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/signin');
    }

    // Get all sessions for this physio to find their unique athletes
    const { data: sessions } = await supabase
        .from('sessions')
        .select(`
            athlete_id,
            athlete_profiles:athlete_id (id, first_name, last_name, primary_sport)
        `)
        .eq('physio_id', user.id);

    // Filter to unique athletes
    const athletesMap = new Map();
    sessions?.forEach(s => {
        if (s.athlete_profiles && !athletesMap.has(s.athlete_id)) {
            athletesMap.set(s.athlete_id, s.athlete_profiles);
        }
    });

    const uniqueAthletes = Array.from(athletesMap.values());

    return (
        <div className="max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Patients</h1>
                <p className="text-text-secondary">View and manage clinical case files for your athletes.</p>
            </div>
            
            <PatientsListClient athletes={uniqueAthletes} />
        </div>
    );
}
