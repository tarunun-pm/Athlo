import Link from 'next/link';

interface AvatarStripProps {
    people: { id: string; name: string; initials: string; role?: string }[];
    limit?: number;
    hrefPrefix?: string;
}

export default function AvatarStrip({ people, limit = 5, hrefPrefix = '#' }: AvatarStripProps) {
    if (!people || people.length === 0) return <div className="text-sm text-text-muted h-24 flex items-center justify-center">No contacts yet</div>;

    const visible = people.slice(0, limit);
    const overflow = people.length > limit ? people.length - limit : 0;

    return (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar p-2">
            {visible.map(p => (
                <Link key={p.id} href={`${hrefPrefix}/${p.id}`} className="group relative flex flex-col items-center flex-shrink-0">
                    <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center bg-gradient-to-br from-surface to-background text-white font-syne font-bold text-sm group-hover:border-primary transition-colors hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                        {p.initials}
                    </div>
                    <span className="text-[10px] text-text-muted mt-2 w-16 text-center truncate group-hover:text-white transition-colors">
                        {p.name.split(' ')[0]}
                    </span>
                    {p.role && (
                        <div className="absolute top-0 right-1 w-3 h-3 rounded-full bg-success border-2 border-background"></div>
                    )}
                </Link>
            ))}
            {overflow > 0 && (
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center bg-surface text-text-muted text-xs font-bold mb-6 flex-shrink-0">
                    +{overflow}
                </div>
            )}
        </div>
    );
}
