import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PhysioProfileClient from './PhysioProfileClient';

export default async function PhysioProfilePage({ params }: { params: { id: string } }) {
    const supabase = await createClient();

    // Fetch the physio profile
    const { data: profile } = await supabase
        .from('physio_profiles')
        .select('*')
        .eq('id', params.id)
        .single();

    if (!profile || profile.verification_status !== 'approved') {
        notFound();
    }

    // Fetch verified reviews (mocked for now since MVP won't easily populate them)
    const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('physio_id', params.id)
        .order('created_at', { ascending: false });

    return (
        <div className="pt-4">
            <PhysioProfileClient profile={profile} reviews={reviews || []} />
        </div>
    );
}
