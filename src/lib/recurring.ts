import { createClient } from '@/lib/supabase/client';
import { addDays, parseISO, format } from 'date-fns';

export type Conflict = {
    date: string;
    reason: 'blocked' | 'booked' | 'no_slot';
};

/**
 * Checks for conflicts before generating a recurring series of sessions.
 * Returns an array of dates that have conflicts.
 */
export async function checkRecurringSeries(
    physioId: string,
    timeTemplate: string, // e.g., '14:00'
    dayOfWeek: number,    // 0 = Monday, 6 = Sunday (UI mapped)
    weeks: number,        // e.g., 4 or 8
    startDateStr: string  // 'YYYY-MM-DD'
): Promise<{ validSlots: any[], conflicts: Conflict[] }> {
    
    const supabase = createClient();
    const conflicts: Conflict[] = [];
    const validSlots: any[] = [];
    
    // Generate dates to check
    const start = parseISO(startDateStr);
    const targetDates = Array.from({ length: weeks }).map((_, i) => addDays(start, i * 7));
    
    // For each date, check if a slot exists that is open at timeTemplate
    for (const d of targetDates) {
        const dStr = format(d, 'yyyy-MM-dd');
        
        const { data: slot, error } = await supabase
            .from('time_slots')
            .select('*')
            .eq('physio_id', physioId)
            .eq('slot_date', dStr)
            .like('start_time', `${timeTemplate}%`) // Match 14:00:00
            .single();

        if (error || !slot) {
            conflicts.push({ date: dStr, reason: 'no_slot' });
        } else if (slot.status === 'blocked') {
            conflicts.push({ date: dStr, reason: 'blocked' });
        } else if (slot.status === 'booked' || slot.status === 'pending_invite') {
            conflicts.push({ date: dStr, reason: 'booked' });
        } else {
            validSlots.push(slot);
        }
    }

    return { validSlots, conflicts };
}

/**
 * Creates the recurring series bypassing conflicts if desired,
 * or throwing if strict conflict resolution is needed.
 */
export async function createRecurringSeries(
    physioId: string,
    athleteId: string,
    validSlotIds: string[],
    parentSessionId: string,
    baseRate: number,
    consultationMode: string
) {
    const supabase = createClient();
    
    // 1. Generate a series ID
    const seriesId = crypto.randomUUID();

    // 2. We use atomic booking for each slot just to be safe from race conditions,
    // though since it's physio-initiated, it's less likely.
    
    const results = [];
    for (const slotId of validSlotIds) {
        const { data: rpcData, error: rpcError } = await supabase.rpc('book_slot_atomic', {
            p_slot_id: slotId,
            p_athlete_id: athleteId,
            p_mode: consultationMode,
            p_injury: 'Recurring series follow-up'
        });

        if (!rpcError && rpcData?.success) {
            // Update newly created session with series and parent data
            await supabase.from('sessions')
                .update({ 
                    series_id: seriesId, 
                    parent_session_id: parentSessionId,
                    session_type: 'follow_up' 
                })
                .eq('id', rpcData.session_id);
            
            results.push(rpcData.session_id);
        }
    }

    return { seriesId, bookedCount: results.length };
}
