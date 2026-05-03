'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, ShieldCheck, CheckCircle2, Loader2, FileText, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createNotification } from '@/lib/notifications';

type TimeSlot = {
    id: string;
    slot_date: string;
    start_time: string;
    end_time: string;
};

export default function BookingClient({ physio, availableSlots }: { physio: any, availableSlots: TimeSlot[] }) {
    const router = useRouter();
    const supabase = createClient();

    // Group available slots by date
    const slotsByDate = availableSlots.reduce((acc, slot) => {
        if (!acc[slot.slot_date]) acc[slot.slot_date] = [];
        acc[slot.slot_date].push(slot);
        return acc;
    }, {} as Record<string, TimeSlot[]>);

    const availableDates = Object.keys(slotsByDate).sort();

    const [selectedDate, setSelectedDate] = useState<string | null>(availableDates[0] || null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [selectedMode, setSelectedMode] = useState<string>(physio.consultation_modes?.[0] || '');
    const [injuryDesc, setInjuryDesc] = useState('');

    const [showConsent, setShowConsent] = useState(false);
    const [consentAgreed, setConsentAgreed] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleOpenConsent = () => {
        if (!selectedDate || !selectedSlot || !selectedMode) {
            setError('Please select a date, time, and consultation mode.');
            return;
        }
        setError(null);
        setShowConsent(true);
    };

    const handleConfirmBooking = async () => {
        if (!consentAgreed || !selectedSlot) return;
        setIsProcessing(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Insert Consent Log
            await supabase.from('consent_logs').insert({
                user_id: user.id,
                type: 'pre_session'
            });

            // 2. Call Atomic RPC
            const { data: rpcData, error: rpcError } = await supabase.rpc('book_slot_atomic', {
                p_slot_id: selectedSlot.id,
                p_athlete_id: user.id,
                p_mode: selectedMode,
                p_injury: injuryDesc || null
            });

            if (rpcError) throw rpcError;

            // RPC returns JSON object: {success: boolean, error?: string, session_id?: UUID}
            if (!rpcData.success) {
                // E.g., The slot was just taken
                throw new Error(rpcData.error || "Failed to book this slot.");
            }

            // Notify the physio
            const { data: athleteProfile } = await supabase
                .from('athlete_profiles')
                .select('first_name, last_name')
                .eq('id', user.id)
                .single();

            await createNotification(supabase, {
                userId: physio.id,
                type: 'booking_new',
                title: 'New Session Booked',
                message: `${athleteProfile?.first_name || 'An athlete'} ${athleteProfile?.last_name || ''} booked a ${selectedMode} session for ${format(parseISO(selectedSlot.slot_date), 'MMM dd')}.`,
                link: '/physio/sessions',
            });

            router.push('/athlete/dashboard?booking=success');

        } catch (err: any) {
            setError(err.message || "Booking failed. Please try again.");
            setIsProcessing(false);
            setShowConsent(false);
            
            // If the slot was taken, deselect it so they must pick another
            setSelectedSlot(null);
        }
    };

    const currentDaySlots = selectedDate ? slotsByDate[selectedDate] : [];

    return (
        <div className="max-w-6xl mx-auto pb-24">

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Book Session</h1>
                <p className="text-text-secondary">Schedule your recovery session with Dr. {physio.last_name}</p>
            </div>

            {error && (
                <div className="bg-error/10 text-error p-4 rounded-[14px] border border-error/50 mb-8 flex items-center gap-3">
                    <AlertTriangle size={20} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Setup */}
                <div className="lg:col-span-2 space-y-6">

                    <div className="card p-6 md:p-8">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Calendar className="text-primary" size={20} /> Select Date
                        </h2>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            {availableDates.length === 0 ? (
                                <p className="text-text-muted text-sm">No availability slots set by this physio.</p>
                            ) : (
                                availableDates.map(dateStr => {
                                    const d = parseISO(dateStr);
                                    const isSelected = selectedDate === dateStr;
                                    return (
                                        <button
                                            key={dateStr}
                                            onClick={() => {
                                                setSelectedDate(dateStr);
                                                setSelectedSlot(null); // Reset time when date changes
                                            }}
                                            className={`min-w-[80px] shrink-0 p-4 rounded-[16px] border transition-all text-center ${isSelected
                                                    ? 'bg-primary border-primary text-white shadow-glow'
                                                    : 'bg-surface border-border hover:border-text-muted text-text-primary'
                                                }`}
                                        >
                                            <div className={`text-xs font-bold uppercase mb-1 ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                                                {format(d, 'MMM')}
                                            </div>
                                            <div className="text-2xl font-syne font-bold">{format(d, 'dd')}</div>
                                            <div className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-text-secondary'}`}>
                                                {format(d, 'EEE')}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className={`card p-6 md:p-8 transition-opacity ${!selectedDate ? 'opacity-50 pointer-events-none' : ''}`}>
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Clock className="text-primary" size={20} /> Select Time
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {currentDaySlots?.map(slot => {
                                const startStr = slot.start_time.substring(0, 5);
                                // Simple 12-hour format logic for substring
                                const hour = parseInt(startStr.split(':')[0]);
                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                const hour12 = hour % 12 || 12;
                                const timeLabel = `${hour12}:00 ${ampm}`;

                                return (
                                    <button
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-3 rounded-xl border transition-all text-center font-medium ${selectedSlot?.id === slot.id
                                                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(37,99,235,0.2)]'
                                                : 'bg-background border-border hover:border-primary/50 text-text-secondary'
                                            }`}
                                    >
                                        {timeLabel}
                                    </button>
                                );
                            })}
                            {!currentDaySlots?.length && selectedDate && (
                                <p className="text-sm text-text-muted col-span-3">No times available on this date.</p>
                            )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="card p-6 md:p-8">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <ShieldCheck className="text-primary" size={20} /> Consultation Mode
                            </h2>
                            <div className="flex flex-col gap-3">
                                {physio.consultation_modes?.map((m: string) => (
                                    <label key={m} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${selectedMode === m ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-text-muted'}`}>
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedMode === m ? 'border-primary' : 'border-text-muted'}`}>
                                            {selectedMode === m && <div className="w-2 h-2 rounded-full bg-primary" />}
                                        </div>
                                        <input type="radio" className="hidden" checked={selectedMode === m} onChange={() => setSelectedMode(m)} />
                                        <span className="text-sm font-medium text-white">{m}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="card p-6 md:p-8 flex flex-col">
                            <h2 className="text-lg font-bold text-white mb-4">Injury Description <span className="text-text-muted text-sm font-normal">(Optional)</span></h2>
                            <textarea 
                                value={injuryDesc}
                                onChange={(e) => setInjuryDesc(e.target.value)}
                                placeholder="Briefly describe why you are booking this session..."
                                className="w-full bg-background border border-border rounded-xl p-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary resize-none flex-1 min-h-[120px]"
                            />
                        </div>
                    </div>

                </div>

                {/* Right Col: Summary */}
                <div className="lg:col-span-1">
                    <div className="card p-6 sticky top-24 border-transparent bg-gradient-to-br from-[#1C1F26] to-[#121417] shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                        <h2 className="text-lg font-bold text-white mb-4">Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Physiotherapist</span>
                                <span className="text-white font-medium text-right">Dr. {physio.last_name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Date</span>
                                <span className="text-white font-medium text-right">{selectedDate ? format(parseISO(selectedDate), 'MMM dd, yyyy') : '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Time</span>
                                <span className="text-white font-medium text-right">
                                    {selectedSlot ? `${parseInt(selectedSlot.start_time.split(':')[0]) % 12 || 12}:00 ${parseInt(selectedSlot.start_time.split(':')[0]) >= 12 ? 'PM' : 'AM'}` : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Mode</span>
                                <span className="text-white font-medium text-right">{selectedMode || '—'}</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border mb-6 flex justify-between items-end">
                            <span className="text-white font-bold">Total</span>
                            <span className="text-2xl font-syne font-bold text-primary">₹{physio.consultation_rate}</span>
                        </div>

                        <button
                            onClick={handleOpenConsent}
                            disabled={!selectedDate || !selectedSlot || !selectedMode}
                            className="btn-primary w-full flex items-center justify-center gap-2 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle2 size={18} /> Confirm Booking
                        </button>
                    </div>
                </div>

            </div>

            {/* Consent Modal Overlay */}
            {showConsent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="card w-full max-w-md p-8 bg-surface border-border shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowConsent(false)}
                            className="absolute top-4 right-4 text-text-muted hover:text-white"
                        >
                            &times;
                        </button>

                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6">
                            <FileText size={24} />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Medical Consent</h3>
                        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                            By proceeding, you agree that you are seeking sports rehabilitation consultation.
                            Dr. {physio.last_name} is verified on Athlo, but active physical participation during sessions
                            is at your own risk.
                        </p>

                        <label className="flex items-start gap-3 p-4 rounded-[14px] border border-border bg-background cursor-pointer mb-6 group">
                            <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${consentAgreed ? 'bg-primary border-primary' : 'border-text-muted group-hover:border-primary'}`}>
                                {consentAgreed && <CheckCircle2 size={14} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={consentAgreed} onChange={(e) => setConsentAgreed(e.target.checked)} />
                            <span className="text-sm text-white font-medium select-none">I have read and agree to the waiver terms.</span>
                        </label>

                        <button
                            onClick={handleConfirmBooking}
                            disabled={!consentAgreed || isProcessing}
                            className="btn-primary w-full shadow-glow disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="animate-spin mx-auto" size={20} /> : `Confirm Booking`}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
