'use client';

import { useState } from 'react';
import { CalendarDays, Loader2, AlertTriangle } from 'lucide-react';
import { checkRecurringSeries, createRecurringSeries, Conflict } from '@/lib/recurring';

export default function RecurringSeriesModal({ 
    physioId, 
    athleteId,
    parentSessionId,
    consultationMode,
    baseRate,
    onClose 
}: { 
    physioId: string, 
    athleteId: string,
    parentSessionId: string,
    consultationMode: string,
    baseRate: number,
    onClose: () => void 
}) {
    const [step, setStep] = useState<1 | 2>(1);
    const [weeks, setWeeks] = useState(4);
    const [startDate, setStartDate] = useState('');
    const [time, setTime] = useState('10:00');
    
    const [isChecking, setIsChecking] = useState(false);
    const [conflicts, setConflicts] = useState<Conflict[]>([]);
    const [validSlots, setValidSlots] = useState<any[]>([]);

    const handleCheck = async () => {
        setIsChecking(true);
        try {
            // Day of week mapping logic omitted for brevity
            const res = await checkRecurringSeries(physioId, time, 0, weeks, startDate);
            setConflicts(res.conflicts);
            setValidSlots(res.validSlots);
            setStep(2);
        } catch (err) {
            console.error(err);
        } finally {
            setIsChecking(false);
        }
    };

    const handleConfirm = async () => {
        setIsChecking(true);
        try {
            await createRecurringSeries(physioId, athleteId, validSlots.map(s => s.id), parentSessionId, baseRate, consultationMode);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="card w-full max-w-lg p-8 bg-surface border-border shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-white"
                >
                    &times;
                </button>

                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6">
                    <CalendarDays size={24} />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Create Recurring Series</h3>
                
                {step === 1 ? (
                    <>
                        <p className="text-sm text-text-secondary mb-6">Schedule identical weekly sessions. We'll automatically check for conflicts.</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-bold text-white mb-1.5">Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-white mb-1.5">Weekly Time</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white" />
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-white mb-1.5">Duration</label>
                            <select value={weeks} onChange={e => setWeeks(Number(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white appearance-none">
                                <option value={4}>4 Weeks</option>
                                <option value={8}>8 Weeks</option>
                            </select>
                        </div>
                        
                        <button onClick={handleCheck} disabled={!startDate || isChecking} className="btn-primary w-full group shadow-glow">
                            {isChecking ? <Loader2 className="animate-spin mx-auto" /> : 'Check Availability'}
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-text-secondary mb-6">Series review. The following slots were checked:</p>
                        
                        <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2">
                            {validSlots.map((s, i) => (
                                <div key={i} className="flex justify-between items-center bg-success/10 border border-success/30 p-3 rounded-xl text-sm">
                                    <span className="text-white">{s.slot_date} at {s.start_time.substring(0,5)}</span>
                                    <span className="text-success font-medium">Available</span>
                                </div>
                            ))}
                            {conflicts.map((c, i) => (
                                <div key={i} className="flex justify-between items-center bg-error/10 border border-error/30 p-3 rounded-xl text-sm">
                                    <span className="text-white">{c.date}</span>
                                    <span className="text-error font-medium flex items-center gap-1"><AlertTriangle size={14}/> {c.reason === 'no_slot' ? 'Outside Template' : 'Booked/Blocked'}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                            <button onClick={handleConfirm} disabled={validSlots.length === 0 || isChecking} className="btn-primary flex-1 shadow-glow">
                                {isChecking ? <Loader2 className="animate-spin mx-auto" /> : `Schedule ${validSlots.length} slot${validSlots.length === 1 ? '' : 's'}`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
