'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Stethoscope, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type RoleType = 'physio' | 'athlete';

export default function UserTypeSelection() {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState<RoleType | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSelectRole = async (role: RoleType) => {
        setIsLoading(role);
        setError(null);

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();
            if (authError || !user) throw new Error('Not authenticated');

            const { error: updateError } = await supabase
                .from('users')
                .update({ role })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Clear the intended role from sessionStorage
            sessionStorage.removeItem('athlos-intended-role');

            if (role === 'physio') {
                router.push('/onboarding/physio/step-1');
            } else {
                router.push('/onboarding/athlete');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to set user type. Please try again.');
            setIsLoading(null);
        }
    };

    // Auto-select role if navigated from a role-specific CTA on the landing page
    useEffect(() => {
        const intended = sessionStorage.getItem('athlos-intended-role') as RoleType | null;
        if (intended === 'physio' || intended === 'athlete') {
            handleSelectRole(intended);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-[500px] mx-auto text-center">

                <h1 className="text-[28px] font-syne font-bold text-text-primary mb-8 px-4">
                    What are you here for?
                </h1>

                {error && (
                    <div className="bg-error/10 border border-error/50 text-error text-sm p-3 rounded-lg mb-6 mx-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4 px-4">

                    <button
                        onClick={() => handleSelectRole('physio')}
                        disabled={isLoading !== null}
                        className={`w-full text-left p-6 rounded-[20px] border transition-all ${isLoading === 'physio'
                            ? 'border-primary bg-primary/10'
                            : 'bg-surface border-border hover:border-primary/50 hover:shadow-glow'
                            } flex items-center gap-6 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            {isLoading === 'physio' ? (
                                <Loader2 className="animate-spin" size={28} />
                            ) : (
                                <Stethoscope size={28} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-syne font-bold text-text-primary mb-1">Sports Physiotherapist</h2>
                            <p className="text-sm font-sans text-text-muted">Join as a verified sports physio</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleSelectRole('athlete')}
                        disabled={isLoading !== null}
                        className={`w-full text-left p-6 rounded-[20px] border transition-all ${isLoading === 'athlete'
                            ? 'border-primary bg-primary/10'
                            : 'bg-surface border-border hover:border-primary/50 hover:shadow-glow'
                            } flex items-center gap-6 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                            {isLoading === 'athlete' ? (
                                <Loader2 className="animate-spin" size={28} />
                            ) : (
                                <Activity size={28} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-syne font-bold text-text-primary mb-1">Athlete</h2>
                            <p className="text-sm font-sans text-text-muted">Find a physio and recover faster</p>
                        </div>
                    </button>

                </div>

                <div className="mt-8 text-sm text-text-muted font-sans">
                    Already have an account?{' '}
                    <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                        Log In
                    </Link>
                </div>
            </div>
        </div>
    );
}
