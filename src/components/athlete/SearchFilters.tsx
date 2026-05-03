'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal } from 'lucide-react';

const SPORTS = ['Cricket', 'Football', 'Badminton', 'Tennis', 'Athletics'];
const INJURIES = ['ACL Tear', 'Hamstring', 'Shoulder', 'Ankle Sprain', 'Back Pain'];

export default function SearchFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSport = searchParams.get('sport') || '';
    const currentInjury = searchParams.get('injury') || '';
    const currentQuery = searchParams.get('q') || '';

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/athlete/search?${params.toString()}`);
    };

    return (
        <div className="card p-6 mb-8 flex flex-col md:flex-row gap-4">

            {/* Search Input */}
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                    type="text"
                    placeholder="Search physios by name..."
                    defaultValue={currentQuery}
                    onBlur={(e) => updateFilters('q', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && updateFilters('q', e.currentTarget.value)}
                    className="input-field pl-12 h-14"
                />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                <div className="flex items-center gap-2 px-4 h-14 bg-surface border border-border rounded-[14px] shrink-0">
                    <SlidersHorizontal size={18} className="text-text-muted" />
                    <select
                        className="bg-transparent text-text-primary text-sm font-medium focus:outline-none appearance-none pr-4"
                        value={currentSport}
                        onChange={(e) => updateFilters('sport', e.target.value)}
                    >
                        <option value="">Any Sport</option>
                        {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-2 px-4 h-14 bg-surface border border-border rounded-[14px] shrink-0">
                    <select
                        className="bg-transparent text-text-primary text-sm font-medium focus:outline-none appearance-none pr-4"
                        value={currentInjury}
                        onChange={(e) => updateFilters('injury', e.target.value)}
                    >
                        <option value="">Any Injury</option>
                        {INJURIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                </div>
            </div>

        </div>
    );
}
