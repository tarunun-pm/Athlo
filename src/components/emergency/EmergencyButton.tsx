'use client';

import Link from 'next/link';
import { Siren } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function EmergencyButton() {
    const pathname = usePathname();
    
    // Don't show the button if we're already in the emergency flow
    if (pathname.startsWith('/athlete/emergency')) return null;

    return (
        <Link 
            href="/athlete/emergency"
            className="group flex items-center justify-center gap-2 bg-error hover:bg-error/90 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all"
        >
            <Siren size={18} className="group-hover:animate-pulse" />
            <span className="hidden sm:inline">Emergency Physio</span>
            <span className="sm:hidden">Emergency</span>
        </Link>
    );
}
