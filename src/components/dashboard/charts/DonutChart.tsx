'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
    data: { name: string; value: number; color: string }[];
    centerLabel?: {
        value: string | number;
        label: string;
    };
}

export default function DonutChart({ data, centerLabel }: DonutChartProps) {
    const isEmpty = data.length === 0 || data.every(d => d.value === 0);

    return (
        <div className="h-full w-full relative min-h-[200px] flex flex-col items-center">
            {isEmpty ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted font-medium text-sm">
                    No data available
                </div>
            ) : (
                <div className="relative w-full h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                stroke="transparent"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#11141A', borderColor: '#2A2F3A', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {centerLabel && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-xl font-bold text-white">{centerLabel.value}</span>
                            <span className="text-xs text-text-muted mt-1 uppercase tracking-wider">{centerLabel.label}</span>
                        </div>
                    )}
                </div>
            )}
            
            <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-4 px-2">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                        <span className="text-text-secondary">{d.name} <span className="text-white font-medium ml-1">{d.value}</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
}
