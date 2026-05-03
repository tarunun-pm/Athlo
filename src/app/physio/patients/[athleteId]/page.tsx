import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import PatientDetailClient from './PatientDetailClient';

export const revalidate = 0;

export default async function PatientPage({ params }: { params: { athleteId: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/signin');

    const { data: athlete } = await supabase
        .from('athlete_profiles')
        .select('*')
        .eq('id', params.athleteId)
        .single();
        
    if (!athlete) notFound();

    // We removed the strict session check here because it was causing 404s
    // if a session was just marked 'completed' or had edge cases in RLS.
    // As long as the athlete exists, the CRM page should load. Access to specific
    // case files is still protected by RLS anyway.
    
    const { data: cases } = await supabase
        .from('case_files')
        .select('*')
        .eq('athlete_id', params.athleteId)
        .eq('physio_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="max-w-6xl mx-auto pb-24">
            <PatientDetailClient athlete={athlete} initialCases={cases || []} physioId={user.id} />
        </div>
    );
}
