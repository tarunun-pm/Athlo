'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type TemplateDay = {
    day_of_week: number;
    is_active: boolean;
    start_hour: number;
    end_hour: number;
    session_duration_minutes?: number;
    buffer_minutes?: number;
};

const DEFAULT_DAYS: TemplateDay[] = [
    { day_of_week: 1, is_active: true, start_hour: 9, end_hour: 17 },
    { day_of_week: 2, is_active: true, start_hour: 9, end_hour: 17 },
    { day_of_week: 3, is_active: true, start_hour: 9, end_hour: 17 },
    { day_of_week: 4, is_active: true, start_hour: 9, end_hour: 17 },
    { day_of_week: 5, is_active: true, start_hour: 9, end_hour: 17 },
    { day_of_week: 6, is_active: false, start_hour: 10, end_hour: 14 },
    { day_of_week: 0, is_active: false, start_hour: 10, end_hour: 14 }
];

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HOURS = Array.from({ length: 24 }).map((_, i) => i);

export default function TemplateEditor({ physioId, onClose }: { physioId: string, onClose: () => void }) {
    const [days, setDays] = useState<TemplateDay[]>(DEFAULT_DAYS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [globalDuration, setGlobalDuration] = useState(60);
    const [globalBuffer, setGlobalBuffer] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchTemplates = async () => {
            const { data, error } = await supabase
                .from('schedule_templates')
                .select('*')
                .eq('physio_id', physioId);
                
            if (!error && data && data.length > 0) {
                // Merge fetched DB templates with default missing days
                const newDays = DEFAULT_DAYS.map(def => {
                    const found = data.find(d => d.day_of_week === def.day_of_week);
                    if (found) {
                        // Assuming first found record sets global state for simplicity, as UI is global
                        if (found.session_duration_minutes) setGlobalDuration(found.session_duration_minutes);
                        if (found.buffer_minutes !== undefined) setGlobalBuffer(found.buffer_minutes);
                        return {
                            day_of_week: found.day_of_week,
                            is_active: found.is_active,
                            start_hour: found.start_hour,
                            end_hour: found.end_hour,
                            session_duration_minutes: found.session_duration_minutes,
                            buffer_minutes: found.buffer_minutes
                        };
                    }
                    return def;
                });
                setDays(newDays);
            }
            setIsLoading(false);
        };
        fetchTemplates();
    }, [physioId, supabase]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        try {
            const activeTemplates = days.filter(d => d.is_active);
            
            if (activeTemplates.length === 0) {
                setError("Please select at least one available day and time block.");
                setIsSaving(false);
                return;
            }

            // 1. Delete existing templates for this physio
            await supabase.from('schedule_templates').delete().eq('physio_id', physioId);

            // 2. Insert the active days
            const insertPayload = activeTemplates.map(d => ({
                physio_id: physioId,
                day_of_week: d.day_of_week,
                start_hour: d.start_hour,
                end_hour: d.end_hour,
                is_active: true,
                session_duration_minutes: globalDuration,
                buffer_minutes: globalBuffer
            }));

            if (insertPayload.length > 0) {
                const { error: insertErr } = await supabase.from('schedule_templates').insert(insertPayload);
                if (insertErr) throw insertErr;
            }

            // 3. Mark profile setting true
            await supabase.from('physio_profiles').update({ is_availability_set: true }).eq('id', physioId);

            // 4. Trigger the RPC generator
            const { error: rpcError } = await supabase.rpc('generate_slots_from_template', {
                p_physio_id: physioId
            });

            if (rpcError) throw rpcError;

            // Success! We reload or close
            onClose();
            window.location.reload();

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to save template');
        } finally {
            setIsSaving(false);
        }
    };

    const updateDay = (day_of_week: number, updates: Partial<TemplateDay>) => {
        setDays(days.map(d => d.day_of_week === day_of_week ? { ...d, ...updates } : d));
    };

    const formatHour = (h: number) => {
        if (h === 0) return '12:00 AM';
        if (h === 12) return '12:00 PM';
        return h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`;
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto pt-24">
            <div className="card w-full max-w-2xl p-8 bg-surface border-border shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-white"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">Weekly Recurring Template</h2>
                <p className="text-text-secondary text-sm mb-6">
                    Set your standard working hours. This template automatically generates your available time slots 14 days into the future. It does not overwrite manually blocked times.
                </p>
                
                {error && <div className="bg-error/10 text-error p-3 rounded-lg text-sm font-bold mb-6">{error}</div>}

                {isLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32}/></div>
                ) : (
                    <div className="space-y-4 mb-8">
                        {/* Ensure Monday starts first visually even though 0=Sun in DB */}
                        {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
                            const dayConfig = days.find(d => d.day_of_week === dayIndex)!;
                            
                            return (
                                <div key={dayIndex} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${dayConfig.is_active ? 'bg-primary/5 border-primary/30' : 'bg-background border-border opacity-60'}`}>
                                    <label className="flex items-center gap-3 cursor-pointer min-w-[120px]">
                                        <input 
                                            type="checkbox" 
                                            checked={dayConfig.is_active}
                                            onChange={(e) => updateDay(dayIndex, { is_active: e.target.checked })}
                                            className="w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-background bg-background"
                                        />
                                        <span className={`font-bold ${dayConfig.is_active ? 'text-white' : 'text-text-muted'}`}>{DAY_LABELS[dayIndex]}</span>
                                    </label>
                                    
                                    {dayConfig.is_active ? (
                                        <div className="flex items-center gap-3 flex-1 sm:justify-end">
                                            <select 
                                                value={dayConfig.start_hour}
                                                onChange={(e) => updateDay(dayIndex, { start_hour: Number(e.target.value) })}
                                                className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                            >
                                                {HOURS.map(h => <option key={h} value={h} disabled={h >= dayConfig.end_hour}>{formatHour(h)}</option>)}
                                            </select>
                                            <span className="text-text-muted text-sm font-medium">to</span>
                                            <select 
                                                value={dayConfig.end_hour}
                                                onChange={(e) => updateDay(dayIndex, { end_hour: Number(e.target.value) })}
                                                className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                                            >
                                                {HOURS.map(h => <option key={h} value={h} disabled={h <= dayConfig.start_hour}>{formatHour(h)}</option>)}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex-1 sm:text-right text-text-muted text-sm font-medium italic">Unavailable</div>
                                    )}
                                </div>
                            );
                        })}
                        
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                            <div>
                                <label className="block text-sm font-bold text-white mb-2">Session Duration</label>
                                <select 
                                    value={globalDuration}
                                    onChange={(e) => setGlobalDuration(Number(e.target.value))}
                                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary appearance-none"
                                >
                                    <option value={30}>30 Minutes</option>
                                    <option value={45}>45 Minutes</option>
                                    <option value={60}>60 Minutes</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white mb-2">Break / Buffer Time</label>
                                <select 
                                    value={globalBuffer}
                                    onChange={(e) => setGlobalBuffer(Number(e.target.value))}
                                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-primary appearance-none"
                                >
                                    <option value={0}>No Buffer</option>
                                    <option value={5}>5 Minutes</option>
                                    <option value={10}>10 Minutes</option>
                                    <option value={15}>15 Minutes</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4 border-t border-border/50">
                    <button 
                        onClick={onClose} 
                        disabled={isSaving}
                        className="btn-outline mr-3"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving || isLoading}
                        className="btn-primary flex gap-2 items-center min-w-[140px] justify-center shadow-glow"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Template
                    </button>
                </div>
            </div>
        </div>
    );
}
