import { SupabaseClient } from '@supabase/supabase-js';

export type NotificationType =
    | 'booking_new'
    | 'booking_cancelled'
    | 'session_completed'
    | 'case_created'
    | 'note_added'
    | 'milestone_added'
    | 'milestone_completed'
    | 'plan_updated'
    | 'review_received'
    | 'verification_approved'
    | 'verification_rejected';

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
}

/**
 * Inserts a notification row into the `notifications` table.
 * Fire-and-forget: errors are logged but don't block the caller.
 */
export async function createNotification(
    supabase: SupabaseClient,
    { userId, type, title, message, link }: CreateNotificationParams
) {
    const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        type,
        title,
        message,
        link: link || null,
        is_read: false,
    });

    if (error) {
        console.error('[Notification] Failed to create:', error.message);
    }
}
