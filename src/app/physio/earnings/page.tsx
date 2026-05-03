import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PhysioEarningsClient from './PhysioEarningsClient';

export const revalidate = 0;

export default async function EarningsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/signin');
    }

    // Fetch past sessions to calculate earnings
    const { data: sessions } = await supabase
        .from('sessions')
        .select(`
            id, amount, status, session_type, session_origin, 
            commission_rate, emergency_surcharge, net_physio_earnings, scheduled_at,
            duration_minutes,
            athlete_profiles(first_name, last_name)
        `)
        .eq('physio_id', user.id)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false });

    return (
        <div className="max-w-6xl mx-auto h-full space-y-8 p-4 md:p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Earnings & Commissions</h1>
                <p className="text-text-secondary text-sm">
                    Detailed breakdown of your completed sessions, emergency surcharges, and platform commissions. 
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-warning/10 text-warning font-bold text-xs uppercase tracking-wider">Preview Only — Payments Future Phase</span>
                </p>
            </div>

            <PhysioEarningsClient initialSessions={sessions || []} />
        </div>
    );
}
