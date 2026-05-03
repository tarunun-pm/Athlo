'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Siren, MapPin, Loader2, ArrowLeft, TriangleAlert } from 'lucide-react';
import { submitEmergencyRequest, UrgencyLevel } from '@/lib/emergency';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function EmergencyRequestPage() {
    const router = useRouter();
    const [bodyPart, setBodyPart] = useState('');
    const [urgency, setUrgency] = useState<UrgencyLevel>('moderate');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication required");

            const request = await submitEmergencyRequest(user.id, bodyPart, urgency, description);
            
            // Redirect to the live tracking page
            router.push(`/athlete/emergency/status/${request.id}`);

        } catch (err: any) {
            setError(err.message || 'Failed to submit request. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-24 h-full flex flex-col pt-4">
            
            <Link href="/athlete/dashboard" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors mb-6 w-max">
                <ArrowLeft size={16} /> Cancel Request
            </Link>

            <div className="card p-8 bg-gradient-to-br from-error/10 to-surface border-error/20 shadow-[0_8px_30px_rgba(239,68,68,0.15)] mb-8">
                <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center text-error mb-6 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                    <Siren size={32} />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">Require immediate physio assistance?</h1>
                <p className="text-text-secondary leading-relaxed mb-6">
                    Our emergency system will ping all available, verified sports physiotherapists within a 10km radius who have immediate openings. They have 10 minutes to accept.
                </p>
                <div className="flex flex-col gap-2 p-4 rounded-xl border border-warning/30 bg-warning/5 mt-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-warning">
                        <TriangleAlert size={16} /> Emergency Pricing Structure
                    </div>
                    <div className="text-sm text-text-secondary">
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                            <li>You will be charged the matched specialist&apos;s standard base rate.</li>
                            <li>A <strong className="text-white">₹500 emergency surcharge</strong> will be added to the base rate.</li>
                            <li>The total session cost will never exceed <strong className="text-white">₹2,500</strong>. If the sum exceeds this, the surcharge is reduced or waived.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-error/10 text-error p-4 rounded-xl border border-error/30 mb-6 font-medium">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-white mb-2">Injured Body Part</label>
                    <input 
                        type="text" 
                        required 
                        value={bodyPart}
                        onChange={e => setBodyPart(e.target.value)}
                        placeholder="e.g. Right Knee, Lower Back, Left Shoulder..." 
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-white focus:border-error focus:outline-none" 
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-white mb-2">Urgency Level</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button type="button" onClick={() => setUrgency('critical')} className={`p-4 rounded-xl border text-center transition-all ${urgency === 'critical' ? 'bg-error text-white border-error shadow-glow' : 'bg-surface border-border text-text-secondary hover:border-error/50'}`}>
                            <div className="font-bold mb-1">Critical</div>
                            <div className="text-[10px] opacity-80 uppercase tracking-widest">Pain &gt; 8/10</div>
                        </button>
                        <button type="button" onClick={() => setUrgency('moderate')} className={`p-4 rounded-xl border text-center transition-all ${urgency === 'moderate' ? 'bg-warning text-white border-warning shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-surface border-border text-text-secondary hover:border-warning/50'}`}>
                            <div className="font-bold mb-1">Moderate</div>
                            <div className="text-[10px] opacity-80 uppercase tracking-widest">Pain 5-7/10</div>
                        </button>
                        <button type="button" onClick={() => setUrgency('can_wait')} className={`p-4 rounded-xl border text-center transition-all ${urgency === 'can_wait' ? 'bg-success text-white border-success shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-surface border-border text-text-secondary hover:border-success/50'}`}>
                            <div className="font-bold mb-1">Can Wait</div>
                            <div className="text-[10px] opacity-80 uppercase tracking-widest">Pain &lt; 5/10</div>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-white mb-2">What happened? <span className="text-text-muted font-normal text-xs ml-2">(Optional)</span></label>
                    <textarea 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Briefly describe the mechanism of injury or symptoms..." 
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-white focus:border-error focus:outline-none min-h-[120px] resize-none" 
                    />
                </div>

                <div className="card p-4 bg-surface border-border flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-text-muted shrink-0">
                        <MapPin size={18} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">Using Current Location</div>
                        <div className="text-xs text-text-secondary">Will match with specialists within a 10km radius</div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting || !bodyPart}
                    className="w-full bg-error hover:bg-error/90 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <><Siren size={20}/> Find Emergency Physio Now</>}
                </button>
            </form>
        </div>
    );
}
