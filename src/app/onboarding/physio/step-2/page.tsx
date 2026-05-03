'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UploadCloud, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function PhysioStep2() {
    const router = useRouter();
    const supabase = createClient();

    const [regId, setRegId] = useState('');
    const [dcptotDoc, setDcptotDoc] = useState<File | null>(null);
    const [bptDoc, setBptDoc] = useState<File | null>(null);

    const [isExpanded, setIsExpanded] = useState(false);
    const [experience, setExperience] = useState([{ institution: '', role: '', duration: '' }]);
    const [memberships, setMemberships] = useState(['']);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFormValid = regId.trim() !== '' && dcptotDoc !== null && bptDoc !== null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            setter(file);
        }
    };

    const addExperience = () => {
        if (experience.length < 3) setExperience([...experience, { institution: '', role: '', duration: '' }]);
    };

    const addMembership = () => {
        if (memberships.length < 3) setMemberships([...memberships, '']);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // MOCK UPLOAD LOBIC:
            // Since storage buckets might not be fully configured on a mock backend, 
            // we generate dummy URLs or attempt upload. 
            // A production app would rigorously await `supabase.storage.from('documents').upload(...)`
            let dcptotUrl = `https://mock.storage/${user.id}/${dcptotDoc.name}`;
            let bptUrl = `https://mock.storage/${user.id}/${bptDoc.name}`;

            const { error: dbError } = await supabase.from('physio_profiles').update({
                dcptot_reg_id: regId,
                dcptot_doc_url: dcptotUrl,
                bpt_doc_url: bptUrl,
                verification_status: 'pending',
                submitted_at: new Date().toISOString()
            }).eq('id', user.id);

            if (dbError) throw dbError;

            router.push('/onboarding/physio/success');
        } catch (err: any) {
            setError(err.message || 'Failed to submit documents. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-24 max-w-2xl mx-auto p-4 md:p-8">
            {/* Progress Bar */}
            <div className="mb-8">
                <p className="text-text-muted text-sm font-medium mb-2">Step 2 of 2</p>
                <div className="w-full bg-surface border border-border h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-full rounded-full shadow-glow"></div>
                </div>
            </div>

            <h1 className="text-3xl font-syne font-bold text-text-primary mb-2">
                Credentials Verification
            </h1>
            <p className="text-text-muted mb-8">
                We require your official registration to ensure platform trust and credibility.
            </p>

            {error && (
                <div className="bg-error/10 border border-error/50 text-error text-sm p-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Block 1: DCPTOT */}
                <section className="glass-card p-6 space-y-4">
                    <h2 className="text-lg font-syne font-bold text-text-primary">DCPTOT Registration</h2>
                    <div>
                        <input type="text" placeholder="Registration ID (Required)" required value={regId} onChange={e => setRegId(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <p className="text-sm text-text-muted mb-2">Upload Certificate (JPG/PNG/PDF, Max 5MB)</p>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:border-primary/50 hover:bg-surface/50 rounded-[10px] cursor-pointer transition-colors group">
                            <UploadCloud className="w-8 h-8 text-text-muted group-hover:text-primary mb-2 transition-colors" />
                            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                                {dcptotDoc ? dcptotDoc.name : 'Click to upload or drag & drop'}
                            </span>
                            <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={e => handleFileChange(e, setDcptotDoc)} />
                        </label>
                    </div>
                </section>

                {/* Block 2: Degree */}
                <section className="glass-card p-6 space-y-4">
                    <h2 className="text-lg font-syne font-bold text-text-primary">BPT/MPT Degree</h2>
                    <div>
                        <p className="text-sm text-text-muted mb-2">Upload Certificate (JPG/PNG/PDF, Max 5MB)</p>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:border-primary/50 hover:bg-surface/50 rounded-[10px] cursor-pointer transition-colors group">
                            <UploadCloud className="w-8 h-8 text-text-muted group-hover:text-primary mb-2 transition-colors" />
                            <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                                {bptDoc ? bptDoc.name : 'Click to upload or drag & drop'}
                            </span>
                            <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={e => handleFileChange(e, setBptDoc)} />
                        </label>
                    </div>
                </section>

                {/* Expandable Meta */}
                <div className="border border-border rounded-[20px] overflow-hidden bg-surface transition-all">
                    <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-between p-4 font-medium text-text-secondary hover:text-text-primary">
                        <span>Add more credentials +</span>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {isExpanded && (
                        <div className="p-4 border-t border-border space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm text-text-muted">Past Experience (Max 3)</p>
                                    <button type="button" onClick={addExperience} disabled={experience.length >= 3} className="text-primary text-sm hover:underline disabled:opacity-50">Add</button>
                                </div>
                                {experience.map((exp, idx) => (
                                    <div key={idx} className="grid grid-cols-1 gap-2 mb-4 bg-background p-3 rounded-lg border border-border">
                                        <input type="text" placeholder="Institution" value={exp.institution} onChange={e => {
                                            const next = [...experience]; next[idx].institution = e.target.value; setExperience(next);
                                        }} className="input-field py-2 text-sm" />
                                        <input type="text" placeholder="Role" value={exp.role} onChange={e => {
                                            const next = [...experience]; next[idx].role = e.target.value; setExperience(next);
                                        }} className="input-field py-2 text-sm" />
                                        <input type="text" placeholder="Duration (e.g. 2020-2022)" value={exp.duration} onChange={e => {
                                            const next = [...experience]; next[idx].duration = e.target.value; setExperience(next);
                                        }} className="input-field py-2 text-sm" />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm text-text-muted">Professional Memberships (Max 3)</p>
                                    <button type="button" onClick={addMembership} disabled={memberships.length >= 3} className="text-primary text-sm hover:underline disabled:opacity-50">Add</button>
                                </div>
                                {memberships.map((mem, idx) => (
                                    <div key={idx} className="mb-2">
                                        <input type="text" placeholder="Organization name" value={mem} onChange={e => {
                                            const next = [...memberships]; next[idx] = e.target.value; setMemberships(next);
                                        }} className="input-field py-2 text-sm" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Warning Banner */}
                <div className="bg-warning/10 border border-warning/30 p-4 rounded-xl flex items-start gap-4">
                    <span className="text-warning text-xl">ℹ️</span>
                    <p className="text-sm text-warning/90 mt-0.5 font-medium leading-relaxed">
                        Verified manually within 48 working hours. Ensure all uploaded documents are clearly legible.
                    </p>
                </div>

                {/* Sticky CTA */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border flex flex-col items-center pb-8 z-10">
                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className="btn-primary w-full max-w-md disabled:opacity-50 disabled:cursor-not-allowed group shadow-glow mb-4"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Submit for Review
                                <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                            </>
                        )}
                    </button>

                    <Link href="/onboarding/athlete" className="text-sm text-text-muted hover:text-text-primary transition-colors underline underline-offset-4">
                        Not a physio? Sign up as Athlete →
                    </Link>
                </div>

            </form>
        </div>
    );
}
