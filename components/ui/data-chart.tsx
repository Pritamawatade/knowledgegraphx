"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface DataPoint {
    name: string;
    value: number;
    percentage?: number;
}

interface DataChartProps {
    data: DataPoint[];
    title?: string;
    type?: 'pie' | 'bar';
    showPercentages?: boolean;
}

const COLORS = [
    '#3b82f6', // blue-500
    '#ef4444', // red-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
    '#84cc16', // lime-500
    '#ec4899', // pink-500
    '#6366f1', // indigo-500
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                <p className="font-medium text-foreground">{data.payload.name}</p>
                <p className="text-sm text-muted-foreground">
                    Value: <span className="font-medium text-foreground">{data.value.toLocaleString()}</span>
                </p>
                {data.payload.percentage && (
                    <p className="text-sm text-muted-foreground">
                        Percentage: <span className="font-medium text-foreground">{data.payload.percentage.toFixed(1)}%</span>
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const CustomLegend = ({ payload }: any) => {
    return (
        <div className="flex flex-wrap gap-2 justify-center mt-4">
            {payload.map((entry: any, index: number) => (
                <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-2 px-3 py-1"
                >
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs font-medium">{entry.value}</span>
                </Badge>
            ))}
        </div>
    );
};

export function DataChart({ data, title, type = 'pie', showPercentages = true }: DataChartProps) {
    if (!data || data.length === 0) return null;

    // Calculate percentages if not provided
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const processedData = data.map((item, index) => ({
        ...item,
        percentage: item.percentage || (item.value / total) * 100,
        fill: COLORS[index % COLORS.length],
    }));

    const renderPieChart = () => (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={processedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }: any) => `${name}: ${percentage?.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {processedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
            </PieChart>
        </ResponsiveContainer>
    );

    const renderBarChart = () => (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                />
                <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {processedData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );

    return (
        <Card className="my-4 border border-border/50 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    {type === 'pie' ? (
                        <PieChartIcon className="w-4 h-4 text-primary" />
                    ) : (
                        <BarChart3 className="w-4 h-4 text-primary" />
                    )}
                    {title || 'Data Visualization'}
                    <Badge variant="secondary" className="ml-auto text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {data.length} items
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {type === 'pie' ? renderPieChart() : renderBarChart()}

                {/* Data Summary */}
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <h4 className="text-sm font-medium text-foreground mb-2">Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="text-muted-foreground">Total Value:</span>
                            <span className="ml-2 font-medium text-foreground">{total.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Categories:</span>
                            <span className="ml-2 font-medium text-foreground">{data.length}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}