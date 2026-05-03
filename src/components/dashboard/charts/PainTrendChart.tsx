'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PainTrendChartProps {
    data: any[];
    xKey: string;
    yKey: string;
    height?: number;
}

export default function PainTrendChart({ data, xKey, yKey, height = 250 }: PainTrendChartProps) {
    const isEmpty = !data || data.length === 0;

    if (isEmpty) {
        return (
            <div className="flex items-center justify-center text-text-muted text-sm" style={{ height }}>
                No pain records available
            </div>
        );
    }

    return (
        <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2F3A" vertical={false} />
                    <XAxis 
                        dataKey={xKey} 
                        stroke="#808B9B" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis 
                        stroke="#808B9B" 
                        fontSize={12} 
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 10]}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#11141A', borderColor: '#2A2F3A', borderRadius: '8px', color: '#fff' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey={yKey} 
                        stroke="#F59E0B" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPain)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
