'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, getDay } from 'date-fns';
import { Calendar, Clock, CreditCard, ShieldCheck, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createNotification } from '@/lib/notifications';

export default function BookingClient({ physio, availableSlots }: { physio: any, availableSlots: any[] }) {
    const router = useRouter();
    const supabase = createClient();

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState<string>(physio.consultation_modes?.[0] || '');

    const [showConsent, setShowConsent] = useState(false);
    const [consentAgreed, setConsentAgreed] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate next 14 days
    const upcomingDays = Array.from({ length: 14 }).map((_, i) => addDays(new Date(), i + 1));

    // Filter days that the physio actually works based on availability_slots
    // Note: day_of_week is 0-6 (Mon-Sun in UI, but Date.getDay() gives 0=Sun, 1=Mon...6=Sat)
    // Let's assume UI mapping was 0=Mon, 6=Sun. 
    // Map Date.getDay() to our index: Mon=0, Tue=1... Sun=6
    const mapDateDay = (d: Date) => (d.getDay() === 0 ? 6 : d.getDay() - 1);

    const validDays = upcomingDays.filter(d =>
        availableSlots.some(s => s.day_of_week === mapDateDay(d))
    );

    const getBlocksForDate = (d: Date | null) => {
        if (!d) return [];
        const targetDayIndex = mapDateDay(d);
        return availableSlots.filter(s => s.day_of_week === targetDayIndex).map(s => s.block);
    };

    const handleOpenConsent = () => {
        if (!selectedDate || !selectedBlock || !selectedMode) {
            setError('Please select a date, time, and consultation mode.');
            return;
        }
        setError(null);
        setShowConsent(true);
    };

    const handleConfirmBooking = async () => {
        if (!consentAgreed) return;
        setIsProcessing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Insert Consent Log
            await supabase.from('consent_logs').insert({
                user_id: user.id,
                type: 'pre_session'
            });

            // Simulate slight delay for better UX
            await new Promise(res => setTimeout(res, 800));

            // 2. Create Session
            const { error: sessionError } = await supabase.from('sessions').insert({
                physio_id: physio.id,
                athlete_id: user.id,
                scheduled_at: selectedDate?.toISOString(),
                status: 'upcoming',
                amount: physio.consultation_rate,
                consultation_mode: selectedMode
            });

            if (sessionError) throw sessionError;

            // Notify the physio about the new booking
            const { data: athleteProfile } = await supabase
                .from('athlete_profiles')
                .select('first_name, last_name')
                .eq('id', user.id)
                .single();

            await createNotification(supabase, {
                userId: physio.id,
                type: 'booking_new',
                title: 'New Session Booked',
                message: `${athleteProfile?.first_name || 'An athlete'} ${athleteProfile?.last_name || ''} booked a ${selectedMode} session on ${selectedDate ? format(selectedDate, 'MMM dd') : 'upcoming date'}.`,
                link: '/physio/sessions',
            });

            router.push('/athlete/dashboard?booking=success');

        } catch (err: any) {
            setError(err.message || "Booking failed. Please try again.");
            setIsProcessing(false);
            setShowConsent(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-24">

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Book Session</h1>
                <p className="text-text-secondary">Schedule your recovery session with Dr. {physio.last_name}</p>
            </div>

            {error && (
                <div className="bg-error/10 text-error p-4 rounded-[14px] border border-error/50 mb-8">
                    {error}
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
                            {validDays.length === 0 ? (
                                <p className="text-text-muted text-sm">No availability slots set by this physio.</p>
                            ) : (
                                validDays.map(d => {
                                    const isSelected = selectedDate?.toDateString() === d.toDateString();
                                    return (
                                        <button
                                            key={d.toISOString()}
                                            onClick={() => {
                                                setSelectedDate(d);
                                                setSelectedBlock(null);
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
                            <Clock className="text-primary" size={20} /> Select Time Block
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {getBlocksForDate(selectedDate).map(block => (
                                <button
                                    key={block}
                                    onClick={() => setSelectedBlock(block)}
                                    className={`p-4 rounded-[14px] border transition-all text-left ${selectedBlock === block
                                            ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(0,102,255,0.4)]'
                                            : 'bg-background border-border hover:border-primary/50 text-text-secondary'
                                        }`}
                                >
                                    <div className="font-bold text-white capitalize mb-1">{block}</div>
                                    <div className="text-xs opacity-80">
                                        {block === 'morning' ? '6am - 12pm' : block === 'afternoon' ? '12pm - 5pm' : '5pm - 10pm'}
                                    </div>
                                </button>
                            ))}
                            {selectedDate && getBlocksForDate(selectedDate).length === 0 && (
                                <p className="text-sm text-text-muted col-span-3">No times available on this date.</p>
                            )}
                        </div>
                    </div>

                    <div className="card p-6 md:p-8">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <ShieldCheck className="text-primary" size={20} /> Consultation Mode
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {physio.consultation_modes?.map((m: string) => (
                                <button
                                    key={m}
                                    onClick={() => setSelectedMode(m)}
                                    className={`pill py-3 px-5 text-sm ${selectedMode === m ? 'bg-primary text-white border-primary shadow-glow' : 'bg-background hover:border-text-muted'}`}
                                >
                                    {m}
                                </button>
                            ))}
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
                                <span className="text-white font-medium text-right">{selectedDate ? format(selectedDate, 'MMM dd, yyyy') : '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Time</span>
                                <span className="text-white font-medium text-right capitalize">{selectedBlock || '—'}</span>
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
                            disabled={!selectedDate || !selectedBlock || !selectedMode}
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
