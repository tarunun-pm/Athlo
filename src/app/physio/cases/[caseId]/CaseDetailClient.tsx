'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { Activity, Plus, FileText, CheckCircle2, Circle, TrendingDown, ArrowLeft, Loader2, GripVertical, Calendar, Clock, Link as LinkIcon, CalendarPlus } from 'lucide-react';
import { createNotification } from '@/lib/notifications';
import TreatmentLibraryModal from '@/components/treatments/TreatmentLibraryModal';
import { PrescribedTreatment } from '@/lib/treatmentLibrary';
import CaseReportGenerator from '@/components/reports/CaseReportGenerator';
import ScheduleSessionModal from '@/components/calendar/ScheduleSessionModal';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* =========================================
   TYPES
========================================= */
// Support both old simple format and new rich format
type Exercise = { id: string; name: string; sets: string; reps: string; notes: string } | PrescribedTreatment;
type Milestone = { id: string; title: string; target_date: string; completed_at: string | null; status: 'pending'|'completed'|'missed' };

/* =========================================
   SORTABLE COMPONENTS
========================================= */
function SortableExercise({ exercise, onRemove }: { exercise: any, onRemove: (id: string) => void }) {
    const exId = exercise.id || exercise.treatmentId || Math.random().toString();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: exId });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
    };

    // Determine if it's the new PrescribedTreatment structure or the old simple one
    const isRich = !!exercise.item;
    const name = isRich ? exercise.item.name : exercise.name;
    const category = isRich ? exercise.item.category : 'Exercise';
    
    // Format Prescription
    let prescText = `${exercise.sets} × ${exercise.reps}`;
    if (isRich) {
        const p = exercise.prescription;
        if (p.type === 'sets_reps') prescText = `${p.sets} sets × ${p.reps} reps`;
        else if (p.type === 'duration') prescText = `${p.durationMinutes} mins`;
        else if (p.type === 'hold_duration') prescText = `${p.holdSeconds}s hold × ${p.reps} reps`;
        else if (p.type === 'cycles') prescText = `${p.cycles} cycles`;
    }

    return (
        <div ref={setNodeRef} style={style} className={`flex items-start gap-4 p-4 rounded-xl border ${isDragging ? 'bg-surface border-primary shadow-2xl' : 'bg-background border-border'} transition-colors`}>
            <button {...attributes} {...listeners} className="text-text-muted hover:text-white cursor-grab active:cursor-grabbing mt-1 shrink-0">
                <GripVertical size={20} />
            </button>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                    <div className="text-xs font-bold text-primary bg-primary/10 tracking-wider uppercase px-2 py-0.5 rounded w-max mb-2">{category}</div>
                    <div className="text-white font-medium">{name}</div>
                    {isRich && exercise.prescription.referenceLink && (
                        <a href={exercise.prescription.referenceLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2">
                            <LinkIcon size={12} /> Reference Link
                        </a>
                    )}
                </div>
                <div className="md:col-span-2 flex flex-col justify-center">
                    <div className="text-sm font-bold text-text-secondary mb-1">Prescription</div>
                    <div className="text-white font-medium bg-surface px-3 py-1.5 rounded-lg border border-border inline-block w-max">
                        {prescText}
                    </div>
                </div>
            </div>
            <button onClick={() => onRemove(exId)} className="text-error/70 hover:text-error transition-colors p-2 shrink-0">
                &times;
            </button>
        </div>
    );
}

