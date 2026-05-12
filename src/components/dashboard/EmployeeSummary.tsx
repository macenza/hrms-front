// src/components/dashboard/EmployeeSummary.tsx
"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/utils/cn";

// Upgraded to handle deep dark mode contrasts
const STATUS_STYLES: Record<string, string> = {
    PAID: "bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
    PENDING: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
    OVERDUE: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
    ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    ON_LEAVE: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
    TERMINATED: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20",
    INACTIVE: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20",
};

// Extracted from backend schema
export interface RecentEmployee {
    _id: string;
    name: string;
    jobTitle?: string;
    netSalary?: number;
    status?: string;
    avatar?: string;
}

interface EmployeeSummaryProps {
    employees?: RecentEmployee[];
    isLoading?: boolean;
    disableAnimations?: boolean;
}

// Universal system avatar color generator
const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    const colors = [
        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
        'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
        'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

export default function EmployeeSummary({
    employees = [],
    isLoading = false,
    disableAnimations = false,
}: EmployeeSummaryProps) {
    
    const router = useRouter();
    // Keep auth in Redux, it's global client state
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    const displayEmployees = useMemo(() => {
        if (!employees) return [];
        return employees.slice(0, 5);
    }, [employees]);

    const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : "?";

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0 
        }).format(amount);
    };

    // Premium Skeleton Loader
    if (isLoading && employees.length === 0) {
        return (
            <div className="rounded-xl p-5 flex flex-col gap-4 h-[340px] border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none transition-colors duration-300">
                <div className="flex justify-between mb-4">
                    <div className="w-40 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                        <div className="flex items-center gap-3 w-1/3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
                            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        </div>
                        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="w-16 h-5 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "rounded-xl p-5 flex flex-col gap-4 h-full relative border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none min-h-[340px]",
                !disableAnimations && "transition-colors duration-300"
            )}
        >
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                    Recent Employees
                </h3>
                <button 
                    onClick={() => router.push('/employees')}
                    className="group flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-md"
                >
                    See All
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
            
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                <table className="w-full text-sm whitespace-nowrap">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 transition-colors">
                            {["Employee", "Role", "Salary", "Status"].map((col) => (
                                <th
                                    key={col}
                                    className="text-left pb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 transition-colors"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {displayEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8">
                                    <div className="flex flex-col items-center justify-center text-sm text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-xl p-4 mt-2 transition-colors">
                                        No employee data available.
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            displayEmployees.map((emp) => {
                                const initial = getInitials(emp.name);
                                
                                return (
                                    <tr
                                        key={emp._id}
                                        className={cn(
                                            "group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50",
                                            !disableAnimations && "transition-colors duration-150"
                                        )}
                                        onClick={() => router.push(`/employees/${emp._id}`)}
                                    >
                                        <td className="py-2.5 pr-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                                                    getAvatarColor(emp.name)
                                                )}>
                                                    {emp.avatar ? (
                                                        <img src={emp.avatar} alt={emp.name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        initial
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-700 dark:text-gray-200 transition-colors">
                                                    {emp.name}
                                                </span>
                                            </div>
                                        </td>    
                                        <td className="py-2.5 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">
                                            {emp.jobTitle || 'N/A'}
                                        </td>            
                                        <td className="py-2.5 pr-4 font-medium text-gray-700 dark:text-gray-300 transition-colors">
                                            {isAdmin ? (
                                                formatCurrency(emp.netSalary || 0)
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded w-max transition-colors" title="Requires Admin Privileges">
                                                    <Lock className="w-3 h-3" />
                                                    <span className="text-xs">Masked</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-2.5">
                                            <span className={cn(
                                                "inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border transition-colors",
                                                STATUS_STYLES[emp.status || 'ACTIVE'] || STATUS_STYLES.ACTIVE
                                            )}>
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