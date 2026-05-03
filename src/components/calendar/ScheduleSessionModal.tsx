'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, Loader2, X, Mail, DollarSign } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type CreationType = 'open' | 'assign' | 'invite';

export default function ScheduleSessionModal({ 
    physioId, 
    prefillAthleteId, 
    prefillParentSessionId,
    prefillCaseId,
    onClose 
}: { 
    physioId: string, 
    prefillAthleteId?: string,
    prefillParentSessionId?: string,
    prefillCaseId?: string,
    onClose: () => void 
}) {
    const [creationType, setCreationType] = useState<CreationType>(prefillAthleteId ? 'assign' : 'open');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Assignment State
    const [athletes, setAthletes] = useState<any[]>([]);
    const [selectedAthlete, setSelectedAthlete] = useState(prefillAthleteId || '');
    
    // Invite State
    const [clientEmail, setClientEmail] = useState('');
    const [clientName, setClientName] = useState('');

    // Shared Date/Time State
    const [date, setDate] = useState('');
    const [time, setTime] = useState('09:00');
    const [duration, setDuration] = useState('60');
    const [mode, setMode] = useState('In-Clinic');
    
    // Rate State
    const [rate, setRate] = useState<number | ''>(1500);

    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchAthletes = async () => {
            const { data } = await supabase
                .from('case_files')
                .select('athlete_id, athlete_profiles(first_name, last_name)')
                .eq('physio_id', physioId);
                
            if (data) {
                const validIds = new Set();
                const filtered = data.filter(d => {
                    if (validIds.has(d.athlete_id)) return false;
                    validIds.add(d.athlete_id);
                    return true;
                }).map(d => ({ id: d.athlete_id, ...d.athlete_profiles }));
                
                setAthletes(filtered);
                
                if (prefillAthleteId && !filtered.find(a => a.id === prefillAthleteId)) {
                    const { data: profile } = await supabase.from('athlete_profiles').select('first_name, last_name').eq('id', prefillAthleteId).single();
                    if (profile) setAthletes([{ id: prefillAthleteId, ...profile }, ...filtered]);
                }
            }
        };
        
        const fetchBaseRate = async () => {
             const { data: physio } = await supabase.from('physio_profiles').select('consultation_rate').eq('id', physioId).single();
             if (physio?.consultation_rate) setRate(physio.consultation_rate);
        };
        
        fetchAthletes();
        if (!prefillParentSessionId) fetchBaseRate();
    }, [physioId, prefillAthleteId, prefillParentSessionId, supabase]);
    
    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        // Validations
        if (creationType === 'assign' && !selectedAthlete) return setError("Please select an athlete.");
        if (creationType === 'invite' && (!clientEmail || !clientEmail.includes('@'))) return setError("Please provide a valid email.");
        if ((creationType === 'assign' || creationType === 'invite') && typeof rate === 'number' && rate < 200) return setError("Minimum session rate is Rs. 200.");
        
        setIsSubmitting(true);
        
        try {
            const [hours, mins] = time.split(':').map(Number);
            const endDate = new Date(new Date().setHours(hours, mins + Number(duration)));
            const endTimeStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}:00`;
            const startTimeStr = `${time}:00`;

            const finalRate = Number(rate) || 0;

            if (creationType === 'open') {
                // TC-12, TC-14, TC-15: Safely create ad-hoc slot via RPC
                const { data: result, error: rpcErr } = await supabase.rpc('create_adhoc_slot', {
                    p_physio_id: physioId,
                    p_slot_date: date,
                    p_start_time: startTimeStr,
                    p_end_time: endTimeStr,
                    p_consultation_mode: mode
                });
                
                if (rpcErr) throw rpcErr;
                if (!result.success) throw new Error(result.message);
                
            } else if (creationType === 'invite') {
                // Ensure a safe ad-hoc slot is made first, passing the email directly hooks it up to an invite (TC-16, TC-23)
                const { data: adhocResult, error: adhocErr } = await supabase.rpc('create_adhoc_slot', {
                    p_physio_id: physioId,
                    p_slot_date: date,
                    p_start_time: startTimeStr,
                    p_end_time: endTimeStr,
                    p_consultation_mode: mode,
                    p_client_email: clientEmail
                });
                if (adhocErr) throw adhocErr;
                if (!adhocResult.success) throw new Error(adhocResult.message);
                
            } else if (creationType === 'assign') {
                // Make the slot available first
                 const { data: adhocResult, error: adhocErr } = await supabase.rpc('create_adhoc_slot', {
                    p_physio_id: physioId,
                    p_slot_date: date,
                    p_start_time: startTimeStr,
                    p_end_time: endTimeStr,
                    p_consultation_mode: mode
                });
                if (adhocErr) throw adhocErr;
                if (!adhocResult.success) throw new Error(adhocResult.message);
                
                // Then book it securely explicitly with the athlete
                const { data: bookResult, error: bookErr } = await supabase.rpc('book_slot_atomic', {
                    p_slot_id: adhocResult.slot_id,
                    p_athlete_id: selectedAthlete,
                    p_mode: mode,
                    p_injury: 'Ad-hoc booked session'
                });
                if (bookErr) throw bookErr;
                if (!bookResult.success) throw new Error(bookResult.error);
                
                // Overwrite the default rate if needed
                await supabase.from('sessions').update({ amount: finalRate }).eq('id', bookResult.session_id);
            }

            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to schedule session');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isRateValid = typeof rate === 'number' && rate >= 200;
    const commissionPercent = creationType === 'invite' ? 5 : 15;
    const calculatedCommission = typeof rate === 'number' ? (rate * (commissionPercent / 100)) : 0;
    const netEarnings = typeof rate === 'number' ? rate - calculatedCommission : 0;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto pt-20">
            <div className="card w-full max-w-lg p-8 bg-surface border-border shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-white">
                    <X size={20} />
                </button>

                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6">
                    {creationType === 'invite' ? <Mail size={24} /> : <Calendar size={24} />}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                    {prefillAthleteId ? 'Schedule Follow-Up' : 'Add Time Slot / Session'}
                </h3>
                
                {!prefillAthleteId && (
                    <div className="flex bg-background p-1 rounded-lg border border-border mb-6">
                        <button type="button" onClick={() => setCreationType('open')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${creationType === 'open' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'}`}>Open Slot</button>
                        <button type="button" onClick={() => setCreationType('assign')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${creationType === 'assign' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'}`}>Assign</button>
                        <button type="button" onClick={() => setCreationType('invite')} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${creationType === 'invite' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'}`}>Invite Mail</button>
                    </div>
                )}

                {error && <div className="bg-error/10 text-error p-3 rounded-lg text-sm font-bold mb-6 border border-error/20">{error}</div>}

                <form onSubmit={handleSchedule} className="space-y-4">
                    
                    {/* ASSIGNMENT FIELDS */}
                    {creationType === 'assign' && (
                        <div>
                            <label className="block text-sm font-bold text-white mb-1.5">Athlete / Client</label>
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background relative">
                                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
                                    <User size={14} className="text-text-muted" />
                                </div>
                                <select 
                                    required 
                                    value={selectedAthlete}
                                    onChange={e => setSelectedAthlete(e.target.value)}
                                    disabled={!!prefillAthleteId}
                                    className="w-full bg-transparent text-white focus:outline-none appearance-none disabled:opacity-70 text-sm"
                                >
                                    <option value="" disabled className="bg-surface">Select a patient...</option>
                                    {athletes.map(a => (
                                        <option key={a.id} value={a.id} className="bg-surface">{a.first_name} {a.last_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    
                    {/* INVITE FIELDS */}
                    {creationType === 'invite' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-white mb-1.5">Client Name</label>
                                <input type="text" required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Jane Doe" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white mb-1.5">Client Email</label>
                                <input type="email" required value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="jane@example.com" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none text-sm" />
                            </div>
                        </div>
                    )}

                    {/* DATETIME FIELDS */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <label className="block text-sm font-bold text-white mb-1.5">Date</label>
                            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white mb-1.5">Start Time</label>
                            <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-white mb-1.5">Mode</label>
                            <select required value={mode} onChange={e => setMode(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none appearance-none">
                                <option value="In-Clinic">In-Clinic</option>
                                <option value="Online">Online</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-white mb-1.5">Duration</label>
                            <select required value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none appearance-none">
                                <option value="30">30 Minutes</option>
                                <option value="45">45 Minutes</option>
                                <option value="60">60 Minutes</option>
                                <option value="90">90 Minutes</option>
                            </select>
                        </div>
                    </div>

                    {/* RATE FIELDS (Only if creating a session) */}
                    {(creationType === 'assign' || creationType === 'invite') && (
                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/50">
                            <div>
                                <label className="block text-sm font-bold text-white mb-1.5">Session Rate (Rs.)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <DollarSign size={16} className="text-text-muted" />
                                    </div>
                                    <input 
                                        type="number" 
                                        required 
                                        min="200"
                                        value={rate}
                                        onChange={e => setRate(e.target.value ? Number(e.target.value) : '')}
                                        className={`w-full bg-background border rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none ${!isRateValid && rate !== '' ? 'border-error focus:border-error' : 'border-border focus:border-primary'}`} 
                                    />
                                </div>
                                {!isRateValid && rate !== '' && <p className="text-error text-xs mt-1">Minimum Rs. 200</p>}
                            </div>
                            
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-col justify-center">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-text-muted">Platform Fee ({commissionPercent}%)</span>
                                    <span className="text-error font-medium">-₹{calculatedCommission}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-bold text-sm">Net Earnings</span>
                                    <span className="text-success font-bold">₹{netEarnings}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || (creationType === 'assign' && !selectedAthlete) || (!isRateValid && creationType !== 'open')}
                        className="btn-primary w-full shadow-glow disabled:opacity-50 mt-6 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (creationType === 'open' ? 'Create Ad-Hoc Slot' : 'Confirm Scheduling')}
                    </button>
                </form>
            </div>
        </div>
    );
}
