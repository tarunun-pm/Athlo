'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function TermsAndConditions() {
    const router = useRouter();
    const supabase = createClient();

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [agreedToAge, setAgreedToAge] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFormValid = agreedToTerms && agreedToAge;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        setError(null);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error('Not authenticated');

            // Fetch IP address details from a public API or Next.js headers (since this is client-side, we can mock it here or get basic info)
            // Since `ip` is requested in schema, we will try to get it, or leave it empty here to handle server-side if needed. 
            // A quick client-side fetch:
            const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => ({ json: () => ({ ip: 'unknown' }) }));
            const ipData = await (ipRes as any).json();

            // 1. Ensure the user exists in public.users (UPSERT)
            // This is a safety fallback for the database trigger
            const { error: upsertError } = await supabase.from('users').upsert({
                id: user.id,
                email: user.email,
                phone: user.phone_confirmed_at ? user.phone : null,
            });

            if (upsertError) throw upsertError;

            // 2. Insert the consent log
            const { error: dbError } = await supabase.from('consent_logs').insert({
                user_id: user.id,
                type: 'tc',
                ip: ipData.ip || 'unknown'
            });

            if (dbError) throw dbError;

            // 3. Mark T&C as accepted on the user record
            const { error: updateUserError } = await supabase.from('users').update({
                tc_accepted_at: new Date().toISOString(),
                tc_ip: ipData.ip || 'unknown'
            }).eq('id', user.id);

            if (updateUserError) throw updateUserError;

            router.push('/onboarding/user-type');
        } catch (err: any) {
            setError(err.message || 'Failed to accept terms. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-[440px] mx-auto glass-card p-8">
                <h1 className="text-[24px] font-syne font-bold text-text-primary mb-6">
                    Before you continue
                </h1>

                {error && (
                    <div className="bg-error/10 border border-error/50 text-error text-sm p-3 rounded-lg mb-6 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative flex items-start pt-0.5">
                            <input
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="w-5 h-5 rounded border-2 border-border-strong bg-background transition-all peer-checked:bg-primary peer-checked:border-primary peer-focus:ring-2 peer-focus:ring-primary/30 flex items-center justify-center group-hover:border-primary/50">
                                {agreedToTerms && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className="text-text-secondary text-sm leading-relaxed group-hover:text-text-primary transition-colors">
                            I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                        </span>
                    </label>

                    <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative flex items-start pt-0.5">
                            <input
                                type="checkbox"
                                checked={agreedToAge}
                                onChange={(e) => setAgreedToAge(e.target.checked)}
                                className="peer sr-only"
                            />
                            <div className="w-5 h-5 rounded border-2 border-border-strong bg-background transition-all peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center peer-focus:ring-2 peer-focus:ring-primary/30 group-hover:border-primary/50">
                                {agreedToAge && (
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>
                        <span className="text-text-secondary text-sm leading-relaxed group-hover:text-text-primary transition-colors">
                            I am 18 or above, OR I have my parent or guardian's permission to use this platform and access health services.
                        </span>
                    </label>

                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                Continue
                                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
