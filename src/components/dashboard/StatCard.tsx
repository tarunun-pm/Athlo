import { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: string;
        label: string;
        isPositive: boolean;
    };
    gradient?: boolean;
}

export default function StatCard({ title, value, icon, trend, gradient }: StatCardProps) {
    return (
        <div className={`card p-6 border-transparent shadow-[0_8px_30px_rgba(0,0,0,0.5)] ${gradient ? 'bg-gradient-to-br from-surface to-background' : 'bg-[#1C1F26]'} relative overflow-hidden group`}>
            {gradient && <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all duration-500 group-hover:bg-primary/10"></div>}
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex flex-col items-end`}>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${trend.isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                            {trend.isPositive ? '↑' : '↓'} {trend.value}
                        </span>
                        <span className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">{trend.label}</span>
                    </div>
                )}
            </div>
            
            <div className="relative z-10">
                <h3 className="text-3xl font-syne font-bold text-white mb-1 group-hover:text-primary transition-colors">{value}</h3>
                <p className="text-sm text-text-secondary font-medium">{title}</p>
            </div>
        </div>
    );
}
