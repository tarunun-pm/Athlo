import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PhysioProfileClient from './PhysioProfileClient';

export default async function PhysioProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/');

    const { data: profile } = await supabase
        .from('physio_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const { data: userRow } = await supabase
        .from('users')
        .select('email, phone')
        .eq('id', user.id)
        .single();

    return <PhysioProfileClient profile={profile} user={{ ...userRow, id: user.id, email: user.email }} />;
}