function SortableMilestone({ m, onToggle }: { m: Milestone, onToggle: (id: string, s: string) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`card p-4 border flex items-center gap-4 ${isDragging ? 'border-primary shadow-2xl scale-[1.02]' : 'border-border/50 hover:border-primary/30'} transition-all`}>
            <button {...attributes} {...listeners} className="text-text-muted hover:text-white cursor-grab active:cursor-grabbing shrink-0">
                <GripVertical size={20} />
            </button>
            
            <button onClick={() => onToggle(m.id, m.status)} className={`shrink-0 transition-colors ${m.status === 'completed' ? 'text-success' : 'text-text-muted hover:text-primary'}`}>
                {m.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>

            <div className="flex-1">
                <h4 className={`text-lg font-bold ${m.status === 'completed' ? 'text-text-muted line-through' : 'text-white'}`}>{m.title}</h4>
                <div className="flex items-center gap-4 text-sm mt-1">
                    <span className="flex items-center gap-1 text-text-secondary">
                        <Calendar size={14} /> Target: {format(new Date(m.target_date), 'MMM dd, yyyy')}
                    </span>
                    {m.completed_at && (
                        <span className="flex items-center gap-1 text-success">
                            <CheckCircle2 size={14} /> Done: {format(new Date(m.completed_at), 'MMM dd')}
                        </span>
                    )}
                </div>
            </div>
            
            <div>
                <span className={`pill text-xs ${m.status === 'completed' ? 'bg-success/20 text-success border-success/30' : m.status === 'missed' ? 'bg-error/20 text-error border-error/30' : 'bg-surface text-text-secondary border-border'}`}>
                    {m.status}
                </span>
            </div>
        </div>
    );
}


