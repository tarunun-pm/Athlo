'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { FileText, CheckCircle2, Circle, TrendingDown, Clock, Activity, ArrowLeft, ArrowUpRight } from 'lucide-react';
import CaseReportGenerator from '@/components/reports/CaseReportGenerator';

export default function RecoveryTimelineClient({ caseFile, plans, notes, progress, milestones }: any) {
    
    // Merge everything into a sorted timeline
    const timeline = [
        { type: 'assessment', date: new Date(caseFile.created_at), data: caseFile },
        ...plans.map((p:any) => ({ type: 'plan', date: new Date(p.started_at), data: p })),
        ...notes.map((n:any) => ({ type: 'note', date: new Date(n.created_at), data: n })),
        ...milestones.map((m:any) => ({ 
            type: m.status === 'completed' ? 'milestone-done' : (new Date(m.target_date) < new Date() && m.status !== 'completed' ? 'milestone-missed' : 'milestone-pending'), 
            date: m.status === 'completed' && m.completed_at ? new Date(m.completed_at) : new Date(m.target_date), 
            data: m 
        })),
        // we can include progress if it's not directly attached to notes, but currently they are mostly overlapping
    ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest first

    const physio = caseFile.physio_profiles;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-6">
                <div>
                    <Link href="/athlete/recovery" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors mb-4">
                        <ArrowLeft size={16} /> Back to Recovery Tracking
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">{caseFile.injury_type}</h1>
                        <span className={`pill text-xs ${caseFile.status === 'active' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-success/20 text-success border-success/30'}`}>
                            {caseFile.status}
                        </span>
                    </div>
                    <p className="text-text-secondary flex items-center gap-2 text-lg">
                        {caseFile.body_part} <span className="text-border">•</span> Dr. {physio.last_name}
                    </p>
                </div>
                <CaseReportGenerator
                    caseFile={caseFile}
                    treatmentPlans={plans}
                    sessionNotes={notes}
                    progressEntries={progress}
                    milestones={milestones}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                
                {/* Timeline Column */}
                <div className="lg:col-span-4 space-y-6">
                    <h2 className="text-xl font-bold text-white mb-6">Full Timeline</h2>
                    
                    <div className="relative border-l-2 border-border/50 pl-6 ml-4 space-y-12 py-4">
                        {timeline.map((item, idx) => {
                            
                            // 1. Assessment
                            if (item.type === 'assessment') {
                                return (
                                    <div key={`idx-${idx}`} className="relative">
                                        <div className="absolute w-4 h-4 bg-primary text-background flex items-center justify-center rounded-full -left-[35px] top-6 ring-4 ring-background"><Activity size={10} /></div>
                                        <div className="card p-6 border-primary/30 bg-primary/5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-white">Initial Assessment</h3>
                                                <span className="text-sm font-medium text-text-muted">{format(item.date, 'MMM dd, yyyy')}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mb-4 mt-4">
                                                <div className="text-sm"><span className="text-text-muted">Severity:</span> {item.data.severity}</div>
                                                <div className="text-sm"><span className="text-text-muted">Context:</span> {item.data.sport_context}</div>
                                            </div>
                                            <p className="text-sm text-text-secondary leading-relaxed border-t border-border/50 pt-4">{item.data.diagnosis_notes || 'No notes provided by physio.'}</p>
                                        </div>
                                    </div>
                                );
                            }
                            
                            // 2. Treatment Plan
                            if (item.type === 'plan') {
                                return (
                                    <div key={`idx-${idx}`} className="relative">
                                        <div className="absolute w-4 h-4 bg-purple-500 rounded-full -left-[35px] top-6 ring-4 ring-background text-background flex items-center justify-center"><FileText size={10} /></div>
                                        <div className="card p-6 border-purple-500/30 bg-purple-500/5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-white">Treatment Plan Added</h3>
                                                <span className="text-sm font-medium text-text-muted">{format(item.date, 'MMM dd, yyyy')}</span>
                                            </div>
                                            <h4 className="font-syne font-bold text-purple-400 mb-2">{item.data.title}</h4>
                                            <p className="text-sm text-text-secondary leading-relaxed mb-6">{item.data.description}</p>
                                            
                                            {/* Exercises List */}
                                            {item.data.exercises && item.data.exercises.length > 0 && (
                                                <div className="space-y-4">
                                                    <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Prescribed Routine</h5>
                                                    {item.data.exercises.map((ex: any, i: number) => {
                                                        const isRich = !!ex.item;
                                                        const name = isRich ? ex.item.name : ex.name;
                                                        
                                                        let prescText = `${ex.sets} × ${ex.reps}`;
                                                        if (isRich) {
                                                            const p = ex.prescription;
                                                            if (p.type === 'sets_reps') prescText = `${p.sets} sets × ${p.reps} reps`;
                                                            else if (p.type === 'duration') prescText = `${p.durationMinutes} mins`;
                                                            else if (p.type === 'hold_duration') prescText = `${p.holdSeconds}s hold × ${p.reps} reps`;
                                                            else if (p.type === 'cycles') prescText = `${p.cycles} cycles`;
                                                        }

                                                        return (
                                                            <div key={ex.id || i} className="bg-background border border-border rounded-xl p-4 flex flex-col gap-4">
                                                                <div className="flex justify-between items-start">
                                                                    <div>
                                                                        {isRich && <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded mb-1 inline-block">{ex.item.category}</span>}
                                                                        <div className="font-bold text-white text-lg">{name}</div>
                                                                        {isRich && (
                                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                                {ex.item.primaryMuscles?.slice(0, 2).map((m:string) => (
                                                                                    <span key={m} className="text-[10px] text-text-secondary capitalize">{m}{" "}</span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="bg-surface border border-border px-3 py-1.5 rounded-lg text-center shrink-0">
                                                                        <div className="font-syne font-bold text-white text-sm">{prescText}</div>
                                                                    </div>
                                                                </div>

                                                                {isRich && (ex.item.instructions?.length > 0 || ex.item.images?.length > 0) && (
                                                                    <details className="text-sm group border border-border/50 rounded-lg bg-surface/30">
                                                                        <summary className="cursor-pointer text-text-secondary hover:text-white transition-colors flex items-center justify-between font-medium select-none p-3 outline-none">
                                                                            <span className="flex items-center gap-2">
                                                                                <FileText size={16} className="text-primary" /> View Full Exercise Details
                                                                            </span>
                                                                            <svg className="w-4 h-4 transition-transform group-open:rotate-180 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                                        </summary>
                                                                        <div className="p-4 border-t border-border/50 space-y-6">
                                                                            {ex.item.images && ex.item.images.length > 0 && (
                                                                                <div className="grid grid-cols-2 gap-3">
                                                                                    {ex.item.images.slice(0, 2).map((img: string, idx: number) => (
                                                                                        <div key={idx} className="bg-white rounded-lg overflow-hidden aspect-square border border-border flex items-center justify-center p-2">
                                                                                            <img src={img} alt={`${name} step ${idx + 1}`} className="w-full h-full object-contain mix-blend-multiply" loading="lazy" />
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                            {ex.item.instructions?.length > 0 && (
                                                                                <div>
                                                                                    <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-3">Instructions</h5>
                                                                                    <ol className="list-decimal list-outside ml-4 space-y-2 text-text-secondary leading-relaxed">
                                                                                        {ex.item.instructions.map((inst: string, idx: number) => (
                                                                                            <li key={idx} className="pl-1">{inst}</li>
                                                                                        ))}
                                                                                    </ol>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </details>
                                                                )}

                                                                {isRich && ex.prescription.referenceLink && (
                                                                    <a href={ex.prescription.referenceLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1 self-start">
                                                                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                                                        Reference Guide
                                                                    </a>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            // 3. Notes
                            if (item.type === 'note') {
                                return (
                                    <div key={`idx-${idx}`} className="relative">
                                        <div className="absolute w-4 h-4 bg-success rounded-full -left-[35px] top-6 ring-4 ring-background text-background flex items-center justify-center"><Activity size={10} /></div>
                                        <div className="card p-6 border-border hover:border-success/30 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">Clinical Note</h3>
                                                    <div className="text-sm text-text-secondary">{format(item.date, 'MMM dd, yyyy')}</div>
                                                </div>
                                                <div className="flex gap-4 items-center">
                                                    {item.data.pain_level && (
                                                        <div className="text-center">
                                                            <div className="text-xs text-text-muted uppercase font-bold">Pain</div>
                                                            <div className={`font-syne font-bold text-lg ${item.data.pain_level > 6 ? 'text-error' : item.data.pain_level > 3 ? 'text-warning' : 'text-success'}`}>{item.data.pain_level}/10</div>
                                                        </div>
                                                    )}
                                                    {item.data.rom_degrees && (
                                                        <div className="text-center">
                                                            <div className="text-xs text-text-muted uppercase font-bold">ROM</div>
                                                            <div className="font-syne font-bold text-lg text-white">{item.data.rom_degrees}°</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-sm text-text-secondary leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">{item.data.summary}</div>
                                            {item.data.next_steps && (
                                                <div className="mt-4 pt-4 border-t border-border/50 text-sm">
                                                    <span className="font-bold text-white block mb-1">Next steps:</span>
                                                    <span className="text-text-secondary">{item.data.next_steps}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            // 4. Milestones
                            if (item.type.startsWith('milestone-')) {
                                const isDone = item.type === 'milestone-done';
                                const isMissed = item.type === 'milestone-missed';
                                return (
                                    <div key={`idx-${idx}`} className="relative">
                                        <div className={`absolute w-4 h-4 rounded-full -left-[35px] top-4 ring-4 ring-background flex items-center justify-center text-background ${isDone ? 'bg-success' : isMissed ? 'bg-error' : 'bg-warning'}`}>
                                            {isDone ? <CheckCircle2 size={10} /> : isMissed ? <TrendingDown size={10} /> : <Clock size={10} />}
                                        </div>
                                        <div className={`card py-4 px-5 border ${isDone ? 'border-success/30 bg-success/5' : isMissed ? 'border-error/30 bg-error/5' : 'border-warning/30 bg-warning/5'} flex justify-between items-center`}>
                                            <span className={`font-bold ${isDone ? 'text-success' : isMissed ? 'text-error' : 'text-warning'}`}>
                                                Milestone: {item.data.title}
                                            </span>
                                            <span className="text-sm font-medium opacity-80 flex items-center gap-1">
                                                {format(item.date, 'MMM dd')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            }

                            return null;
                        })}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="card sticky top-24 p-6">
                        <h3 className="text-lg font-bold text-white mb-6 border-b border-border/50 pb-4">Recovery Analytics</h3>
                        
                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-background rounded-xl p-3 text-center">
                                <div className="text-2xl font-syne font-bold text-primary">{notes.length}</div>
                                <div className="text-[10px] text-text-muted uppercase font-bold mt-1">Notes</div>
                            </div>
                            <div className="bg-background rounded-xl p-3 text-center">
                                <div className="text-2xl font-syne font-bold text-success">{milestones.filter((m:any) => m.status === 'completed').length}</div>
                                <div className="text-[10px] text-text-muted uppercase font-bold mt-1">Done</div>
                            </div>
                            <div className="bg-background rounded-xl p-3 text-center">
                                <div className="text-2xl font-syne font-bold text-warning">{milestones.filter((m:any) => m.status === 'pending').length}</div>
                                <div className="text-[10px] text-text-muted uppercase font-bold mt-1">Pending</div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Pain Trend Chart */}
                            <div>
                                <div className="text-xs text-text-muted tracking-widest uppercase font-bold mb-4">Pain Trend</div>
                                {notes.length === 0 ? <p className="text-sm text-text-secondary">Not enough data points yet.</p> : (
                                    <div className="bg-background rounded-xl p-4 border border-border/50">
                                        <div className="flex items-end gap-3 h-32">
                                            {[...notes].reverse().slice(0, 10).map((n:any, i:number) => (
                                                <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                                                    <div className="absolute -top-5 text-xs font-syne font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-surface px-2 py-1 rounded shadow-lg z-10">
                                                        {n.pain_level}/10
                                                    </div>
                                                    <div 
                                                        className={`w-full max-w-[18px] rounded-t-md transition-all ${n.pain_level > 6 ? 'bg-error' : n.pain_level > 3 ? 'bg-warning' : 'bg-success'}`}
                                                        style={{ height: `${Math.max((n.pain_level / 10) * 100, 8)}%` }}
                                                    ></div>
                                                    <div className="text-[9px] text-text-muted mt-1.5 font-medium">{n.pain_level}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-3 pt-2 border-t border-border/30">
                                            <span className="text-[10px] text-text-muted">Oldest</span>
                                            <span className="text-[10px] text-text-muted">Latest</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ROM Chart */}
                            <div>
                                <div className="text-xs text-text-muted tracking-widest uppercase font-bold mb-4">Range of Motion (°)</div>
                                {notes.filter((n:any)=>n.rom_degrees).length === 0 ? <p className="text-sm text-text-secondary">Not enough data points yet.</p> : (
                                    <div className="bg-background rounded-xl p-4 border border-border/50">
                                        <div className="flex items-end gap-3 h-32">
                                            {[...notes].reverse().filter((n:any)=>n.rom_degrees).slice(0, 10).map((n:any, i:number) => (
                                                <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                                                    <div className="absolute -top-5 text-xs font-syne font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-surface px-2 py-1 rounded shadow-lg z-10">
                                                        {n.rom_degrees}°
                                                    </div>
                                                    <div 
                                                        className="w-full max-w-[18px] bg-primary/80 rounded-t-md transition-all relative"
                                                        style={{ height: `${Math.max(Math.min((n.rom_degrees / 180) * 100, 100), 8)}%` }}
                                                    >
                                                        <div className="absolute top-0 w-full h-1 bg-primary rounded-t-md"></div>
                                                    </div>
                                                    <div className="text-[9px] text-text-muted mt-1.5 font-medium">{n.rom_degrees}°</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-3 pt-2 border-t border-border/30">
                                            <span className="text-[10px] text-text-muted">Oldest</span>
                                            <span className="text-[10px] text-text-muted">Latest</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Link href={`/athlete/physio/${physio.id}`} className="mt-8 flex items-center justify-between text-sm btn-outline py-2.5 w-full hover:bg-primary/10 hover:border-primary/30">
                            Book Another Session <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
