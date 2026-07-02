import React, { useState } from 'react';
import { Users, CheckCircle2, Hourglass, XCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export interface AttendanceStatsData {
    total: number;
    present: number;
    absent: number;
    late: number;
    onLeave: number;
    halfDay: number;
}

interface AttendanceStatsProps {
    data?: AttendanceStatsData | null;
    isLoading?: boolean;
}

export default function AttendanceStats({ data, isLoading = false }: AttendanceStatsProps) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in duration-300">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 transition-colors relative overflow-hidden">
                        <CardContent className="p-5 flex items-start justify-between">
                            <div className="space-y-3 w-full">
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
                            </div>
                            <div className="h-10 w-10 bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse ml-4 shrink-0" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const safeData = data || { total: 0, present: 0, absent: 0, late: 0, onLeave: 0, halfDay: 0 };

    const cards = [
        {
            title: "Total Roster",
            value: safeData.total,
            icon: <Users size={18} />,
            style: {
                color: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)'
            },
            helperText: "Active employees today"
        },
        {
            title: "Present",
            value: safeData.present,
            icon: <CheckCircle2 size={18} />,
            style: {
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
            },
            helperText: "Checked-in employees"
        },
        {
            title: "Half Days",
            value: safeData.halfDay,
            icon: <Hourglass size={18} />,
            style: {
                color: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)'
            },
            helperText: "Partial shift worked"
        },
        {
            title: "Absentees",
            value: safeData.absent,
            icon: <XCircle size={18} />,
            style: {
                color: '#f43f5e',
                backgroundColor: 'rgba(244, 63, 94, 0.1)'
            },
            helperText: "No check-in recorded"
        },
        {
            title: "On Leave",
            value: safeData.onLeave,
            icon: <Calendar size={18} />,
            style: {
                color: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)'
            },
            helperText: "Approved time off"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-in fade-in duration-300">
            {cards.map((stat, index) => {
                const percentage = stat.title !== "Total Roster" && safeData.total > 0
                    ? Math.round(((stat.value as number) / safeData.total) * 100)
                    : 0;

                const isHovered = hoveredIdx === index;

                return (
                    <Card 
                        key={index} 
                        onMouseEnter={() => setHoveredIdx(index)}
                        onMouseLeave={() => setHoveredIdx(null)}
                        className="border border-gray-200/80 dark:border-gray-800/60 transition-all duration-300 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none group relative overflow-hidden rounded-2xl cursor-pointer"
                        style={{
                            borderColor: isHovered ? stat.style.color : undefined,
                            transform: isHovered ? 'translateY(-4px)' : 'translateY(0px)',
                            boxShadow: isHovered ? `0 12px 30px -10px ${stat.style.color}45` : undefined
                        }}
                    >
                        {/* Status-colored top accent border */}
                        <div 
                            className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-300 opacity-60 group-hover:opacity-100"
                            style={{ backgroundColor: stat.style.color }}
                        />
                        
                        {/* Glowing status-colored background accent */}
                        <div 
                            className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                            style={{ backgroundColor: stat.style.color }}
                        />
                        
                        <CardContent className="p-4 relative z-10 flex flex-col justify-between h-full min-h-[110px]">
                            <div className="flex items-start justify-between gap-1">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 transition-colors truncate">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                                        {stat.value}
                                    </p>
                                </div>
                                <div 
                                    className="p-2 rounded-xl shrink-0 shadow-sm dark:shadow-none transition-all duration-300 group-hover:scale-110"
                                    style={stat.style}
                                >
                                    {stat.icon}
                                </div>
                            </div>

                            {/* visual metric helper */}
                            {stat.title !== "Total Roster" ? (
                                <div className="mt-3 space-y-1">
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                            style={{ 
                                                backgroundColor: stat.style.color, 
                                                width: `${percentage}%` 
                                            }}
                                        />
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">
                                        {percentage}% of roster
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-3 space-y-1">
                                    <div className="w-full bg-blue-100/50 dark:bg-blue-950/20 rounded-full h-1 overflow-hidden">
                                        <div className="h-full rounded-full bg-blue-500 w-full" />
                                    </div>
                                    <p className="text-[9px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider truncate">
                                        100% active staff
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
