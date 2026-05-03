import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-text-muted text-sm">Loading...</div>}>
                <AuthForm mode="signin" />
            </Suspense>
        </div>
    );
}
