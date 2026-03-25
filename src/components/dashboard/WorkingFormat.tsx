import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { WORKING_FORMAT } from "@/lib/data";

interface WorkingFormatProps {
    isDark?: boolean;
}

export default function WorkingFormat({ isDark = false }: WorkingFormatProps) {
    const total = WORKING_FORMAT.reduce((acc, s) => acc + s.count, 0);

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
                    Working Format
                </h3>
                <button className="text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">
                    See All
                </button>
            </div>

            {/* Chart + Legend */}
            <div className="flex items-center gap-6">
                {/* Donut */}
                <div className="relative w-36 h-36 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={WORKING_FORMAT}
                                dataKey="count"
                                nameKey="label"
                                cx="50%"
                                cy="50%"
                                innerRadius={42}
                                outerRadius={65}
                                paddingAngle={3}
                                startAngle={90}
                                endAngle={-270}
                            >
                                {WORKING_FORMAT.map((segment) => (
                                    <Cell key={segment.label} fill={segment.color} stroke="transparent" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: isDark ? "#1F2937" : "#fff",
                                    border: isDark ? "1px solid #374151" : "1px solid #E2E8F0",
                                    borderRadius: 10,
                                    fontSize: 12,
                                    color: isDark ? "#E5E7EB" : "#374151",
                                }}
                                formatter={(value, name) => [
                                    `${value} employees`,
                                    name,
                                ]}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                            {total}
                        </span>
                        <span className={`text-[10px] ${isDark ? "text-gray-400" : "text-gray-400"}`}>
                            Total
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3">
                    {WORKING_FORMAT.map((segment) => (
                        <div key={segment.label} className="flex items-center gap-2.5">
                            <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: segment.color }}
                            />
                            <span
                                className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}
                            >
                                <span className="font-semibold">{segment.count}</span>{" "}
                                {segment.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}