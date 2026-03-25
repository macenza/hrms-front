import React from "react";
import { EMPLOYEE_SUMMARY, AVATAR_COLORS } from "@/lib/data";
import type { EmployeeSummaryRow } from "@/types";

// Status badge styles
const STATUS_STYLES: Record<EmployeeSummaryRow["status"], string> = {
    PAID: "bg-green-50 text-green-600 border border-green-200",
    PENDING: "bg-orange-50 text-orange-500 border border-orange-200",
    OVERDUE: "bg-red-50 text-red-600 border border-red-200",
};

interface EmployeeSummaryProps {
    isDark?: boolean;
}

export default function EmployeeSummary({ isDark = false }: EmployeeSummaryProps) {
    return (
        <div
            className={`
        rounded-2xl p-5 flex flex-col gap-4 h-full
        transition-colors duration-300
        ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white"}
        `}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-800"}`}>
                    Employee Summary
                </h3>
                <button className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">
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
                        {EMPLOYEE_SUMMARY.map((emp) => (
                            <tr
                                key={emp.id}
                                className={`
                    group transition-colors duration-150
                    ${isDark ? "hover:bg-gray-700/50" : "hover:bg-slate-50"}
                `}
                            >
                                {/* Avatar + Name */}
                                <td className="py-3 pr-4">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        text-xs font-semibold shrink-0
                        ${AVATAR_COLORS[emp.avatar] ?? "bg-gray-200 text-gray-600"}
                        `}
                                        >
                                            {emp.avatar}
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
                                    ${emp.netSalary.toFixed(2)}
                                </td>

                                {/* Status Badge */}
                                <td className="py-3">
                                    <span
                                        className={`
                        inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${STATUS_STYLES[emp.status]}
                    `}
                                    >
                                        {emp.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}