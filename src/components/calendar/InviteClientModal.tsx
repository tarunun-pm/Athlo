'use client';

import { useState } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { sendClientInvite } from '@/lib/invites';
import { createClient } from '@/lib/supabase/client';

export default function InviteClientModal({ 
    physioId, 
    onClose, 
    availableSlots 
}: { 
    physioId: string, 
    onClose: () => void,
    availableSlots: any[]
}) {
    const [email, setEmail] = useState('');
    const [selectedSlotId, setSelectedSlotId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!email.includes('@')) throw new Error("Please enter a valid email address");
            if (!selectedSlotId) throw new Error("Please select a time slot to reserve");

            await sendClientInvite(physioId, email, selectedSlotId);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="card w-full max-w-md p-8 bg-surface border-border shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-muted hover:text-white"
                >
                    &times;
                </button>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Invite Sent</h3>
                        <p className="text-text-secondary">An onboarding link has been sent to {email}. The slot is reserved for 7 days.</p>
                    </div>
                ) : (
                    <>
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-6">
                            <Mail size={24} />
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Invite Private Client</h3>
                        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                            Bring your existing offline clients to Athlo. They receive a discounted 5% platform fee and bypass the search process.
                        </p>

                        <form onSubmit={handleSend} className="space-y-4">
                            {error && (
                                <div className="text-sm text-error bg-error/10 p-3 rounded-lg border border-error/20">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-white mb-1.5">Client Email</label>
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="client@example.com"
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-white mb-1.5">Reserve Slot (Optional but Recommended)</label>
                                <select 
                                    required
                                    value={selectedSlotId}
                                    onChange={e => setSelectedSlotId(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none appearance-none"
                                >
                                    <option value="" disabled>Select an available slot...</option>
                                    {availableSlots.map(slot => (
                                        <option key={slot.id} value={slot.id}>
                                            {slot.slot_date} at {slot.start_time.substring(0,5)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !email || !selectedSlotId}
                                className="btn-primary w-full shadow-glow disabled:opacity-50 mt-4"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : `Send Invite`}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
