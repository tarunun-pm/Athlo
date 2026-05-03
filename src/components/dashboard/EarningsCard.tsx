import { Wallet, TrendingUp } from 'lucide-react';

export default function EarningsCard({ total, monthly, count }: { total: number, monthly: number, count: number }) {
    return (
        <div className="card p-6 bg-[#161922] border-transparent relative overflow-hidden group">
            {/* Background glow effect */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-success/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-success/10 transition-all duration-500"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20">
                    <Wallet size={24} />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-1">Available Payout</span>
                    <span className="text-xs font-medium text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full">
                        <TrendingUp size={12} /> +₹{monthly.toLocaleString('en-IN')} this month
                    </span>
                </div>
            </div>
            
            <div className="relative z-10 mb-2">
                <span className="text-4xl font-syne font-extrabold text-white tracking-tight">
                    ₹{total.toLocaleString('en-IN')}
                </span>
            </div>
            
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/50 relative z-10">
                <span className="text-sm text-text-secondary">Based on {count} completed sessions</span>
                <button className="text-xs font-bold text-success hover:underline">Withdraw</button>
            </div>
        </div>
    );
}
