"use client";

import React, { useMemo, useState } from "react";
import { Users, UserCheck, UserSearch, Briefcase, ArrowRight, Loader2, Lock, CalendarDays, UserX } from "lucide-react";
import type { StatCard as StatCardType } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/utils/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ICON_MAP: Record<string, React.ElementType> = {
    "total-employee": Users,
    "today-attendance": UserCheck,
    "total-applicant": UserSearch,
    "open-positions": Briefcase,
    "pending-leaves": CalendarDays,
    "inactive-users": UserX,
};

// Colors matching the image exactly while adhering to premium dark mode and themes of hrms
const COLOR_MAP: Record<string, { iconBg: string; text: string; linkColor: string; hexColor: string }> = {
    "total-employee": { 
        iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400", 
        text: "text-blue-600 dark:text-blue-400",
        linkColor: "text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300",
        hexColor: "#3b82f6"
    },
    "today-attendance": { 
        iconBg: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400", 
        text: "text-green-600 dark:text-green-400",
        linkColor: "text-green-600 dark:text-green-400",
        hexColor: "#10b981"
    },
    "total-applicant": { 
        iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400", 
        text: "text-purple-600 dark:text-purple-400",
        linkColor: "text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300",
        hexColor: "#8b5cf6"
    },
    "open-positions": { 
        iconBg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400", 
        text: "text-cyan-600 dark:text-cyan-400",
        linkColor: "text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300",
        hexColor: "#06b6d4"
    },
    "pending-leaves": { 
        iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400", 
        text: "text-amber-600 dark:text-amber-400",
        linkColor: "text-amber-500 hover:text-amber-650 dark:text-amber-400 dark:hover:text-amber-300",
        hexColor: "#f59e0b"
    },
    "inactive-users": { 
        iconBg: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-450", 
        text: "text-gray-600 dark:text-gray-450",
        linkColor: "text-gray-500 hover:text-gray-600 dark:text-gray-450 dark:hover:text-gray-300",
        hexColor: "#6b7280"
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
    const router = useRouter();
    const [isHovered, setIsHovered] = useState(false);
    
    // RBAC logic relies on global client auth state
    const { user } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isAuthorized = role === 'admin' || role === 'hr';

    const Icon = ICON_MAP[card.id] ?? Users;
    const colors = COLOR_MAP[card.id] || COLOR_MAP["total-employee"]; 

    const displayValue = useMemo<string | number>(() => {
        if (!isAuthorized) return "---";
        if (!statsData && !attendanceData) return card.value; 

        switch (card.id) {
            case "total-employee":
                return statsData?.totalUsers ?? card.value;
            case "today-attendance":
                return attendanceData?.todayPresent ?? card.value; 
            case "total-applicant":
                return statsData?.totalApplicants ?? card.value;
            case "open-positions":
                return statsData?.openPositions ?? card.value;
            default:
                return card.value;
        }
    }, [statsData, attendanceData, card.id, card.value, isAuthorized]);

    const trendValue = useMemo(() => {
        if (!isAuthorized) return "0%";
        if (card.id === "today-attendance") {
            const total = statsData?.totalUsers ?? 128;
            const present = attendanceData?.todayPresent ?? 96;
            if (total > 0) {
                return `${Math.round((present / total) * 100)}%`;
            }
            return "75%";
        }
        return card.change;
    }, [statsData, attendanceData, card.id, card.change, isAuthorized]);

    const handleCardClick = () => {
        if (card.id === "total-employee") {
            router.push("/employees");
        } else if (card.id === "today-attendance") {
            router.push("/attendance");
        } else if (card.id === "total-applicant") {
            router.push("/recruitment#applicants-table");
        } else if (card.id === "open-positions") {
            router.push("/recruitment");
        }
    };

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
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                "flex-1 min-w-0 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden select-none cursor-pointer border group",
                "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-200/80 dark:border-gray-800 shadow-sm dark:shadow-none",
                !disableAnimations && "transition-all duration-300"
            )}
            style={{
                borderColor: !disableAnimations && isHovered ? colors.hexColor : undefined,
                transform: !disableAnimations && isHovered ? 'translateY(-3px)' : 'translateY(0px)',
                boxShadow: !disableAnimations && isHovered ? `0 16px 32px -12px ${colors.hexColor}35` : undefined
            }}
        >
            {/* Left-side colored accent stripe */}
            <div
                className="absolute top-0 left-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-300 opacity-50 group-hover:opacity-100"
                style={{ backgroundColor: colors.hexColor }}
            />

            {/* Soft radial glow in corner */}
            <div
                className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-[0.07] group-hover:opacity-[0.14] transition-opacity duration-500"
                style={{ backgroundColor: colors.hexColor }}
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-[1px] transition-opacity duration-300 rounded-2xl">
                    <Loader2 className={cn("w-5 h-5", !disableAnimations && "animate-spin")} style={{ color: colors.hexColor }} />
                </div>
            )}

            {/* Icon + Title row */}
            <div className="flex items-center gap-2.5 sm:gap-3">
                <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md transition-all duration-300 hidden sm:flex",
                    colors.iconBg
                )}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold truncate text-gray-500 dark:text-gray-400 tracking-wide uppercase">
                    {card.title}
                </span>
            </div>

            {/* Value + change row */}
            <div className="flex items-end justify-between gap-2">
                <span className="text-3xl sm:text-4xl font-black tabular-nums tracking-tighter text-gray-900 dark:text-gray-50 leading-none">
                    {displayValue}
                </span>
                {card.id === "today-attendance" ? (
                    <span className="text-[10px] font-bold pb-1 transition-colors" style={{ color: colors.hexColor }}>
                        {trendValue} present
                    </span>
                ) : (
                    <Link
                        href={
                            card.id === "total-employee"
                                ? "/employees"
                                : card.id === "total-applicant"
                                ? "/recruitment#applicants-table"
                                : card.id === "open-positions"
                                ? "/recruitment"
                                : "#"
                        }
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "text-[10px] font-bold flex items-center gap-0.5 pb-1 transition-all group/link opacity-70 hover:opacity-100",
                            colors.linkColor
                        )}
                    >
                        <span>{card.change}</span>
                        <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover/link:translate-x-0.5" />
                    </Link>
                )}
            </div>
        </div>
    );
}