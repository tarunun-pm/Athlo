'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Activity, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

export default function RecoveryListClient({ cases }: { cases: any[] }) {
    return (
        <div className="space-y-4">
            {cases.length === 0 ? (
                <div className="card p-12 text-center border-dashed border-border bg-transparent">
                    <Activity size={32} className="mx-auto text-text-muted mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">No recovery tracking yet</h3>
                    <p className="text-text-secondary max-w-sm mx-auto">
                        Once a physio creates a clinical case file for your sessions, you'll be able to track the full timeline here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cases.map((c: any) => (
                        <Link 
                            key={c.id} 
                            href={`/athlete/recovery/${c.id}`}
                            className="card p-6 border-border hover:border-primary/50 transition-colors group relative overflow-hidden flex flex-col justify-between"
                        >
                            <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${c.status === 'active' ? 'bg-primary group-hover:bg-primary/80' : 'bg-success/50'}`} />
                            
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{c.injury_type}</h3>
                                        <p className="text-sm text-text-secondary font-medium">{c.body_part}</p>
                                    </div>
                                    <span className={`pill text-xs px-2 py-0.5 ${c.status === 'active' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-success/20 text-success border-success/30'}`}>
                                        {c.status}
                                    </span>
                                </div>
                                <div className="text-sm font-medium text-text-secondary mb-6 flex gap-3">
                                    <span>Dr. {c.physio_profiles?.last_name}</span>
                                    <span className="text-border">•</span>
                                    <span>Since {format(new Date(c.created_at), 'MMM yyyy')}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/50 flex justify-between items-center text-sm font-medium text-text-secondary group-hover:text-primary transition-colors">
                                View Full Timeline <ChevronRight size={16} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
