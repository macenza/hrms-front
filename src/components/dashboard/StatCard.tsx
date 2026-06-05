"use client";

import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Users, UserPlus, CalendarCheck, UserSearch, Loader2, Lock } from "lucide-react";
import type { StatCard as StatCardType } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/utils/cn";

const ICON_MAP: Record<string, React.ElementType> = {
    "total-employee": Users,
    "new-employee": UserPlus,
    "today-attendance": CalendarCheck,
    "total-applicant": UserSearch,
};

// Upgraded to strict Tailwind dark mode patterns for premium contrast
const COLOR_MAP: Record<string, { iconBg: string; text: string; trendBg: string }> = {
    "total-employee": { 
        iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400", 
        text: "text-blue-600 dark:text-blue-400",
        trendBg: "bg-blue-50 dark:bg-blue-500/10"
    },
    "new-employee": { 
        iconBg: "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400", 
        text: "text-green-600 dark:text-green-400",
        trendBg: "bg-green-50 dark:bg-green-500/10"
    },
    "today-attendance": { 
        iconBg: "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400", 
        text: "text-purple-600 dark:text-purple-400",
        trendBg: "bg-purple-50 dark:bg-purple-500/10"
    },
    "total-applicant": { 
        iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400", 
        text: "text-teal-600 dark:text-teal-400",
        trendBg: "bg-teal-50 dark:bg-teal-500/10"
    },
};

interface StatCardProps {
    card: StatCardType;
    statsData?: any; 
    attendanceData?: any;
    isLoading?: boolean;
    disableAnimations?: boolean;
}

export default function StatCard({
    card,
    statsData,
    attendanceData,
    isLoading = false,
    disableAnimations = false,
}: StatCardProps) {
    
    // RBAC logic relies on global client auth state
    const { user } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isAuthorized = role === 'admin' || role === 'hr';

    const Icon = ICON_MAP[card.id] ?? Users;
    const colors = COLOR_MAP[card.id] || COLOR_MAP["total-employee"]; 
    const isUp = card.changeType === "up";

    const displayValue = useMemo<string | number>(() => {
        if (!isAuthorized) return "---";
        if (!statsData && !attendanceData) return card.value; 

        switch (card.id) {
            case "total-employee":
                return statsData?.totalUsers ?? 0;
            case "new-employee":
                return statsData?.newUsers ?? 0;
            case "today-attendance":
                return attendanceData?.todayPresent ?? 0; 
            case "total-applicant":
                return 0; // Static placeholder until recruitment module is built
            default:
                return card.value;
        }
    }, [statsData, attendanceData, card.id, card.value, isAuthorized]);

    const trendValue = useMemo(() => {
        if (!isAuthorized) return "0%";
        if (!statsData && !attendanceData) return card.change;

        if (card.id === "today-attendance") {
            const total = statsData?.totalUsers || 0;
            const present = attendanceData?.todayPresent ?? 0;
            if (total > 0) {
                return `${Math.round((present / total) * 100)}% rate`;
            }
            return "0% rate";
        }
        
        if (card.id === "total-employee") {
            const total = statsData?.totalUsers || 0;
            const active = statsData?.activeUsers || 0;
            if (total > 0) {
                return `${Math.round((active / total) * 100)}% active`;
            }
        }

        if (card.id === "new-employee") {
            const total = statsData?.totalUsers || 0;
            const newUsers = statsData?.newUsers || 0;
            if (total > 0) {
                return `+${Math.round((newUsers / total) * 100)}% growth`;
            }
        }
        
        return card.change;
    }, [statsData, attendanceData, card.id, card.change, isAuthorized]);

    if (!isAuthorized) {
        return (
            <div className="flex-1 min-w-0 rounded-xl p-5 flex flex-col items-center justify-center gap-2 border bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 transition-colors duration-300">
                <Lock className="w-5 h-5 opacity-50" />
                <span className="text-xs font-bold uppercase tracking-wider opacity-70">Restricted</span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex-1 min-w-0 rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden cursor-pointer",
                "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none",
                "hover:border-blue-200 dark:hover:border-blue-900/50",
                !disableAnimations && "transition-all duration-300 hover:shadow-md dark:hover:shadow-none hover:-translate-y-0.5"
            )}
        >
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] transition-opacity duration-300">
                    <Loader2 className={cn("w-5 h-5 text-blue-500", !disableAnimations && "animate-spin")} />
                </div>
            )}

            <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors", colors.iconBg)}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold truncate text-gray-600 dark:text-gray-400 transition-colors">
                    {card.title}
                </span>
            </div>

            <div className="flex items-end justify-between mt-1">
                <span className="text-3xl font-bold tabular-nums tracking-tight text-gray-900 dark:text-gray-100 transition-colors">
                    {displayValue}
                </span>
            </div>
        </div>
    );
}