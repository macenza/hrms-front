"use client";

import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Users, UserPlus, CalendarCheck, UserSearch, Loader2, Lock } from "lucide-react";
import type { StatCard as StatCardType } from "@/types";
import { useAppSelector } from "@/store/hooks";

const ICON_MAP: Record<string, React.ElementType> = {
    "total-employee": Users,
    "new-employee": UserPlus,
    "today-attendance": CalendarCheck,
    "total-applicant": UserSearch,
};

// Colour mappings per card id
const COLOR_MAP: Record<string, { pill: string; icon: string; text: string }> = {
    "total-employee": { pill: "bg-blue-50", icon: "bg-blue-100 text-blue-500", text: "text-blue-600" },
    "new-employee": { pill: "bg-green-50", icon: "bg-green-100 text-green-500", text: "text-green-600" },
    "today-attendance": { pill: "bg-purple-50", icon: "bg-purple-100 text-purple-500", text: "text-purple-600" },
    "total-applicant": { pill: "bg-teal-50", icon: "bg-teal-100 text-teal-500", text: "text-teal-600" },
};

interface StatCardProps {
    card: StatCardType;
    isDark?: boolean;
    disableAnimations?: boolean;
}

export default function StatCard({
    card,
    isDark = false,
    disableAnimations = false,
}: StatCardProps) {
    // Pull global state
    const { stats, attendance, isLoading } = useAppSelector((state) => state.dashboard);
    const { user } = useAppSelector((state) => state.auth);

    // Component-level RBAC check
    const role = user?.role?.toLowerCase() || 'employee';
    const isAuthorized = role === 'admin' || role === 'hr';

    const Icon = ICON_MAP[card.id] ?? Users;
    const colors = COLOR_MAP[card.id] || COLOR_MAP["total-employee"]; // Added fallback
    const isUp = card.changeType === "up";

    // Performance: Memoize the derived display value to prevent switch statement execution on every render
    const displayValue = useMemo<string | number>(() => {
        // If unauthorized, don't even calculate
        if (!isAuthorized) return "---";

        if (!stats && !attendance) return card.value; // Fallback to static props

        switch (card.id) {
            case "total-employee":
                return stats?.totalUsers ?? 0;
            case "new-employee":
                // Architect Note: Replace with actual new hire data when backend supports it
                return stats?.activeUsers ?? 0;
            case "today-attendance":
                return attendance?.todayPresent ?? 0;
            case "total-applicant":
                // Architect Note: Hardcoded fallback until Applicant model is built
                return 24;
            default:
                return card.value;
        }
    }, [stats, attendance, card.id, card.value, isAuthorized]);

    // Failsafe UX: If an employee somehow views this component, show a locked state
    if (!isAuthorized) {
        return (
            <div className={`flex-1 min-w-0 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                <Lock className="w-5 h-5 opacity-50" />
                <span className="text-xs font-medium uppercase tracking-wider opacity-70">Restricted</span>
            </div>
        );
    }

    return (
        <div
            className={`
                flex-1 min-w-0 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden
                ${disableAnimations ? "hover:shadow-md" : "transition-all duration-200 hover:shadow-md"}
                cursor-pointer border
                ${isDark ? "bg-gray-800 border-gray-700" : `${colors.pill} border-transparent`}
            `}
        >
            {/* Soft loading overlay for when data is fetching */}
            {isLoading && (!stats || !attendance) && (
                <div className={`absolute inset-0 z-10 flex items-center justify-center ${isDark ? 'bg-gray-800/80' : 'bg-white/60'}`}>
                    <Loader2
                        className={`w-5 h-5 text-blue-500 ${disableAnimations ? "" : "animate-spin"}`}
                    />
                </div>
            )}
            
            {/* Icon + Label */}
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors.icon}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span
                    className={`text-sm font-medium truncate ${isDark ? "text-gray-300" : "text-gray-600"}`}
                >
                    {card.title}
                </span>
            </div>
            
            {/* Value + Change */}
            <div className="flex items-end justify-between mt-1">
                <span className={`text-3xl font-bold tabular-nums ${isDark ? "text-white" : "text-gray-800"}`}>
                    {displayValue}
                </span>
                
                <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-900/50 px-2 py-1 rounded-lg">
                    <span className={`text-xs font-bold ${isDark ? "text-gray-200" : colors.text}`}>
                        {card.change}
                    </span>
                    {isUp
                        ? <TrendingUp className={`w-3.5 h-3.5 ${isDark ? "text-green-400" : colors.text}`} />
                        : <TrendingDown className={`w-3.5 h-3.5 ${isDark ? "text-red-400" : "text-red-500"}`} />
                    }
                </div>
            </div>
        </div>
    );
}