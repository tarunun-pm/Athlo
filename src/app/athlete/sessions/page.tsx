import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SessionsClient from './SessionsClient';

export const revalidate = 0;

export default async function AthleteSessionsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/signin');
    }

    const { data: sessions } = await supabase
        .from('sessions')
        .select(`
            id, scheduled_at, status, consultation_mode, amount,
            physio_profiles:physio_id (id, first_name, last_name, sport_specializations, location_locality)
        `)
        .eq('athlete_id', user.id)
        .order('scheduled_at', { ascending: true });

    return (
        <div className="max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Your Sessions</h1>
                <p className="text-text-secondary">Manage your upcoming and past recovery sessions.</p>
            </div>
            
            <SessionsClient initialSessions={sessions || []} />
        </div>
    );
}
