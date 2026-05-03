import { createClient } from '@/lib/supabase/client';
import { createNotification } from '@/lib/notifications';

/**
 * Creates an invite for an existing offline client to join Athlo.
 * Locks an open slot as 'pending_invite' with a 7-day TTL.
 */
export async function sendClientInvite(
    physioId: string, 
    clientEmail: string, 
    slotId: string
) {
    const supabase = createClient();

    // 1. Double check the slot is actually open
    const { data: slot, error: slotError } = await supabase
        .from('time_slots')
        .select('status')
        .eq('id', slotId)
        .single();
    
    if (slotError || slot?.status !== 'open') {
        throw new Error('This slot is no longer available');
    }

    // 2. Create the invite
    const { data: invite, error: inviteError } = await supabase
        .from('client_invites')
        .insert({
            physio_id: physioId,
            client_email: clientEmail,
            slot_id: slotId,
            status: 'pending'
            // token generates automatically
            // expires_at is 7 days from now automatically
        })
        .select()
        .single();

    if (inviteError) throw inviteError;

    // 3. Update the slot status to pending_invite
    const { error: updateError } = await supabase
        .from('time_slots')
        .update({ 
            status: 'pending_invite',
            invite_id: invite.id 
        })
        .eq('id', slotId);

    if (updateError) {
        // Rollback invite if slot update failed
        await supabase.from('client_invites').delete().eq('id', invite.id);
        throw new Error('Failed to reserve slot for invite');
    }

    // 4. In a real environment, trigger an email via Resend or SendGrid here
    // e.g. await sendEmail({ to: clientEmail, subject: 'Invite to Athlo', body: `Link: /onboarding/invite/${invite.invite_token}` });
    console.log(`[SIMULATED EMAIL] Sent invite to ${clientEmail} with token ${invite.invite_token}`);

    return invite;
}
