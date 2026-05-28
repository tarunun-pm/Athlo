import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Calendar, ArrowRight, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default async function InviteOnboardingPage({
    params
}: {
    params: { token: string }
}) {
    const supabase = await createClient();

    // 1. Verify the token
    const { data: invite, error } = await supabase
        .from('client_invites')
        .select(`
            id, 
            status, 
            expires_at, 
            physio_id,
            client_email,
            slot_id,
            physio_profiles ( first_name, last_name, consultation_rate ),
            time_slots ( slot_date, start_time )
        `)
        .eq('invite_token', params.token)
        .single();

    // If invite doesn't exist, is expired by DB, or TTL has passed
    if (error || !invite || invite.status !== 'pending' || new Date(invite.expires_at) < new Date()) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="card max-w-md w-full p-8 text-center bg-surface border-border">
                    <div className="w-16 h-16 rounded-full bg-error/20 text-error flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Invite Expired</h1>
                    <p className="text-text-secondary mb-6">
                        This invitation link is invalid or has expired. The reserved time slot has been released.
                    </p>
                    <Link href="/" className="btn-primary w-full justify-center shadow-glow">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const physioProfile = Array.isArray(invite.physio_profiles)
        ? invite.physio_profiles[0]
        : invite.physio_profiles;
    const timeSlot = Array.isArray(invite.time_slots)
        ? invite.time_slots[0]
        : invite.time_slots;

    const { data: { session } } = await supabase.auth.getSession();

    // If they are already logged in, redirect them to a confirmation endpoint or dashboard
    if (session) {
        // Here we could auto-accept the invite since they are logged in
        // For MVP, we'll just redirect to dashboard
        redirect('/athlete/dashboard?invite=true');
    }

    // Server Action for handling the temporary signup
    async function acceptInviteAndSignup(formData: FormData) {
        'use server';
        const supabase = await createClient();
        
        // MVP demo flow: In reality this would be a real auth signup flow
        // The edge function or endpoint would capture the auth hook,
        // create the athlete_profile, update the invite to 'accepted',
        // and update the time_slot to 'booked', then create the 'sessions' row
        // passing down the 5% private_client commission rule.
        
        redirect('/auth/signup?invite_token=' + params.token);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="card max-w-lg w-full p-8 md:p-12 relative z-10 border-border bg-gradient-to-br from-surface to-background shadow-2xl">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                            <span className="font-syne font-bold text-white text-lg leading-none">*</span>
                        </div>
                        <span className="font-syne font-bold text-xl tracking-tight">Athlo</span>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-3">You've been invited!</h1>
                    <p className="text-text-secondary">
                        Dr. {physioProfile?.first_name} {physioProfile?.last_name} has invited you to manage your recovery journey on Athlo.
                    </p>
                </div>

                <div className="bg-[#121417] border border-border rounded-xl p-6 mb-8">
                    <h3 className="text-sm font-bold tracking-wider text-text-muted uppercase mb-4">Reserved Session</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                                <User size={18} />
                            </div>
                            <div>
                                <div className="text-white font-medium">Dr. {physioProfile?.last_name}</div>
                                <div className="text-xs text-text-secondary">Sports Physiotherapist</div>
                            </div>
                        </div>

                        {timeSlot && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-surface border border-border text-text-secondary flex items-center justify-center shrink-0">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <div className="text-white font-medium">
                                        {format(parseISO(timeSlot.slot_date), 'EEEE, MMMM do')}
                                    </div>
                                    <div className="text-xs text-text-secondary">
                                        at {parseInt(timeSlot.start_time.split(':')[0]) % 12 || 12}:{timeSlot.start_time.split(':')[1]} {parseInt(timeSlot.start_time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <form action={acceptInviteAndSignup}>
                    <button type="submit" className="btn-primary w-full justify-center shadow-glow group py-4">
                        <span className="text-base">Accept Invite & Create Account</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-text-muted">
                    By accepting, you agree to our Terms of Service and Privacy Policy. Private clients brought onto the platform enjoy exclusive discounted platform fees.
                </p>
            </div>
        </div>
    );
}
