import { Star } from 'lucide-react';

interface RatingItem {
    id: string;
    name: string;
    avatar: string; // initials
    rating: number;
    comment?: string;
}

export default function RatingList({ items }: { items: RatingItem[] }) {
    if (!items || items.length === 0) {
        return <div className="text-sm text-text-muted h-24 flex items-center justify-center">No ratings yet</div>;
    }

    return (
        <div className="space-y-4">
            {items.map(item => (
                <div key={item.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-surface/50 border border-transparent hover:border-border transition-colors">
                    <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center bg-surface border border-border text-xs font-bold font-syne text-white">
                        {item.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-white truncate pr-2">{item.name}</span>
                            <div className="flex items-center gap-0.5 shrink-0 bg-[#1C1F26] px-2 py-0.5 rounded-full border border-border">
                                <span className="text-xs font-bold text-white mr-1">{Number(item.rating).toFixed(1)}</span>
                                <Star size={10} className="text-warning fill-warning" />
                            </div>
                        </div>
                        {item.comment && (
                            <p className="text-xs text-text-secondary line-clamp-2 mt-1">{item.comment}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
