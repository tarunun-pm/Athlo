'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function PhysioSuccess() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-[440px] text-center p-8 glass-card">

                <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center text-success mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={40} />
                </div>

                <h1 className="text-3xl font-syne font-bold text-text-primary mb-3">
                    Profile Submitted!
                </h1>

                <p className="text-text-secondary text-sm leading-relaxed mb-8">
                    Our team is manually verifying your credentials to ensure platform quality. This usually takes within 48 working hours.
                </p>

                <Link href="/physio/dashboard" className="btn-primary w-full shadow-glow">
                    Go to Dashboard
                </Link>

            </div>
        </div>
    );
}
