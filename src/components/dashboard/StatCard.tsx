"use client";

import React from "react";
import { TrendingUp, TrendingDown, Users, UserPlus, CalendarCheck, UserSearch, Loader2 } from "lucide-react";
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
}

export default function StatCard({ card, isDark = false }: StatCardProps) {
    // Pull both state objects from Redux
    const { stats, attendance, isLoading } = useAppSelector((state) => state.dashboard);

    const Icon = ICON_MAP[card.id] ?? Users;
    const colors = COLOR_MAP[card.id];
    const isUp = card.changeType === "up";

    // Dynamically assign the value based on the card's ID
    let displayValue: string | number = card.value; // Fallback to static data

    if (stats || attendance) {
        switch (card.id) {
            case "total-employee":
                displayValue = stats?.totalUsers ?? 0;
                break;
            case "new-employee":
                // Using active users as a placeholder until a "New Hire" filter is built
                displayValue = stats?.activeUsers ?? 0; 
                break;
            case "today-attendance":
                displayValue = attendance?.todayPresent ?? 0;
                break;
            case "total-applicant":
                // Hardcoded fallback since we haven't built an Applicant model yet
                displayValue = 24; 
                break;
        }
    }

    return (
        <div
            className={`
                flex-1 min-w-0 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden
                transition-all duration-200 hover:shadow-md cursor-pointer
                ${isDark ? "bg-gray-800 border border-gray-700" : `${colors.pill} border border-transparent`}
            `}
        >
            {/* Soft loading overlay for when data is fetching */}
            {isLoading && (!stats || !attendance) && (
                <div className={`absolute inset-0 z-10 flex items-center justify-center ${isDark ? 'bg-gray-800/80' : 'bg-white/60'}`}>
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                </div>
            )}

            {/* Icon + Label */}
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.icon}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span
                    className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-500"}`}
                >
                    {card.title}
                </span>
            </div>

            {/* Value + Change */}
            <div className="flex items-end justify-between mt-1">
                <span className={`text-3xl font-bold tabular-nums ${isDark ? "text-white" : "text-gray-800"}`}>
                    {displayValue}
                </span>
                <div className="flex items-center gap-1">
                    {/* Note: We keep the static 'change' percentage here until you track historical data on the backend */}
                    <span className={`text-sm font-semibold ${isDark ? "text-gray-200" : colors.text}`}>
                        {card.change}
                    </span>
                    {isUp
                        ? <TrendingUp className={`w-4 h-4 ${isDark ? "text-green-400" : colors.text}`} />
                        : <TrendingDown className={`w-4 h-4 ${isDark ? "text-red-400" : "text-red-500"}`} />
                    }
                </div>
            </div>
        </div>
    );
}