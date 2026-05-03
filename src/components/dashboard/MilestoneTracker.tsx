import { CheckCircle2 } from 'lucide-react';

interface Milestone {
    id: string;
    title: string;
    status: 'pending' | 'completed' | 'missed';
    target_date: string;
}

export default function MilestoneTracker({ milestones }: { milestones: Milestone[] }) {
    if (!milestones || milestones.length === 0) {
        return <div className="text-sm text-text-muted h-24 flex items-center justify-center">No milestones tracked</div>;
    }

    const completed = milestones.filter(m => m.status === 'completed').length;
    const progress = Math.round((completed / milestones.length) * 100) || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <div className="text-3xl font-syne font-bold text-white mb-1">{progress}%</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider font-bold">Recovery Progress</div>
                </div>
                <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    {completed} of {milestones.length} Hit
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-surface rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-primary to-success transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="space-y-3 mt-4">
                {milestones.slice(0, 4).map(m => (
                    <div key={m.id} className="flex items-center gap-4 bg-[#1C1F26] p-3 rounded-xl border border-transparent hover:border-border transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                            m.status === 'completed' ? 'bg-success/20 text-success' : 
                            m.status === 'missed' ? 'bg-error/10 text-error' : 
                            'bg-surface text-text-muted'
                        }`}>
                            {m.status === 'completed' && <CheckCircle2 size={16} />}
                            {m.status !== 'completed' && <div className={`w-2 h-2 rounded-full ${m.status === 'missed' ? 'bg-error' : 'bg-text-muted'}`}></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`text-sm font-bold truncate ${m.status === 'completed' ? 'text-text-secondary line-through' : 'text-white'}`}>
                                {m.title}
                            </div>
                            <div className="text-[10px] text-text-muted tracking-wider uppercase mt-0.5">
                                Due {new Date(m.target_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                            </div>
                        </div>
                        <div className="shrink-0">
                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                                m.status === 'completed' ? 'bg-success/10 text-success' : 
                                m.status === 'missed' ? 'bg-error/10 text-error' : 
                                'bg-surface text-text-secondary'
                            }`}>
                                {m.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
