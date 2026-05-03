import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AthleteProfileClient from './AthleteProfileClient';

export default async function AthleteProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/');

    const { data: profile } = await supabase
        .from('athlete_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const { data: userRow } = await supabase
        .from('users')
        .select('email, phone')
        .eq('id', user.id)
        .single();

    return <AthleteProfileClient profile={profile} user={{ ...userRow, id: user.id, email: user.email }} />;
}
