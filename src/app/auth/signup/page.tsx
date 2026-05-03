import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-text-muted text-sm">Loading...</div>}>
                <AuthForm mode="signup" />
            </Suspense>
        </div>
    );
}
