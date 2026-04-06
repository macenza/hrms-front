"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AVATAR_COLORS } from "@/lib/data";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardStats } from "@/store/dashboardSlice";

// Status badge styles
const STATUS_STYLES: Record<"PAID" | "PENDING" | "OVERDUE", string> = {
    PAID: "bg-green-50 text-green-600 border border-green-200",
    PENDING: "bg-orange-50 text-orange-500 border border-orange-200",
    OVERDUE: "bg-red-50 text-red-600 border border-red-200",
};

interface EmployeeSummaryProps {
    isDark?: boolean;
}

export default function EmployeeSummary({ isDark = false }: EmployeeSummaryProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    
    // Pull the stats and loading state from Redux
    const { stats, isLoading } = useAppSelector((state) => state.dashboard);

    useEffect(() => {
        // Only fetch if we don't already have the stats to prevent infinite loops
        if (!stats) {
            dispatch(fetchDashboardStats());
        }
    }, [dispatch, stats]);

    // Extract initials for the avatar fallback
    const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : "?";

    // Show a loading skeleton/spinner while fetching
    if (isLoading && !stats) {
        return (
            <div className={`rounded-2xl p-5 flex items-center justify-center h-full min-h-[300px] transition-colors duration-300 ${isDark ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    // Default to an empty array if data isn't available yet
    const employees = stats?.recentEmployees || [];

    return (
        <div
            className={`
                rounded-2xl p-5 flex flex-col gap-4 h-full
                transition-colors duration-300
                ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white shadow-sm"}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    Employee Summary
                </h3>
                <button 
                    onClick={() => router.push('/employees')}
                    className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
                >
                    See All
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            {["Name", "Job Title", "Net Salary", "Status"].map((col) => (
                                <th
                                    key={col}
                                    className={`
                                        text-left pb-2 text-xs font-medium
                                        ${isDark ? "text-gray-400" : "text-gray-400"}
                                    `}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-transparent">
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-6 text-sm text-gray-400">
                                    No employee data available.
                                </td>
                            </tr>
                        ) : (
                            employees.map((emp) => {
                                const initial = getInitials(emp.name);
                                const colorClass = AVATAR_COLORS[initial as keyof typeof AVATAR_COLORS] ?? "bg-gray-200 text-gray-600";

                                return (
                                    <tr
                                        key={emp._id}
                                        className={`
                                            group transition-colors duration-150 cursor-pointer
                                            ${isDark ? "hover:bg-gray-700/50" : "hover:bg-slate-50"}
                                        `}
                                        onClick={() => router.push(`/employees/${emp._id}`)}
                                    >
                                        {/* Avatar + Name */}
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className={`
                                                        w-8 h-8 rounded-full flex items-center justify-center
                                                        text-xs font-semibold shrink-0
                                                        ${colorClass}
                                                    `}
                                                >
                                                    {emp.avatar ? (
                                                        <img src={emp.avatar} alt={emp.name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        initial
                                                    )}
                                                </div>
                                                <span className={`font-medium whitespace-nowrap ${isDark ? "text-gray-100" : "text-gray-700"}`}>
                                                    {emp.name}
                                                </span>
                                            </div>
                                        </td>
                                        
                                        {/* Job Title */}
                                        <td className={`py-3 pr-4 ${isDark ? "text-gray-300" : "text-gray-500"}`}>
                                            {emp.jobTitle}
                                        </td>
                                        
                                        {/* Salary */}
                                        <td className={`py-3 pr-4 font-medium ${isDark ? "text-gray-100" : "text-gray-700"}`}>
                                            ${emp.netSalary ? emp.netSalary.toFixed(2) : "0.00"}
                                        </td>

                                        {/* Status Badge */}
                                        <td className="py-3">
                                            <span
                                                className={`
                                                    inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold
                                                    ${STATUS_STYLES[emp.status] || STATUS_STYLES.PENDING}
                                                `}
                                            >
                                                {emp.status || 'PENDING'}
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