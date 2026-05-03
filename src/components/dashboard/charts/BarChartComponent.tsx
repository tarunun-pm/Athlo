'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BarChartComponentProps {
    data: any[];
    xKey: string;
    yKey: string;
    barColor?: string;
    height?: number;
}

export default function BarChartComponent({ data, xKey, yKey, barColor = '#10B981', height = 250 }: BarChartComponentProps) {
    const isEmpty = !data || data.length === 0;

    if (isEmpty) {
        return (
            <div className="flex items-center justify-center text-text-muted text-sm" style={{ height }}>
                No data available
            </div>
        );
    }

    return (
        <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        tickFormatter={(v) => v === 0 ? '0' : v}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#11141A', borderColor: '#2A2F3A', borderRadius: '8px', color: '#fff' }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    />
                    <Bar dataKey={yKey} fill={barColor} radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || barColor} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
