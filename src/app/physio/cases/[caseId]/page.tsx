import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import CaseDetailClient from './CaseDetailClient';

export const revalidate = 0;

export default async function CaseDetailPage({ params }: { params: { caseId: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/signin');

    // Fetch case file WITHOUT embedded joins (FK constraints may not exist in remote DB)
    const { data: caseFile, error: caseError } = await supabase
        .from('case_files')
        .select('*')
        .eq('id', params.caseId)
        .single();

    if (caseError || !caseFile) {
        return (
            <div className="p-10 max-w-3xl mx-auto my-20 bg-error/10 border-2 border-error rounded-xl text-white">
                <h1 className="text-2xl font-bold mb-4">Case Not Found</h1>
                <p className="text-text-secondary mb-4">This case file could not be loaded.</p>
                <pre className="whitespace-pre-wrap text-sm break-words bg-background p-4 rounded-lg">
                    {JSON.stringify({ error: caseError, id: params.caseId }, null, 2)}
                </pre>
            </div>
        );
    }

    // Verify ownership
    if (caseFile.physio_id !== user.id && caseFile.athlete_id !== user.id) {
        notFound();
    }

    // Role
    const isPhysio = caseFile.physio_id === user.id;

    // Fetch athlete and physio profiles separately (avoids FK join requirement)
    const { data: athleteProfile } = await supabase
        .from('athlete_profiles')
        .select('*')
        .eq('id', caseFile.athlete_id)
        .single();

    const { data: physioProfile } = await supabase
        .from('physio_profiles')
        .select('*')
        .eq('id', caseFile.physio_id)
        .single();

    // Merge profiles into the caseFile object so CaseDetailClient works unchanged
    const enrichedCaseFile = {
        ...caseFile,
        athlete_profiles: athleteProfile,
        physio_profiles: physioProfile,
    };

    // Fetch Treatment Plans
    const { data: treatmentPlans } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('case_id', params.caseId)
        .order('started_at', { ascending: false });

    // Fetch Session Notes (also avoid FK join on sessions)
    const { data: sessionNotes } = await supabase
        .from('session_notes')
        .select('*')
        .eq('case_id', params.caseId)
        .order('created_at', { ascending: false });

    // Enrich session notes with session data separately
    const enrichedNotes = await Promise.all(
        (sessionNotes || []).map(async (note: any) => {
            if (note.session_id) {
                const { data: session } = await supabase
                    .from('sessions')
                    .select('scheduled_at, status')
                    .eq('id', note.session_id)
                    .single();
                return { ...note, sessions: session };
            }
            return { ...note, sessions: null };
        })
    );

    // Fetch Progress Entries
    const { data: progressEntries } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('case_id', params.caseId)
        .order('recorded_at', { ascending: true });

    // Fetch Milestones
    const { data: milestones } = await supabase
        .from('milestones')
        .select('*')
        .eq('case_id', params.caseId)
        .order('target_date', { ascending: true });

    // Fetch completed sessions for the "Add Note" dropdown
    const { data: availableSessions } = isPhysio ? await supabase
        .from('sessions')
        .select('id, scheduled_at, status')
        .eq('physio_id', user.id)
        .eq('athlete_id', caseFile.athlete_id)
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false }) : { data: [] };

    return (
        <div className="max-w-6xl mx-auto pb-24">
            <CaseDetailClient 
                caseFile={enrichedCaseFile}
                initialTreatmentPlans={treatmentPlans || []}
                initialSessionNotes={enrichedNotes}
                initialProgressEntries={progressEntries || []}
                initialMilestones={milestones || []}
                availableSessions={availableSessions || []}
                isPhysio={isPhysio}
            />
        </div>
    );
}
