import { Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineEvent {
    id: string;
    time: Date | string;
    title: string;
    type: string;
    duration: number; // in minutes
}

export default function ScheduleTimeline({ events }: { events: TimelineEvent[] }) {
    if (!events || events.length === 0) {
        return (
            <div className="flex items-center justify-center text-sm text-text-muted h-32">
                No scheduled events
            </div>
        );
    }

    return (
        <div className="relative pt-4 overflow-x-auto pb-6 custom-scrollbar">
            <div className="flex min-w-max gap-4 px-2">
                {events.map((ev, i) => (
                    <div key={ev.id} className="relative flex flex-col items-center group">
                        {/* Timeline Line */}
                        {i < events.length - 1 && (
                            <div className="absolute top-3 left-1/2 w-full h-[2px] bg-border -z-10 group-hover:bg-primary/50 transition-colors"></div>
                        )}
                        
                        {/* Dot */}
                        <div className="w-6 h-6 rounded-full bg-surface border-2 border-primary flex items-center justify-center z-10 shadow-[0_0_10px_rgba(37,99,235,0.3)] mb-3">
                            <Clock size={10} className="text-primary" />
                        </div>
                        
                        {/* Content */}
                        <div className="card p-3 border-transparent bg-background/50 text-center w-32 border hover:border-primary/30 transition-colors">
                            <div className="text-xs font-bold text-white mb-1">{format(new Date(ev.time), 'h:mm a')}</div>
                            <div className="text-[11px] font-medium text-text-secondary truncate w-full" title={ev.title}>{ev.title}</div>
                            <div className="text-[10px] text-text-muted mt-1">{ev.duration} min • {ev.type}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
