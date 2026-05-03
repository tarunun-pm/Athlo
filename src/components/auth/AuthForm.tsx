'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'signin' | 'signup';
type AuthMethod = 'phone' | 'email';

interface AuthFormProps {
    mode: AuthMode;
}

export default function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role'); // 'physio' | null

    const [method, setMethod] = useState<AuthMethod>('phone');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFormValid = method === 'phone'
        ? phone.length === 10
        : email.includes('@') && password.length >= 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        setError(null);

        try {
            if (method === 'email') {
                if (mode === 'signup') {
                    const { error } = await supabase.auth.signUp({
                        email,
                        password,
                    });
                    if (error) throw error;
                    // Store intended role so user-type page can auto-select it
                    if (roleParam) sessionStorage.setItem('athlos-intended-role', roleParam);
                    router.push('/onboarding/tc');
                } else {
                    const { error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });
                    if (error) throw error;
                    // Middleware will redirect based on user's saved role
                    router.push('/onboarding/user-type');
                }
            } else {
                // Phone Auth (Mocking standard OTP send for now)
                const { error } = await supabase.auth.signInWithOtp({
                    phone: `+91${phone}`,
                });
                if (error) throw error;
                // Store intended role for OTP flow too
                if (roleParam) sessionStorage.setItem('athlos-intended-role', roleParam);
                // Proceed to OTP verification screen
                router.push(`/auth/verify?phone=${phone}${roleParam ? `&role=${roleParam}` : ''}`);
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[440px] mx-auto">
            {/* Container */}
            <div className="glass-card p-8 flex flex-col items-center">

                {/* Header */}
                <h1 className="text-3xl font-syne font-extrabold text-accent mb-1 tracking-tight">
                    Athlos
                </h1>
                <p className="text-text-muted font-sans text-sm mb-1">
                    {mode === 'signup'
                        ? (roleParam === 'physio' ? 'Create your physio profile' : 'Join as an athlete')
                        : 'Welcome back'}
                </p>
                {roleParam === 'physio' && mode === 'signup' && (
                    <span className="inline-block mb-6 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                        Joining as Physio
                    </span>
                )}
                {!(roleParam === 'physio' && mode === 'signup') && <div className="mb-8" />}

                {/* Tab Switcher */}
                <div className="flex bg-[#11141A] p-1 rounded-full w-full mb-8 border border-border">
                    <button
                        type="button"
                        onClick={() => setMethod('phone')}
                        className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${method === 'phone'
                            ? 'bg-primary text-white shadow-glow'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        Phone
                    </button>
                    <button
                        type="button"
                        onClick={() => setMethod('email')}
                        className={`flex-1 py-2 text-sm font-medium rounded-full transition-all ${method === 'email'
                            ? 'bg-primary text-white shadow-glow'
                            : 'text-text-muted hover:text-text-primary'
                            }`}
                    >
                        Email
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="w-full bg-error/10 border border-error/50 text-error text-sm p-3 rounded-lg mb-4 text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-4">

                    {method === 'phone' ? (
                        <div className="relative flex items-center">
                            <span className="absolute left-4 text-text-muted font-mono select-none">+91</span>
                            <input
                                type="tel"
                                maxLength={10}
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                placeholder="00000 00000"
                                className="input-field pl-12 font-mono tracking-wider"
                            />
                        </div>
                    ) : (
                        <>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="input-field"
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="input-field pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {method === 'phone' ? 'Send OTP' : 'Continue'}
                                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                            </>
                        )}
                    </button>
                </form>

            </div>

            {/* Footer Link */}
            <div className="mt-8 text-center text-sm text-text-muted">
                {mode === 'signup' ? (
                    <>
                        Already have an account?{' '}
                        <Link href="/auth/signin" className="text-primary hover:text-primary-light font-medium transition-colors">
                            Sign in →
                        </Link>
                    </>
                ) : (
                    <>
                        Don't have an account?{' '}
                        <Link href="/auth/signup" className="text-primary hover:text-primary-light font-medium transition-colors">
                            Sign up →
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
