'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Shield, Settings, LogOut, Trash2, Save, X, Plus, Check } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useTheme, THEMES, ThemeId } from '@/components/ThemeProvider';

interface Props {
    profile: any;
    user: any;
}

export default function PhysioProfileClient({ profile, user }: Props) {
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('tab') === 'settings' ? 'settings' : 'profile';
        }
        return 'profile';
    });

    // Profile form state
    const [firstName, setFirstName] = useState(profile?.first_name || '');
    const [lastName, setLastName] = useState(profile?.last_name || '');
    const [gender, setGender] = useState(profile?.gender || '');
    const [age, setAge] = useState(profile?.age || '');
    const [sportSpecs, setSportSpecs] = useState<string[]>(profile?.sport_specializations || []);
    const [injurySpecs, setInjurySpecs] = useState<string[]>(profile?.injury_specializations || []);
    const [languages, setLanguages] = useState<string[]>(profile?.languages || []);
    const [personalStatement, setPersonalStatement] = useState(profile?.personal_statement || '');
    const [consultationRate, setConsultationRate] = useState(profile?.consultation_rate || '');
    const [consultationModes, setConsultationModes] = useState<string[]>(profile?.consultation_modes || []);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Tag input states
    const [sportInput, setSportInput] = useState('');
    const [injuryInput, setInjuryInput] = useState('');
    const [langInput, setLangInput] = useState('');

    // Settings
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const initials = `${(firstName || 'P')[0]}${(lastName || '')[0] || ''}`.toUpperCase();

    const handleSaveProfile = async () => {
        setSaving(true);
        await supabase.from('physio_profiles').update({
            first_name: firstName,
            last_name: lastName,
            gender,
            age: age ? Number(age) : null,
            sport_specializations: sportSpecs,
            injury_specializations: injurySpecs,
            languages,
            personal_statement: personalStatement,
            consultation_rate: consultationRate ? Number(consultationRate) : null,
            consultation_modes: consultationModes,
        }).eq('id', user.id);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const handleDeleteAccount = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const addTag = (list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
        const val = input.trim();
        if (val && !list.includes(val)) {
            setList([...list, val]);
        }
        setInput('');
    };

    const removeTag = (list: string[], setList: (v: string[]) => void, val: string) => {
        setList(list.filter(v => v !== val));
    };

    const toggleMode = (mode: string) => {
        setConsultationModes(prev =>
            prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
        );
    };

    const tabs = [
        { id: 'profile' as const, label: 'Profile', icon: User },
        { id: 'settings' as const, label: 'Settings', icon: Settings },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Tab Bar */}
            <div className="flex items-center gap-6 border-b border-border pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-muted hover:text-text-primary'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
                <div className="space-y-8">
                    {/* Header Card */}
                    <div className="card p-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-2xl font-bold text-text-primary">{firstName} {lastName}</h1>
                                <p className="text-text-secondary mt-1">Sports Physiotherapist</p>
                                <div className="flex items-center gap-2 mt-2">
                                    {profile?.verification_status === 'approved' ? (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full">
                                            <Shield size={12} /> Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-warning bg-warning/10 px-2 py-1 rounded-full">
                                            {profile?.verification_status || 'pending'}
                                        </span>
                                    )}
                                    {profile?.location_locality && (
                                        <span className="text-xs text-text-muted">{profile.location_locality}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div className="card p-8 space-y-6">
                        <h2 className="text-lg font-bold text-text-primary">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">First Name</label>
                                <input className="input-field" value={firstName} onChange={e => setFirstName(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Last Name</label>
                                <input className="input-field" value={lastName} onChange={e => setLastName(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Gender</label>
                                <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Age</label>
                                <input type="number" className="input-field" value={age} onChange={e => setAge(e.target.value)} min={18} max={99} />
                            </div>
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="card p-8 space-y-6">
                        <h2 className="text-lg font-bold text-text-primary">Professional Details</h2>

                        {/* Sport Specializations */}
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Sport Specializations</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {sportSpecs.map(s => (
                                    <span key={s} className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                                        {s}
                                        <button onClick={() => removeTag(sportSpecs, setSportSpecs, s)} className="hover:text-error"><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input className="input-field flex-1" value={sportInput} onChange={e => setSportInput(e.target.value)} placeholder="e.g. Football" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(sportSpecs, setSportSpecs, sportInput, setSportInput))} />
                                <button onClick={() => addTag(sportSpecs, setSportSpecs, sportInput, setSportInput)} className="btn-outline px-3 py-2"><Plus size={16} /></button>
                            </div>
                        </div>

                        {/* Injury Specializations */}
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Injury Specializations</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {injurySpecs.map(s => (
                                    <span key={s} className="inline-flex items-center gap-1 text-xs font-medium bg-warning/10 text-warning px-3 py-1.5 rounded-full">
                                        {s}
                                        <button onClick={() => removeTag(injurySpecs, setInjurySpecs, s)} className="hover:text-error"><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input className="input-field flex-1" value={injuryInput} onChange={e => setInjuryInput(e.target.value)} placeholder="e.g. ACL" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(injurySpecs, setInjurySpecs, injuryInput, setInjuryInput))} />
                                <button onClick={() => addTag(injurySpecs, setInjurySpecs, injuryInput, setInjuryInput)} className="btn-outline px-3 py-2"><Plus size={16} /></button>
                            </div>
                        </div>

                        {/* Languages */}
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Languages</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {languages.map(s => (
                                    <span key={s} className="inline-flex items-center gap-1 text-xs font-medium bg-surface border border-border text-text-secondary px-3 py-1.5 rounded-full">
                                        {s}
                                        <button onClick={() => removeTag(languages, setLanguages, s)} className="hover:text-error"><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input className="input-field flex-1" value={langInput} onChange={e => setLangInput(e.target.value)} placeholder="e.g. English" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(languages, setLanguages, langInput, setLangInput))} />
                                <button onClick={() => addTag(languages, setLanguages, langInput, setLangInput)} className="btn-outline px-3 py-2"><Plus size={16} /></button>
                            </div>
                        </div>

                        {/* Personal Statement */}
                        <div>
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Personal Statement</label>
                            <textarea className="input-field min-h-[120px] resize-y" value={personalStatement} onChange={e => setPersonalStatement(e.target.value)} placeholder="Tell your patients about your approach..." />
                        </div>
                    </div>

                    {/* Practice */}
                    <div className="card p-8 space-y-6">
                        <h2 className="text-lg font-bold text-text-primary">Practice Settings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Consultation Rate (₹)</label>
                                <input type="number" className="input-field" value={consultationRate} onChange={e => setConsultationRate(e.target.value)} min={0} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Consultation Modes</label>
                                <div className="flex flex-wrap gap-3 mt-1">
                                    {['online', 'in-person', 'home-visit'].map(mode => (
                                        <button key={mode} onClick={() => toggleMode(mode)} className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-all ${consultationModes.includes(mode) ? 'bg-primary text-white border-primary' : 'border-border text-text-secondary hover:border-border-strong'}`}>
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Credentials (Read-Only) */}
                    <div className="card p-8 space-y-6">
                        <h2 className="text-lg font-bold text-text-primary">Credentials</h2>
                        <p className="text-xs text-text-muted">These were set during onboarding and cannot be changed here.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">DCPTOT Reg. ID</label>
                                <div className="input-field opacity-60 cursor-not-allowed">{profile?.dcptot_reg_id || '—'}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Verification Status</label>
                                <div className="input-field opacity-60 cursor-not-allowed capitalize">{profile?.verification_status || 'pending'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-4">
                        <button onClick={handleSaveProfile} disabled={saving} className="btn-primary gap-2 min-w-[180px]">
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : saved ? (
                                <><Check size={18} /> Saved!</>
                            ) : (
                                <><Save size={18} /> Save Changes</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
                <div className="space-y-8">
                    {/* Account Info */}
                    <div className="card p-8 space-y-6">
                        <h2 className="text-lg font-bold text-text-primary">Account</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Email</label>
                                <div className="input-field opacity-60 cursor-not-allowed">{user?.email || '—'}</div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">Phone</label>
                                <div className="input-field opacity-60 cursor-not-allowed">{user?.phone || '—'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Theme Selector */}
                    <div className="card p-8 space-y-6">
                        <h2 className="text-lg font-bold text-text-primary">Appearance</h2>
                        <p className="text-sm text-text-secondary">Choose a theme that suits your style.</p>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Dark Themes</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {THEMES.filter(t => t.type === 'dark').map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${theme === t.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-border-strong'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-5 h-5 rounded-full border-2 border-white/20" style={{ backgroundColor: t.swatch }} />
                                            <span className="text-sm font-medium text-text-primary">{t.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="h-2 flex-1 rounded-sm" style={{ backgroundColor: '#16181C' }} />
                                            <div className="h-2 w-6 rounded-sm" style={{ backgroundColor: t.swatch }} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Light Themes</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {THEMES.filter(t => t.type === 'light').map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${theme === t.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-border-strong'}`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-5 h-5 rounded-full border-2 border-black/10" style={{ backgroundColor: t.swatch }} />
                                            <span className="text-sm font-medium text-text-primary">{t.name}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="h-2 flex-1 rounded-sm" style={{ backgroundColor: '#F8FAFC' }} />
                                            <div className="h-2 w-6 rounded-sm" style={{ backgroundColor: t.swatch }} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sign Out */}
                    <div className="card p-8 space-y-4">
                        <h2 className="text-lg font-bold text-text-primary">Session</h2>
                        <button onClick={handleSignOut} className="btn-outline gap-2 text-warning border-warning/30 hover:bg-warning/10 hover:border-warning/50">
                            <LogOut size={18} /> Sign Out
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="card p-8 space-y-4 border-error/30">
                        <h2 className="text-lg font-bold text-error">Danger Zone</h2>
                        <p className="text-sm text-text-secondary">Once you delete your account, there is no going back. Please be certain.</p>
                        {showDeleteConfirm ? (
                            <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/30 rounded-xl">
                                <p className="text-sm text-text-primary flex-1">Are you sure? This action is irreversible.</p>
                                <button onClick={handleDeleteAccount} className="btn-primary bg-error hover:bg-red-700 text-sm py-2 px-4">Yes, Delete</button>
                                <button onClick={() => setShowDeleteConfirm(false)} className="btn-outline text-sm py-2 px-4">Cancel</button>
                            </div>
                        ) : (
                            <button onClick={() => setShowDeleteConfirm(true)} className="btn-outline gap-2 text-error border-error/30 hover:bg-error/10 hover:border-error/50">
                                <Trash2 size={18} /> Delete Account
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
