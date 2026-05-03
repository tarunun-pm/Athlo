'use client';

import { useState } from 'react';
import { Siren, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function EmergencyToggle({ initialStatus, physioId }: { initialStatus: boolean, physioId: string }) {
    const [isOptedIn, setIsOptedIn] = useState(initialStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const supabase = createClient();

    const handleToggle = async () => {
        setIsUpdating(true);
        const newState = !isOptedIn;
        
        // Optimistic UI
        setIsOptedIn(newState);

        const { error } = await supabase
            .from('physio_profiles')
            .update({ emergency_opt_in: newState })
            .eq('id', physioId);

        if (error) {
            // Revert on error
            setIsOptedIn(!newState);
            console.error(error);
        }
        setIsUpdating(false);
    };

    return (
        <div className={`card p-4 flex items-center justify-between border-border overflow-hidden relative transition-all ${isOptedIn ? 'bg-error/5 border-error/20' : 'bg-surface'}`}>
            {isOptedIn && <div className="absolute top-0 left-0 w-1 h-full bg-error border-error shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>}
            
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOptedIn ? 'bg-error/20 text-error' : 'bg-background text-text-muted border border-border'}`}>
                    <Siren size={20} className={isOptedIn ? 'animate-pulse' : ''} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white">Emergency Mode</h3>
                    <p className="text-xs text-text-secondary">{isOptedIn ? 'Accepting urgent cases (+₹500)' : 'Currently opted out'}</p>
                </div>
            </div>

            <button 
                onClick={handleToggle} 
                disabled={isUpdating}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isOptedIn ? 'bg-error' : 'bg-border'}`}
            >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOptedIn ? 'translate-x-5' : 'translate-x-0'}`}></span>
            </button>
        </div>
    );
}
