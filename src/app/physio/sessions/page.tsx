import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PhysioSessionsClient from './PhysioSessionsClient';

export const revalidate = 0;

export default async function PhysioSessionsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/signin');
    }

    const { data: sessions } = await supabase
        .from('sessions')
        .select(`
            id, scheduled_at, status, consultation_mode, amount, athlete_id,
            athlete_profiles:athlete_id (id, first_name, last_name, primary_sport)
        `)
        .eq('physio_id', user.id)
        .order('scheduled_at', { ascending: true });

    return (
        <div className="max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Sessions</h1>
                <p className="text-text-secondary">View today's schedule and manage your patients.</p>
            </div>
            
            <PhysioSessionsClient initialSessions={sessions || []} />
        </div>
    );
}
