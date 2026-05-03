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

    // Get today's date context string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    const { data: slots } = await supabase
        .from('time_slots')
        .select('id, slot_date, start_time, end_time')
        .eq('physio_id', params.physioId)
        .eq('status', 'open')
        .gte('slot_date', today)
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true });

    return (
        <div className="pt-4">
            <BookingClient physio={physio} availableSlots={slots || []} />
        </div>
    );
}
