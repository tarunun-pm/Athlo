import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import WeekViewCalendar from '@/components/calendar/WeekViewCalendar';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const revalidate = 0;

export default async function PhysioCalendarPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/signin');
    }

    // Since we just ran a migration and no slots exist yet, we will fetch any existing slots safely
    // By joining on `sessions` or `client_invites` later to get names/emails for titles
    const { data: timeSlots } = await supabase
        .from('time_slots')
        .select(`
            id,
            slot_date,
            start_time,
            end_time,
            status,
            session_id,
            invite_id,
            consultation_mode,
            client_invites (
                client_email
            ),
            sessions (
                consultation_mode,
                athlete_profiles (
                    first_name,
                    last_name
                )
            )
        `)
        .eq('physio_id', user.id);

    // Flatten the payload so WeekViewCalendar can easily read name and mode
    const enrichedSlots = (timeSlots || []).map((slot: any) => {
        let titleSuffix = '';
        let athleteName = '';
        let clientEmail = slot.client_invites?.client_email || '';
        
        if (slot.status === 'booked' && slot.sessions) {
            const profile = Array.isArray(slot.sessions) ? slot.sessions[0]?.athlete_profiles : slot.sessions.athlete_profiles;
            const mode = Array.isArray(slot.sessions) ? slot.sessions[0]?.consultation_mode : slot.sessions.consultation_mode;
            
            if (profile) athleteName = `${profile.first_name} ${profile.last_name}`;
            if (mode) titleSuffix = ` (${mode})`;
        }

        return {
            ...slot,
            athlete_name: athleteName ? `${athleteName}${titleSuffix}` : null,
            client_email: clientEmail
        };
    });

    return (
        <div className="max-w-7xl mx-auto pb-24 space-y-4 pt-4">
            <CalendarHeader physioId={user.id} />

            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[500px] card">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            }>
                <WeekViewCalendar initialSlots={enrichedSlots} />
            </Suspense>
        </div>
    );
}
