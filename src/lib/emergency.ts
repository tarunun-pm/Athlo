import { createClient } from '@/lib/supabase/client';

export type UrgencyLevel = 'critical' | 'moderate' | 'can_wait';

/**
 * Submits a new emergency request for an athlete and kicks off the background cascade.
 */
export async function submitEmergencyRequest(athleteId: string, bodyPart: string, urgency: UrgencyLevel, description: string) {
    const supabase = createClient();
    
    // Create the initial request
    const { data: request, error: requestError } = await supabase
        .from('emergency_requests')
        .insert({
            athlete_id: athleteId,
            body_part: bodyPart,
            urgency,
            description,
            search_radius_km: 10,
            search_window_hours: 2,
            status: 'pending'
        })
        .select()
        .single();
        
    if (requestError) throw requestError;

    // Trigger the finding RPC (In a real system this might be an Edge Function or trigger)
    // For MVP, the client kicks off the first cascade attempt
    const { error: cascadeError } = await supabase.rpc('cascade_emergency_request', {
        p_request_id: request.id
    });

    if (cascadeError) {
        console.error("Failed to start cascade:", cascadeError);
    }

    return request;
}

/**
 * Calculates the Rs. 500 surcharge, capped at Rs. 3000 max session cost.
 */
export function calculateEmergencySurcharge(baseRate: number): number {
    const SURCHARGE = 500;
    const MAX_CAP = 3000;
    
    // If base is already 2500 or above, the surcharge is waived (capped)
    if (baseRate >= 2500) {
        return 0; // Already premium
    }
    
    // If base + surcharge > 3000, return the difference
    if (baseRate + SURCHARGE > MAX_CAP) {
        return MAX_CAP - baseRate;
    }
    
    return SURCHARGE;
}
