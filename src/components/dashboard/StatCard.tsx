import React from "react";
import { TrendingUp, TrendingDown, Users, UserPlus, CalendarCheck, UserSearch } from "lucide-react";
import type { StatCard as StatCardType } from "@/types";

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
    const Icon = ICON_MAP[card.id] ?? Users;
    const colors = COLOR_MAP[card.id];
    const isUp = card.changeType === "up";

    return (
        <div
            className={`
        flex-1 min-w-0 rounded-2xl p-5 flex flex-col gap-3
        transition-all duration-200 hover:shadow-md cursor-pointer
        ${isDark ? "bg-gray-800 border border-gray-700" : `${colors.pill} border border-transparent`}
        `}
        >
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
            <div className="flex items-end justify-between">
                <span className={`text-3xl font-bold tabular-nums ${isDark ? "text-white" : "text-gray-800"}`}>
                    {card.value}
                </span>
                <div className="flex items-center gap-1">
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
