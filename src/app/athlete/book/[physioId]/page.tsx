import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import BookingClient from './BookingClient';

export default async function BookingPage({ params }: { params: { physioId: string } }) {
    const supabase = await createClient();

    const { data: physio } = await supabase
        .from('physio_profiles')
        .select('id, first_name, last_name, consultation_rate, consultation_modes')
        .eq('id', params.physioId)
        .single();

    if (!physio) {
        notFound();
    }

    const { data: slots } = await supabase
        .from('availability_slots')
        .select('day_of_week, block')
        .eq('physio_id', params.physioId)
        .eq('is_active', true);

    // Generate the next 14 days of actual dates that match the physio's active days of the week
    // For simplicity since it's an MVP, pass the slots down and let the client generate valid dates

    return (
        <div className="pt-4">
            <BookingClient physio={physio} availableSlots={slots || []} />
        </div>
    );
}
