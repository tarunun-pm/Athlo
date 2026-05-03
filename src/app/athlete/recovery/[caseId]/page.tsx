import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import RecoveryTimelineClient from './RecoveryTimelineClient';

export const revalidate = 0;

export default async function AthleteCaseDetailPage({ params }: { params: { caseId: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/signin');

    // Fetch case file WITHOUT embedded joins (FK constraints may not exist)
    const { data: caseFile } = await supabase
        .from('case_files')
        .select('*')
        .eq('id', params.caseId)
        .single();
        
    if (!caseFile || caseFile.athlete_id !== user.id) notFound();

    // Fetch physio profile separately
    const { data: physioProfile } = await supabase
        .from('physio_profiles')
        .select('*')
        .eq('id', caseFile.physio_id)
        .single();

    const enrichedCaseFile = {
        ...caseFile,
        physio_profiles: physioProfile,
    };

    const { data: treatmentPlans } = await supabase.from('treatment_plans').select('*').eq('case_id', params.caseId);
    
    // Fetch session notes without FK join
    const { data: sessionNotes } = await supabase.from('session_notes').select('*').eq('case_id', params.caseId);
    
    // Enrich with session data separately
    const enrichedNotes = await Promise.all(
        (sessionNotes || []).map(async (note: any) => {
            if (note.session_id) {
                const { data: session } = await supabase
                    .from('sessions')
                    .select('scheduled_at')
                    .eq('id', note.session_id)
                    .single();
                return { ...note, sessions: session };
            }
            return { ...note, sessions: null };
        })
    );

    const { data: progressEntries } = await supabase.from('progress_entries').select('*').eq('case_id', params.caseId);
    const { data: milestones } = await supabase.from('milestones').select('*').eq('case_id', params.caseId);

    return (
        <div className="max-w-4xl mx-auto pb-24">
            <RecoveryTimelineClient 
                caseFile={enrichedCaseFile}
                plans={treatmentPlans || []}
                notes={enrichedNotes}
                progress={progressEntries || []}
                milestones={milestones || []}
            />
        </div>
    );
}
