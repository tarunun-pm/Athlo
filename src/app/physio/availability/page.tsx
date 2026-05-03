'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar as CalendarIcon, Save, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const MODES = ['Online', 'At Clinic', 'Home Visit'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BLOCKS = [
    { id: 'morning', label: 'Morning (6am-12pm)' },
    { id: 'afternoon', label: 'Afternoon (12pm-5pm)' },
    { id: 'evening', label: 'Evening (5pm-10pm)' }
] as const;

type BlockType = 'morning' | 'afternoon' | 'evening';

export default function AvailabilitySetup() {
    const router = useRouter();
    const supabase = createClient();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [rate, setRate] = useState('');
    const [modes, setModes] = useState<string[]>([]);
    // Store selected slots as a Set of strings "dayIndex_block" (e.g., "0_morning" for Mon morning)
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchExisting() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase.from('physio_profiles').select('consultation_rate, consultation_modes').eq('id', user.id).single();
                if (profile) {
                    if (profile.consultation_rate) setRate(profile.consultation_rate.toString());
                    if (profile.consultation_modes) setModes(profile.consultation_modes);
                }

                const { data: slots } = await supabase.from('availability_slots').select('day_of_week, block').eq('physio_id', user.id).eq('is_active', true);
                if (slots) {
                    const loadedSlots = new Set<string>();
                    slots.forEach(s => loadedSlots.add(`${s.day_of_week}_${s.block}`));
                    setSelectedSlots(loadedSlots);
                }
            } catch (err: any) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchExisting();
    }, []);

    const toggleMode = (m: string) => {
        setModes(modes.includes(m) ? modes.filter(x => x !== m) : [...modes, m]);
    };

    const toggleSlot = (dayIndex: number, blockId: BlockType) => {
        const key = `${dayIndex}_${blockId}`;
        const next = new Set(selectedSlots);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setSelectedSlots(next);
    };

    const selectColumn = (dayIndex: number) => {
        const next = new Set(selectedSlots);
        let allSelected = true;
        BLOCKS.forEach(b => {
            if (!next.has(`${dayIndex}_${b.id}`)) allSelected = false;
        });

        BLOCKS.forEach(b => {
            if (allSelected) next.delete(`${dayIndex}_${b.id}`);
            else next.add(`${dayIndex}_${b.id}`);
        });
        setSelectedSlots(next);
    };

    const isFormValid = rate !== '' && parseInt(rate) > 0 && modes.length > 0 && selectedSlots.size > 0;

    const handleSave = async () => {
        if (!isFormValid) return;
        setIsSaving(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Update Profile (rate, modes, is_availability_set)
            const { error: profileError } = await supabase.from('physio_profiles').update({
                consultation_rate: parseInt(rate),
                consultation_modes: modes,
                is_availability_set: true
            }).eq('id', user.id);

            if (profileError) throw profileError;

            // 2. Clear old slots
            await supabase.from('availability_slots').delete().eq('physio_id', user.id);

            // 3. Insert new slots (convert Day 0-6 to matched DB constraints -> Supabase usually wants 0=Sun to 6=Sat but our UI is Mon=0 to Sun=6. 
            // The schema constraint says 0-6. Let's map our Mon=0, Tue=1.. Sun=6.)
            const slotInserts = Array.from(selectedSlots).map(ss => {
                const [dIdx, bId] = ss.split('_');
                return {
                    physio_id: user.id,
                    day_of_week: parseInt(dIdx),
                    block: bId,
                    is_active: true
                };
            });

            if (slotInserts.length > 0) {
                const { error: slotError } = await supabase.from('availability_slots').insert(slotInserts);
                if (slotError) throw slotError;
            }

            router.push('/physio/dashboard');
            router.refresh();

        } catch (err: any) {
            setError(err.message || 'Failed to save availability. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-24">

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                    Availability & Pricing
                </h1>
                <p className="text-text-secondary text-sm">
                    Define when you work and how much you charge for consultations.
                </p>
            </div>

            {error && (
                <div className="bg-error/10 border border-error/50 text-error text-sm p-4 rounded-[14px]">
                    {error}
                </div>
            )}

            {/* Pricing and Modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6 md:p-8">
                    <h2 className="text-lg font-bold text-white mb-4">Consultation Rate</h2>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold">₹</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="Per session rate"
                            value={rate}
                            onChange={e => setRate(e.target.value)}
                            className="input-field pl-10 h-14 text-lg font-mono"
                        />
                    </div>
                    <p className="text-xs text-text-muted mt-2">Standard rate applied across all your active modes.</p>
                </div>

                <div className="card p-6 md:p-8">
                    <h2 className="text-lg font-bold text-white mb-4">Consultation Modes</h2>
                    <div className="flex flex-wrap gap-3">
                        {MODES.map(m => (
                            <button
                                key={m}
                                onClick={() => toggleMode(m)}
                                className={`pill py-3 px-5 text-sm ${modes.includes(m) ? 'bg-primary text-white border-primary shadow-glow' : 'bg-background hover:border-text-muted'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-text-muted mt-3">Select one or more ways you consult with athletes.</p>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <CalendarIcon size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Weekly Schedule</h2>
                        <p className="text-sm text-text-secondary">Select the blocks you are available for booking.</p>
                    </div>
                </div>

                <div className="overflow-x-auto pb-4">
                    <div className="min-w-[600px]">
                        {/* Header Row */}
                        <div className="grid grid-cols-8 gap-2 mb-4">
                            <div className="col-span-1"></div>
                            {DAYS.map((day, idx) => (
                                <div key={day} className="col-span-1 text-center">
                                    <button onClick={() => selectColumn(idx)} className="text-sm font-bold text-text-muted hover:text-white transition-colors">
                                        {day}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Blocks Rows */}
                        <div className="space-y-3">
                            {BLOCKS.map(block => (
                                <div key={block.id} className="grid grid-cols-8 gap-2 items-center">
                                    <div className="col-span-1 text-right pr-4 text-xs font-medium text-text-secondary">
                                        {block.label.split(' ')[0]}
                                        <span className="block text-[10px] text-text-muted">{block.label.split(' ')[1].replace(/[()]/g, '')}</span>
                                    </div>

                                    {DAYS.map((day, idx) => {
                                        const isSelected = selectedSlots.has(`${idx}_${block.id}`);
                                        return (
                                            <div key={`${day}-${block.id}`} className="col-span-1">
                                                <button
                                                    onClick={() => toggleSlot(idx, block.id as BlockType)}
                                                    className={`w-full h-14 rounded-xl border transition-all ${isSelected
                                                            ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,102,255,0.4)]'
                                                            : 'bg-background border-border hover:border-primary/50'
                                                        }`}
                                                >
                                                    <span className="sr-only">Toggle {day} {block.id}</span>
                                                    {isSelected && <CheckCircle2 size={16} className="mx-auto" />}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Save Strip */}
            <div className="fixed bottom-0 left-0 right-0 p-4 lg:pl-[--sidebar-width] bg-background/90 backdrop-blur-xl border-t border-border flex justify-center lg:justify-end z-20">
                <div className="max-w-5xl w-full flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={!isFormValid || isSaving}
                        className="btn-primary min-w-[240px] shadow-glow flex gap-2 items-center disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSaving ? 'Saving...' : 'Save Availability'}
                    </button>
                </div>
            </div>

        </div>
    );
}
