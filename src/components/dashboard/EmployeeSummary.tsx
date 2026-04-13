"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { AVATAR_COLORS } from "@/lib/data";
import { useAppSelector } from "@/store/hooks";

// Architect Note: Merged your Payroll statuses with standard Employee statuses
const STATUS_STYLES: Record<string, string> = {
    // Payroll-style
    PAID: "bg-green-50 text-green-600 border-green-200",
    PENDING: "bg-orange-50 text-orange-600 border-orange-200",
    OVERDUE: "bg-red-50 text-red-600 border-red-200",
    // Standard Employee-style
    ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200",
    ON_LEAVE: "bg-blue-50 text-blue-600 border-blue-200",
    TERMINATED: "bg-gray-50 text-gray-600 border-gray-200",
};

interface EmployeeSummaryProps {
    isDark?: boolean;
    disableAnimations?: boolean;
}

export default function EmployeeSummary({
    isDark = false,
    disableAnimations = false,
}: EmployeeSummaryProps) {
    const router = useRouter();
    
    // Pull stats and global auth state
    const { stats, isLoading } = useAppSelector((state) => state.dashboard);
    const { user } = useAppSelector((state) => state.auth);

    // Advanced RBAC: Only Admins can view salaries. HR gets a masked view.
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    // Performance: Memoize and slice the array to prevent dashboard stretching
    const displayEmployees = useMemo(() => {
        if (!stats?.recentEmployees) return [];
        return stats.recentEmployees.slice(0, 5);
    }, [stats?.recentEmployees]);

    // Formatters
    const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : "?";
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0 // Cleaner for dashboard summaries
        }).format(amount);
    };

    // UX: Table Skeleton to prevent layout shift
    if (isLoading && !stats) {
        return (
            <div className={`rounded-2xl p-5 flex flex-col gap-4 h-[340px] border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <div className="flex justify-between mb-4">
                    <div className="w-40 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                {/* Skeleton Rows */}
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2.5">
                        <div className="flex items-center gap-3 w-1/3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
                            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            className={`
                rounded-2xl p-5 flex flex-col gap-4 h-full relative border
                ${disableAnimations ? "" : "transition-colors duration-300"}
                ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100 shadow-sm"}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    Recent Employees
                </h3>
                <button 
                    onClick={() => router.push('/employees')}
                    className="group flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md"
                >
                    See All
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className={`border-b ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                            {["Employee", "Role", "Salary", "Status"].map((col) => (
                                <th
                                    key={col}
                                    className={`text-left pb-2 text-[11px] font-bold uppercase tracking-wider ${isDark ? "text-gray-500" : "text-gray-400"}`}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-transparent">
                        {displayEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8">
                                    <div className="flex flex-col items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl p-4 mt-2">
                                        No employee data available.
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            displayEmployees.map((emp) => {
                                const initial = getInitials(emp.name);
                                const colorClass = AVATAR_COLORS[initial as keyof typeof AVATAR_COLORS] ?? "bg-gray-200 text-gray-600";
                                
                                return (
                                    <tr
                                        key={emp._id}
                                        className={`
                                            group cursor-pointer
                                            ${disableAnimations ? "" : "transition-colors duration-150"}
                                            ${isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"}
                                        `}
                                        onClick={() => router.push(`/employees/${emp._id}`)}
                                    >
                                        {/* Avatar + Name */}
                                        <td className="py-2.5 pr-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorClass}`}>
                                                    {emp.avatar ? (
                                                        <img src={emp.avatar} alt={emp.name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        initial
                                                    )}
                                                </div>
                                                <span className={`font-medium whitespace-nowrap ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                                                    {emp.name}
                                                </span>
                                            </div>
                                        </td>    

                                        {/* Job Title */}
                                        <td className={`py-2.5 pr-4 text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                            {emp.jobTitle}
                                        </td>            

                                        {/* Salary - RBAC Protected */}
                                        <td className={`py-2.5 pr-4 font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                                            {isAdmin ? (
                                                formatCurrency(emp.netSalary || 0)
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded w-max" title="Requires Admin Privileges">
                                                    <Lock className="w-3 h-3" />
                                                    <span className="text-xs">Masked</span>
                                                </div>
                                            )}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="py-2.5">
                                            <span className={`
                                                inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border
                                                ${STATUS_STYLES[emp.status] || STATUS_STYLES.ACTIVE}
                                            `}>
                                                {emp.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}