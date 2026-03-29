"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { WORKING_FORMAT } from "@/lib/data";

interface WorkingFormatProps {
    isDark?: boolean;
}

export default function WorkingFormat({ isDark = false }: WorkingFormatProps) {
    const total = WORKING_FORMAT.reduce((acc, s) => acc + s.count, 0);

    return (
        <div
            className={`
                rounded-2xl p-5 flex flex-col gap-4 h-full min-w-0
                transition-colors duration-300 shadow-sm
                ${isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-100"}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                    Working Format
                </h3>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md">
                    See All
                </button>
            </div>

            {/* Chart + Legend */}
            <div className="flex items-center gap-6 mt-2">
                
                {/* Donut Chart */}
                <div className="relative w-36 h-36 shrink-0">
                    <PieChart width={144} height={144}>
                        <Pie
                            data={WORKING_FORMAT}
                            dataKey="count"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={70}
                            paddingAngle={3}
                            startAngle={90}
                            endAngle={-270}
                            stroke="none"
                        >
                            {WORKING_FORMAT.map((segment) => (
                                <Cell 
                                    key={segment.label} 
                                    fill={segment.color} 
                                    style={{ outline: 'none' }} 
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            contentStyle={{
                                background: isDark ? "#1F2937" : "#fff",
                                border: isDark ? "1px solid #374151" : "1px solid #E2E8F0",
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 600,
                                color: isDark ? "#E5E7EB" : "#111827",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                            }}
                            formatter={(value: any) => [
                                `${value ?? 0} employees`,
                            ]}
                        />
                    </PieChart>

                    {/* Center Total Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className={`text-xl font-black leading-none mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                            {total}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Total
                        </span>
                    </div>
                </div>

                {/* Legend List */}
                <div className="flex flex-col gap-3 flex-1">
                    {WORKING_FORMAT.map((segment) => (
                        <div key={segment.label} className="flex items-center gap-2.5">
                            <span
                                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                                style={{ backgroundColor: segment.color }}
                            />
                            <span
                                className={`text-sm flex items-center gap-1.5 ${isDark ? "text-gray-300" : "text-gray-600"}`}
                            >
                                <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {segment.count}
                                </span>{" "}
                                <span className="text-xs font-medium">{segment.label}</span>
                            </span>
                        </div>
                    ))}
                </div>
                
            </div>
        </div>
    );
}