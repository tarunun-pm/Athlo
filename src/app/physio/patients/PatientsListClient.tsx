'use client';

import Link from 'next/link';
import { User, Activity, ChevronRight } from 'lucide-react';

type Athlete = {
    id: string;
    first_name: string;
    last_name: string;
    primary_sport: string;
};

export default function PatientsListClient({ athletes }: { athletes: Athlete[] }) {
    return (
        <div className="space-y-4">
            {athletes.length === 0 ? (
                <div className="card p-12 text-center border-dashed border-border bg-transparent">
                    <User size={32} className="mx-auto text-text-muted mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No patients yet</h3>
                    <p className="text-text-secondary max-w-sm mx-auto">
                        Once you start having sessions with athletes, they will appear here in your patient roster.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {athletes.map(a => (
                        <Link 
                            key={a.id} 
                            href={`/physio/patients/${a.id}`}
                            className="card p-6 border-border hover:border-primary/50 transition-colors group relative overflow-hidden flex flex-col items-center text-center"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                            
                            <div className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center text-text-muted mb-4 group-hover:text-primary transition-colors">
                                <User size={32} />
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-1">{a.first_name} {a.last_name}</h3>
                            <p className="text-sm text-text-secondary flex items-center gap-1.5 justify-center mb-6">
                                <Activity size={14} className="text-primary" /> {a.primary_sport || 'Athlete'}
                            </p>
                            
                            <div className="mt-auto w-full pt-4 border-t border-border flex items-center justify-between text-sm font-medium text-text-secondary group-hover:text-primary transition-colors">
                                View Case Files <ChevronRight size={16} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
