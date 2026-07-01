import React, { useState } from 'react';
import { Laptop, CheckCircle2, UserCheck, Wrench, Bookmark } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { useAssetStatusData } from '@/hooks/api/useAssetStatuses';

export interface AssetStatsData {
    total: number;
    [key: string]: number;
}

interface AssetStatsProps {
    data?: AssetStatsData | null;
    isLoading?: boolean;
}

const getStatusIcon = (statusName: string) => {
    const lower = statusName.toLowerCase();
    if (lower.includes('available')) return <CheckCircle2 size={20} />;
    if (lower.includes('assign')) return <UserCheck size={20} />;
    if (lower.includes('maintenance')) return <Wrench size={20} />;
    return <Bookmark size={20} />;
};

export default function AssetStats({ data, isLoading = false }: AssetStatsProps) {
    const { data: statusData, isLoading: isStatusLoading } = useAssetStatusData(1, 100, '', true);
    const activeStatuses = statusData?.records || [];
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const isDataLoading = isLoading || isStatusLoading;

    if (isDataLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr gap-4 animate-in fade-in duration-300">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 transition-colors relative overflow-hidden">
                        <CardContent className="p-5 flex items-start justify-between">
                            <div className="space-y-3 w-full">
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
                            </div>
                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800/50 rounded-xl animate-pulse ml-4 shrink-0" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const safeData = data || { total: 0 };
    
    // Sort keys based on sequence of status configurations, fallback to alphabetical
    const statsKeys = Object.keys(safeData).filter(key => key !== 'total');
    const sortedKeys = [...statsKeys].sort((a, b) => {
        const sA = activeStatuses.find(s => s.name.toLowerCase() === a.toLowerCase());
        const sB = activeStatuses.find(s => s.name.toLowerCase() === b.toLowerCase());
        return (sA?.sequence ?? 999) - (sB?.sequence ?? 999);
    });

    const totalCard = {
        title: "Total Assets",
        value: safeData.total || 0,
        icon: <Laptop size={20} />,
        style: {
            color: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }
    };

    const statusCards = sortedKeys.map(key => {
        const matchedConfig = activeStatuses.find(s => s.name.toLowerCase() === key.toLowerCase());
        
        let statusColor = matchedConfig?.color;
        const lower = key.toLowerCase();
        if (lower.includes('assign')) {
            statusColor = '#8b5cf6'; // Royal Violet (Differentiate from Total Assets blue)
        } else if (!statusColor) {
            if (lower.includes('available')) {
                statusColor = '#10b981'; // Emerald Green
            } else if (lower.includes('maintenance')) {
                statusColor = '#f59e0b'; // Amber Orange
            } else {
                statusColor = '#64748b'; // Slate fallback
            }
        }

        return {
            title: key,
            value: safeData[key] || 0,
            icon: getStatusIcon(key),
            style: {
                color: statusColor,
                backgroundColor: `${statusColor}1a` // Hex opacity 10%
            }
        };
    });

    const allCards = [totalCard, ...statusCards];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr gap-4 animate-in fade-in duration-300">
            {allCards.map((stat, index) => {
                const percentage = stat.title !== "Total Assets" && safeData.total > 0
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
                        
                        <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full min-h-[110px]">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1 transition-colors">
                                        {stat.title}
                                    </p>
                                    <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                                        {stat.value}
                                    </p>
                                </div>
                                <div 
                                    className="p-2.5 rounded-xl shrink-0 shadow-sm dark:shadow-none transition-all duration-300 group-hover:scale-110"
                                    style={stat.style}
                                >
                                    {stat.icon}
                                </div>
                            </div>

                            {/* visual metric helper */}
                            {stat.title !== "Total Assets" ? (
                                <div className="mt-4 space-y-1.5">
                                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1 overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                            style={{ 
                                                backgroundColor: stat.style.color, 
                                                width: `${percentage}%` 
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                        {percentage}% of inventory
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-4 space-y-1.5">
                                    <div className="w-full bg-blue-100/50 dark:bg-blue-950/20 rounded-full h-1 overflow-hidden">
                                        <div className="h-full rounded-full bg-blue-550 bg-blue-500 w-full" />
                                    </div>
                                    <p className="text-[10px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                                        100% cataloged assets
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