'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, User } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import EmergencyButton from '@/components/emergency/EmergencyButton';

export default function AthleteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navLinks = [
        { href: '/athlete/dashboard', label: 'Feed' },
        { href: '/athlete/search', label: 'Search' },
        { href: '/athlete/sessions', label: 'Sessions' },
        { href: '/athlete/recovery', label: 'Recovery' },
    ];

    return (
        <div className="min-h-screen bg-background text-text-primary overflow-hidden flex flex-col relative">

            <header className="h-20 flex items-center justify-between px-8 border-b border-border/50 shrink-0">

                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                            <span className="font-syne font-bold text-white text-lg leading-none">*</span>
                        </div>
                        <span className="font-syne font-bold text-xl tracking-tight">Athlo</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-1 bg-surface p-1.5 rounded-full border border-border">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${isActive
                                            ? 'bg-primary text-white shadow-glow'
                                            : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-4">
                        <EmergencyButton />
                        <div className="w-px h-6 bg-border/50 mx-2 hidden sm:block"></div>
                        <NotificationBell />
                        <Link href="/athlete/profile?tab=settings" className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface hover:text-text-primary transition-colors">
                            <Settings size={20} />
                        </Link>
                        <Link href="/athlete/profile" className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                            <User size={20} className="text-text-secondary" />
                        </Link>
                    </div>

                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
        </div>
    );
}