/* =========================================
   MAIN COMPONENT
========================================= */
export default function CaseDetailClient({ 
    caseFile, 
    initialTreatmentPlans, 
    initialSessionNotes, 
    initialProgressEntries, 
    initialMilestones, 
    availableSessions,
    isPhysio 
}: any) {
    const supabase = createClient();
    const athlete = caseFile.athlete_profiles;
    
    const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'notes' | 'progress' | 'milestones'>('overview');
    const [showFollowUpModal, setShowFollowUpModal] = useState(false);

    // Milestones State
    const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones || []);
    const [isAddingMilestone, setIsAddingMilestone] = useState(false);
    
    // Treatment Plan State
    const [plans, setPlans] = useState(initialTreatmentPlans || []);
    const [isEditingPlan, setIsEditingPlan] = useState(false);
    const [planExercises, setPlanExercises] = useState<any[]>(plans[0]?.exercises || []);
    const [showLibraryModal, setShowLibraryModal] = useState(false);

    // Notes State
    const [notes, setNotes] = useState(initialSessionNotes || []);
    const [isAddingNote, setIsAddingNote] = useState(false);

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    /* --- Handlers --- */
    
    const handleSavePlan = async () => {
        if (isEditingPlan) {
            // Save to Supabase
            if (plans.length > 0) {
                const plan = plans[0];
                const { error } = await supabase.from('treatment_plans').update({ exercises: planExercises }).eq('id', plan.id);
                if (!error) {
                    setPlans([{...plan, exercises: planExercises}, ...plans.slice(1)]);
                    await createNotification(supabase, {
                        userId: caseFile.athlete_id,
                        type: 'plan_updated',
                        title: 'Treatment Protocol Updated',
                        message: 'Your physiotherapist has updated your recovery exercises.',
                        link: `/athlete/recovery/${caseFile.id}`
                    });
                }
            } else {
                // Create new plan if none exists
                const { data } = await supabase.from('treatment_plans').insert({
                    case_id: caseFile.id,
                    title: 'Active Protocol',
                    description: 'Initial recovery protocol',
                    exercises: planExercises
                }).select().single();
                if (data) setPlans([data]);
            }
        }
        setIsEditingPlan(!isEditingPlan);
    };

    const handleDragEndExercises = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setPlanExercises((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleDragEndMilestones = async (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = milestones.findIndex((i) => i.id === active.id);
            const newIndex = milestones.findIndex((i) => i.id === over.id);
            const newOrder = arrayMove(milestones, oldIndex, newIndex);
            setMilestones(newOrder); // Optimistic UI update
            
            // In a real app we would update the DB order here. For simplicity, we just keep local state.
        }
    };

    const toggleMilestone = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;
        
        // Optimistic
        setMilestones(milestones.map(m => m.id === id ? { ...m, status: newStatus as any, completed_at: completedAt } : m));
        
        await supabase.from('milestones').update({ status: newStatus, completed_at: completedAt }).eq('id', id);

        // Notify athlete if milestone completed
        if (newStatus === 'completed') {
            const milestone = milestones.find(m => m.id === id);
            await createNotification(supabase, {
                userId: caseFile.athlete_id,
                type: 'milestone_completed',
                title: 'Milestone Achieved! 🎉',
                message: `"${milestone?.title || 'A milestone'}" has been marked as completed.`,
                link: `/athlete/recovery/${caseFile.id}`,
            });
        }
    };

    const addMilestone = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const title = fd.get('title') as string;
        const target_date = fd.get('target_date') as string;
        
        const { data } = await supabase.from('milestones').insert({
            case_id: caseFile.id,
            title, target_date
        }).select().single();

        if (data) {
            setMilestones([...milestones, data]);
            setIsAddingMilestone(false);

            // Notify athlete about new milestone
            await createNotification(supabase, {
                userId: caseFile.athlete_id,
                type: 'milestone_added',
                title: 'New Recovery Milestone',
                message: `Your physio set a new milestone: "${title}" — target: ${target_date}.`,
                link: `/athlete/recovery/${caseFile.id}`,
            });
        }
    };

    const addSessionNote = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        
        const note = {
            case_id: caseFile.id,
            physio_id: caseFile.physio_id,
            session_id: fd.get('session_id') as string,
            summary: fd.get('summary') as string,
            pain_level: parseInt(fd.get('pain_level') as string),
            rom_degrees: fd.get('rom_degrees') ? parseInt(fd.get('rom_degrees') as string) : null,
            observations: fd.get('observations') as string,
            next_steps: fd.get('next_steps') as string,
        };

        const { data, error } = await supabase.from('session_notes').insert(note).select(`*, sessions(scheduled_at, status)`).single();
        
        if (data) {
            setNotes([data, ...notes]);
            setIsAddingNote(false);

            // Notify athlete about new clinical notes
            await createNotification(supabase, {
                userId: caseFile.athlete_id,
                type: 'note_added',
                title: 'New Session Notes',
                message: `Your physio added clinical notes for your session. Pain level: ${note.pain_level}/10.`,
                link: `/athlete/recovery/${caseFile.id}`,
            });
            
            // Optimistic progress entry
            await supabase.from('progress_entries').insert({
                case_id: caseFile.id,
                recorded_by: caseFile.physio_id,
                pain_level: note.pain_level,
                mobility_score: null, // Custom formula could go here
                notes: note.summary
            });
        }
    };

    /* --- Renders --- */
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-6">
                <div>
                    <Link href="/physio/patients" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-white transition-colors mb-4">
                        <ArrowLeft size={16} /> Back to Patients
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">{caseFile.injury_type}</h1>
                        <span className={`pill text-xs ${caseFile.status === 'active' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-success/20 text-success border-success/30'}`}>
                            {caseFile.status}
                        </span>
                    </div>
                    <p className="text-text-secondary flex items-center gap-2 text-lg">
                        {athlete.first_name} {athlete.last_name} <span className="text-border">•</span> {caseFile.body_part}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {isPhysio && (
                        <button 
                            onClick={() => setShowFollowUpModal(true)}
                            className="btn-primary shadow-glow hidden sm:flex items-center gap-2"
                        >
                            <CalendarPlus size={16} />
                            <span>Schedule Follow-Up</span>
                        </button>
                    )}
                    <CaseReportGenerator
                        caseFile={caseFile}
                        treatmentPlans={plans}
                        sessionNotes={notes}
                        progressEntries={initialProgressEntries}
                        milestones={milestones}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto no-scrollbar items-center gap-2 border-b border-border/50 pb-px">
                {(['overview', 'plan', 'notes', 'progress', 'milestones'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`capitalize px-4 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === t ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-white hover:border-text-secondary'}`}
                    >
                        {t === 'plan' ? 'Treatment Plan' : t === 'notes' ? 'Session Notes' : t}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                
                {/* OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* At a Glance — full-width stats row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="card bg-primary/5 border-primary/20 text-center py-6 px-4">
                                <div className="text-3xl font-syne font-bold text-primary">{notes.length}</div>
                                <div className="text-xs text-text-secondary uppercase tracking-wider font-bold mt-2">Session Notes</div>
                            </div>
                            <div className="card bg-surface text-center py-6 px-4">
                                <div className="text-3xl font-syne font-bold text-white">{milestones.filter((m:any) => m.status === 'completed').length}<span className="text-text-muted">/{milestones.length}</span></div>
                                <div className="text-xs text-text-secondary uppercase tracking-wider font-bold mt-2">Milestones</div>
                            </div>
                            <div className="card bg-surface text-center py-6 px-4">
                                <div className="text-3xl font-syne font-bold text-white">{plans.length}</div>
                                <div className="text-xs text-text-secondary uppercase tracking-wider font-bold mt-2">Treatment Plans</div>
                            </div>
                            <div className="card bg-surface text-center py-6 px-4">
                                <div className={`text-3xl font-syne font-bold ${caseFile.status === 'active' ? 'text-primary' : 'text-success'}`}>
                                    {caseFile.status === 'active' ? '●' : '✓'}
                                </div>
                                <div className="text-xs text-text-secondary uppercase tracking-wider font-bold mt-2">
                                    {caseFile.status === 'active' ? 'Active Case' : 'Recovered'}
                                </div>
                            </div>
                        </div>

                        {/* Clinical Details — full-width card */}
                        <div className="card p-8 space-y-5">
                            <h3 className="text-xl font-bold text-white">Clinical Details</h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Injury Type</div>
                                    <div className="text-white font-medium text-lg">{caseFile.injury_type}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Body Part</div>
                                    <div className="text-white font-medium text-lg">{caseFile.body_part}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Severity</div>
                                    <div className={`font-medium text-lg ${caseFile.severity === 'Severe' ? 'text-error' : caseFile.severity === 'Moderate' ? 'text-warning' : 'text-success'}`}>{caseFile.severity}</div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Sport Context</div>
                                    <div className="text-white font-medium text-lg">{caseFile.sport_context || '—'}</div>
                                </div>
                            </div>
                            
                            <hr className="border-border/50" />
                            
                            <div>
                                <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Initial Diagnosis</div>
                                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{caseFile.diagnosis_notes || 'No initial notes provided.'}</p>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-text-muted pt-2 border-t border-border/50">
                                <span>Created {format(new Date(caseFile.created_at), 'MMM dd, yyyy')}</span>
                                <span className="text-border">•</span>
                                <span>Patient: {athlete?.first_name} {athlete?.last_name}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* PLAN */}
                {activeTab === 'plan' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Current Treatment Protocol</h2>
                            {isPhysio && (
                                <button className="btn-outline text-sm py-1.5" onClick={handleSavePlan}>
                                    {isEditingPlan ? (
                                        <>Save Exercises</>
                                    ) : (
                                        'Edit Exercises'
                                    )}
                                </button>
                            )}
                        </div>

                        {plans.length === 0 && !isEditingPlan ? (
                            <div className="card p-8 border-dashed text-center">
                                <p className="text-text-muted mb-4">No treatment plan created yet.</p>
                                {isPhysio && <button className="btn-primary" onClick={() => setIsEditingPlan(true)}>Create Plan</button>}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {plans.length > 0 && (
                                    <div className="card bg-surface mt-2">
                                        <h3 className="text-lg font-bold text-white mb-2">{plans[0].title || 'Active Protocol'}</h3>
                                        <p className="text-text-secondary text-sm">{plans[0].description}</p>
                                    </div>
                                )}

                                <h4 className="font-bold text-white mt-8 mb-4">Exercises</h4>
                                
                                {isEditingPlan ? (
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndExercises}>
                                        <div className="space-y-3">
                                            <SortableContext items={planExercises.map(e => e.id || e.treatmentId)} strategy={verticalListSortingStrategy}>
                                                {planExercises.map(ex => (
                                                    <SortableExercise 
                                                        key={ex.id || ex.treatmentId} 
                                                        exercise={ex} 
                                                        onRemove={(id) => setPlanExercises(planExercises.filter(e => (e.id || e.treatmentId) !== id))} 
                                                    />
                                                ))}
                                            </SortableContext>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button 
                                                className="btn-outline border-dashed w-full py-4 text-primary hover:bg-primary/5 transition-colors"
                                                onClick={() => setShowLibraryModal(true)}
                                            >
                                                <Plus className="inline mr-2" size={18} /> Add from Treatment Library
                                            </button>
                                        </div>
                                        {showLibraryModal && (
                                            <TreatmentLibraryModal
                                                onClose={() => setShowLibraryModal(false)}
                                                onAdd={(presc) => {
                                                    // Generate a unique ID if adding the same treatment twice
                                                    setPlanExercises([...planExercises, { ...presc, id: `${presc.treatmentId}-${Date.now()}` }]);
                                                }}
                                            />
                                        )}
                                    </DndContext>
                                ) : (
                                    <div className="grid gap-4">
                                        {planExercises.map((ex: any) => {
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
                                                <div key={ex.id || ex.treatmentId} className="card p-5 border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div>
                                                        {isRich && <div className="text-xs font-bold text-primary bg-primary/10 tracking-wider uppercase px-2 py-0.5 rounded w-max mb-1">{ex.item.category}</div>}
                                                        <div className="text-lg font-bold text-white mb-1">{name}</div>
                                                        {isRich && ex.prescription.referenceLink && (
                                                            <a href={ex.prescription.referenceLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                                                                <LinkIcon size={12} /> Reference Link
                                                            </a>
                                                        )}
                                                    </div>
                                                    <div className="bg-surface border border-border px-4 py-2 rounded-xl shrink-0 text-center">
                                                        <div className="text-xs text-text-secondary uppercase font-bold tracking-widest mb-1">Target</div>
                                                        <div className="font-syne font-bold text-white">{prescText}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* NOTES */}
                {activeTab === 'notes' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Clinical Session Notes</h2>
                            {isPhysio && (
                                <button className="btn-primary py-2 px-4 shadow-glow" onClick={() => setIsAddingNote(!isAddingNote)}>
                                    <Plus size={16} className="inline mr-2"/> Add Note
                                </button>
                            )}
                        </div>

                        {isAddingNote ? (
                            <form onSubmit={addSessionNote} className="card p-6 bg-surface mt-4 animate-in fade-in">
                                <h3 className="text-xl font-bold text-white mb-6">New Clinical Note</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">Select Completed Session</label>
                                        <select required name="session_id" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none">
                                            <option value="">-- Choose Session --</option>
                                            {availableSessions.map((s:any) => (
                                                <option key={s.id} value={s.id}>{format(new Date(s.scheduled_at), 'MMM dd, yyyy - h:mm a')}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">Summary of Treatment</label>
                                        <textarea required name="summary" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none h-24 resize-none" placeholder="What was done today?"></textarea>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-2">Pain Level (1-10)</label>
                                            <input required name="pain_level" type="range" min="1" max="10" defaultValue="5" className="w-full accent-primary" />
                                            <div className="flex justify-between text-xs text-text-muted mt-1"><span>1 (Low)</span><span>10 (High)</span></div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-2">Range of Motion (°)</label>
                                            <input name="rom_degrees" type="number" placeholder="e.g. 90" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-2">Clinical Observations</label>
                                            <textarea name="observations" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none h-24 resize-none"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary mb-2">Next Steps Plan</label>
                                            <textarea name="next_steps" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none h-24 resize-none"></textarea>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                                        <button type="button" onClick={() => setIsAddingNote(false)} className="btn-outline">Cancel</button>
                                        <button type="submit" className="btn-primary" disabled={availableSessions.length === 0}>Save Note</button>
                                    </div>
                                    {availableSessions.length === 0 && <p className="text-error text-xs text-right">No completed sessions available to attach this note to.</p>}
                                </div>
                            </form>
                        ) : notes.length === 0 ? (
                           <p className="text-text-muted">No session notes added yet.</p>
                        ) : (
                            <div className="relative border-l-2 border-border/50 pl-6 ml-4 space-y-10 py-4">
                                {notes.map((n: any) => (
                                    <div key={n.id} className="relative">
                                        <div className="absolute w-4 h-4 bg-primary rounded-full -left-[35px] top-6 ring-4 ring-background"></div>
                                        <div className="card p-6 border-border hover:border-primary/30 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">{format(new Date(n.created_at), 'MMM dd, yyyy')}</h3>
                                                    <div className="text-sm text-text-secondary">Session on {n.sessions ? format(new Date(n.sessions?.scheduled_at), 'MMM dd') : 'Unknown Date'}</div>
                                                </div>
                                                <div className="flex gap-4 items-center">
                                                    {n.pain_level && (
                                                        <div className="text-center">
                                                            <div className="text-xs text-text-muted uppercase font-bold">Pain</div>
                                                            <div className={`font-syne font-bold text-lg ${n.pain_level > 6 ? 'text-error' : n.pain_level > 3 ? 'text-warning' : 'text-success'}`}>{n.pain_level}/10</div>
                                                        </div>
                                                    )}
                                                    {n.rom_degrees && (
                                                        <div className="text-center">
                                                            <div className="text-xs text-text-muted uppercase font-bold">ROM</div>
                                                            <div className="font-syne font-bold text-lg text-white">{n.rom_degrees}°</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="text-xs uppercase font-bold text-primary mb-1 tracking-wider">Summary</div>
                                                    <p className="text-sm text-text-secondary leading-relaxed">{n.summary}</p>
                                                </div>
                                                {n.observations && (
                                                    <div>
                                                        <div className="text-xs uppercase font-bold text-primary mb-1 tracking-wider">Observations</div>
                                                        <p className="text-sm text-text-secondary leading-relaxed">{n.observations}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* MILESTONES */}
                {activeTab === 'milestones' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Recovery Roadmap</h2>
                            {isPhysio && (
                                <button className="btn-primary py-2 px-4 shadow-glow" onClick={() => setIsAddingMilestone(!isAddingMilestone)}>
                                    <Plus size={16} className="inline mr-2"/> Add Milestone
                                </button>
                            )}
                        </div>

                        {/* Timeline / Drag and drop list */}
                        <div className="max-w-2xl">
                            {isAddingMilestone && (
                                <form onSubmit={addMilestone} className="card p-6 border-primary/50 mb-6 bg-primary/5 animate-in slide-in-from-top-4">
                                    <h4 className="font-bold text-white mb-4">New Milestone</h4>
                                    <div className="space-y-4">
                                        <input required name="title" type="text" placeholder="e.g. Full weight bearing without pain" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                                        <input required name="target_date" type="date" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                                        <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => setIsAddingMilestone(false)} className="btn-outline">Cancel</button>
                                            <button type="submit" className="btn-primary">Add</button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {milestones.length === 0 ? (
                                <p className="text-text-muted">No milestones defined.</p>
                            ) : (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndMilestones}>
                                    <div className="space-y-3 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border/30">
                                        <SortableContext items={milestones.map((m:any) => m.id)} strategy={verticalListSortingStrategy}>
                                            {milestones.map((m: any) => (
                                                <SortableMilestone key={m.id} m={m} onToggle={toggleMilestone} />
                                            ))}
                                        </SortableContext>
                                    </div>
                                </DndContext>
                            )}
                        </div>
                    </div>
                )}

                {/* PROGRESS */}
                {activeTab === 'progress' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white mb-4">Recovery Analytics</h2>
                        <div className="card h-[300px] flex items-center justify-center border-dashed border-border bg-transparent">
                            <div className="text-center">
                                <TrendingDown className="mx-auto text-primary mb-4" size={48} opacity={0.5} />
                                <h3 className="text-lg font-bold text-white mb-2">Progress Charts Coming Soon</h3>
                                <p className="text-text-muted text-sm max-w-sm mx-auto">This area will visualize the pain levels and range of motion data points collected across session notes.</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {showFollowUpModal && (
                <ScheduleSessionModal
                    physioId={caseFile.physio_id}
                    prefillAthleteId={caseFile.athlete_id}
                    prefillCaseId={caseFile.id}
                    onClose={() => setShowFollowUpModal(false)}
                />
            )}
        </div>
    );
}
