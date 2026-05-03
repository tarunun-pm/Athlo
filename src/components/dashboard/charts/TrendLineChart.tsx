'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TrendLineChartProps {
    data: any[];
    xKey: string;
    yKey: string;
    lineColor?: string;
    height?: number;
}

export default function TrendLineChart({ data, xKey, yKey, lineColor = '#2563EB', height = 250 }: TrendLineChartProps) {
    const isEmpty = !data || data.length === 0;

    if (isEmpty) {
        return (
            <div className="flex items-center justify-center text-text-muted text-sm" style={{ height }}>
                No trend data available
            </div>
        );
    }

    return (
        <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        itemStyle={{ color: lineColor }}
                        cursor={{ stroke: '#2A2F3A', strokeWidth: 1 }}
                    />
                    <Line 
                        type="monotone" 
                        dataKey={yKey} 
                        stroke={lineColor} 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#11141A' }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: lineColor }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
