'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Activity, Plus, X, ChevronRight, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import DetailedMuscleMap from '@/components/crm/DetailedMuscleMap';
import { createNotification } from '@/lib/notifications';

type CaseFile = {
    id: string;
    injury_type: string;
    body_part: string;
    severity: string;
    status: string;
    created_at: string;
};

export default function PatientDetailClient({ athlete, initialCases, physioId }: { athlete: any, initialCases: CaseFile[], physioId: string }) {
    const [cases, setCases] = useState<CaseFile[]>(initialCases);
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Modal Form State
    const [injuryType, setInjuryType] = useState('');
    const [sportContext, setSportContext] = useState(athlete.primary_sport || '');
    const [severity, setSeverity] = useState('Moderate');
    const [diagnosis, setDiagnosis] = useState('');
    
    // Body Map State
    const [bodyPart, setBodyPart] = useState('');

    const handleSubmitCase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!injuryType || !bodyPart) return;
        setIsSubmitting(true);

        const newCase = {
            physio_id: physioId,
            athlete_id: athlete.id,
            injury_type: injuryType,
            body_part: bodyPart,
            sport_context: sportContext,
            severity,
            diagnosis_notes: diagnosis,
            status: 'active'
        };

        const { data, error } = await supabase.from('case_files').insert(newCase).select().single();

        setIsSubmitting(false);

        if (error) {
            console.error(error);
            alert("Failed to create case file.");
        } else if (data) {
            setCases([data, ...cases]);
            setIsCreating(false);

            // Notify the athlete about the new case
            const { data: physioProfile } = await supabase
                .from('physio_profiles')
                .select('first_name, last_name')
                .eq('id', physioId)
                .single();

            await createNotification(supabase, {
                userId: athlete.id,
                type: 'case_created',
                title: 'New Clinical Case',
                message: `Dr. ${physioProfile?.last_name || 'Your physio'} opened a case for ${injuryType} (${bodyPart}).`,
                link: `/athlete/recovery`,
            });

            // Feature Flow: Redirect straight to the newly created case detail page
            router.push(`/physio/cases/${data.id}`);
        }
    };

    // (Removed handleBodyClick as the new map sends strings directly)

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 border-b border-border/50 pb-6">
                <Link href="/physio/patients" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-white hover:bg-surface transition-colors cursor-pointer shrink-0">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        {athlete.first_name} {athlete.last_name}
                    </h1>
                    <p className="text-text-secondary flex items-center gap-2">
                        <Activity size={16} className="text-primary"/> {athlete.primary_sport || 'Athlete'}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Case Files</h2>
                <button 
                    onClick={() => setIsCreating(true)}
                    className="btn-primary py-2 px-4 text-sm gap-2"
                >
                    <Plus size={16} /> New Case File
                </button>
            </div>

            <div className="space-y-4">
                {cases.length === 0 ? (
                    <div className="card p-8 border-dashed border-border bg-transparent text-center">
                        <p className="text-text-muted mb-4">No clinical cases have been created for this athlete yet.</p>
                        <button onClick={() => setIsCreating(true)} className="btn-outline text-sm">Create First Case</button>
                    </div>
                ) : (
                    cases.map(c => (
                        <Link 
                            key={c.id} 
                            href={`/physio/cases/${c.id}`}
                            className="card p-6 border-border hover:border-primary/50 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-3 h-3 rounded-full mt-1.5 ${c.status === 'active' ? 'bg-primary shadow-glow' : c.status === 'recovered' ? 'bg-success' : 'bg-text-muted'}`} />
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">{c.injury_type} — {c.body_part}</h3>
                                    <div className="text-sm font-medium text-text-secondary flex gap-3">
                                        <span className="capitalize text-text-muted">Status: <span className={c.status === 'active' ? 'text-primary' : ''}>{c.status}</span></span>
                                        <span className="text-border">•</span>
                                        <span>Severity: {c.severity}</span>
                                        <span className="text-border">•</span>
                                        <span>Created: {format(new Date(c.created_at), 'MMM dd, yyyy')}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-border group-hover:text-primary transition-colors" />
                        </Link>
                    ))
                )}
            </div>

            {/* Case Creation Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm overflow-y-auto">
                    <div className="card w-full max-w-4xl p-0 bg-surface border-border shadow-2xl relative animate-in zoom-in-95 duration-200 my-8">
                        <div className="flex justify-between items-center p-6 border-b border-border/50 sticky top-0 bg-surface z-10 rounded-t-[24px]">
                            <h3 className="text-xl font-bold text-white">Create New Case File</h3>
                            <button onClick={() => setIsCreating(false)} className="text-text-muted hover:text-error transition-colors p-2">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitCase} className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* Left Col - Form Fields */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">Injury / Issue Type*</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="e.g., ACL Tear, Hamstring Strain"
                                            value={injuryType}
                                            onChange={e => setInjuryType(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">Selected Body Part*</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="Click the body map to select..."
                                            value={bodyPart}
                                            readOnly
                                            className="w-full bg-background border border-primary/50 text-primary font-medium rounded-xl px-4 py-3 cursor-not-allowed focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">Sport Context</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g., Fast bowling action"
                                            value={sportContext}
                                            onChange={e => setSportContext(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">Severity Level</label>
                                        <div className="flex gap-2">
                                            {['Mild', 'Moderate', 'Severe'].map(sev => (
                                                <button
                                                    key={sev}
                                                    type="button"
                                                    onClick={() => setSeverity(sev)}
                                                    className={`flex-1 py-3 text-sm font-medium rounded-xl border transition-colors ${severity === sev ? 'bg-primary text-white border-primary shadow-glow' : 'bg-background text-text-secondary border-border hover:border-text-muted'}`}
                                                >
                                                    {sev}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-text-secondary mb-2">Initial Clinical Notes</label>
                                        <textarea 
                                            placeholder="Initial assessment, history, physical exam findings, etc."
                                            value={diagnosis}
                                            onChange={e => setDiagnosis(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors h-32 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Right Col - Body Map */}
                                <div className="border border-border/50 rounded-2xl bg-background overflow-hidden relative flex flex-col items-center py-6">
                                    <div className="w-full mt-4 p-4 flex justify-center">
                                        <DetailedMuscleMap 
                                            selectedMuscle={bodyPart}
                                            onSelectMuscle={setBodyPart}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border/50 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCreating(false)} className="btn-outline">Cancel</button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting || !injuryType || !bodyPart}
                                    className="btn-primary gap-2 shadow-glow disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Create Case File</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
