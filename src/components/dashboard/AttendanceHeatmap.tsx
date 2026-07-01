// src/components/dashboard/AttendanceHeatmap.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Calendar, Users, AlertCircle, Clock, Ban, CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { DailyAttendance, DashboardAttendance } from "@/store/dashboardSlice";
import { cn } from "@/utils/cn";

interface AttendanceHeatmapProps {
    attendanceData?: DashboardAttendance;
    isLoading?: boolean;
}

interface MockEmployeeLog {
    id: string;
    name: string;
    avatar?: string;
    department: string;
    status: "Late" | "Absent" | "On Leave";
    time?: string;
}

export default function AttendanceHeatmap({ attendanceData, isLoading = false }: AttendanceHeatmapProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isBoxHovered, setIsBoxHovered] = useState(false);
    const [hoverColorIndex, setHoverColorIndex] = useState(0);

    const HOVER_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e'];
    const activeHoverColor = useMemo(() => {
        return HOVER_COLORS[hoverColorIndex % HOVER_COLORS.length];
    }, [hoverColorIndex]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Generate days of the month
    const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
    const firstDayIndex = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Index the daily statistics by YYYY-MM-DD
    const statsByDate = useMemo(() => {
        const map: Record<string, DailyAttendance> = {};
        if (attendanceData?.overviewChart) {
            attendanceData.overviewChart.forEach((item) => {
                map[item._id] = item;
            });
        }
        return map;
    }, [attendanceData?.overviewChart]);

    // Generate calendar cell items
    const calendarCells = useMemo(() => {
        const cells = [];
        
        // Blank cells before the 1st
        for (let i = 0; i < firstDayIndex; i++) {
            cells.push({ day: null, dateStr: null });
        }

        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            cells.push({ day, dateStr });
        }

        return cells;
    }, [year, month, daysInMonth, firstDayIndex]);

    // Deterministic mock logs for the drilldown modal based on the clicked date
    const dayLogs = useMemo(() => {
        if (!selectedDate) return [];

        const dayNum = parseInt(selectedDate.split("-")[2], 10);
        
        const possibleEmployees = [
            { id: "1", name: "David Vance", department: "Engineering", avatar: "DV" },
            { id: "2", name: "Elena Rostova", department: "Design", avatar: "ER" },
            { id: "3", name: "Marcus Brody", department: "Marketing", avatar: "MB" },
            { id: "4", name: "Sarah Jenkins", department: "HR", avatar: "SJ" },
            { id: "5", name: "Hiroshi Tanaka", department: "Finance", avatar: "HT" },
            { id: "6", name: "Clara Oswald", department: "Support", avatar: "CO" },
        ];

        // Seeded random helper based on dayNum
        const logs: MockEmployeeLog[] = [];
        
        if (dayNum % 3 === 0) {
            logs.push({
                id: possibleEmployees[0].id,
                name: possibleEmployees[0].name,
                department: possibleEmployees[0].department,
                status: "Late",
                time: "09:28 AM"
            });
        }
        if (dayNum % 2 === 0) {
            logs.push({
                id: possibleEmployees[1].id,
                name: possibleEmployees[1].name,
                department: possibleEmployees[1].department,
                status: "Absent"
            });
        }
        if (dayNum % 5 === 0 || dayNum === 1) {
            logs.push({
                id: possibleEmployees[2].id,
                name: possibleEmployees[2].name,
                department: possibleEmployees[2].department,
                status: "On Leave"
            });
        }
        if (dayNum % 4 === 0) {
            logs.push({
                id: possibleEmployees[3].id,
                name: possibleEmployees[3].name,
                department: possibleEmployees[3].department,
                status: "Late",
                time: "09:42 AM"
            });
        }

        return logs;
    }, [selectedDate]);

    return (
        <div
            onMouseEnter={() => {
                if (!isBoxHovered) {
                    setHoverColorIndex(prev => (prev + 1) % HOVER_COLORS.length);
                }
                setIsBoxHovered(true);
            }}
            onMouseLeave={() => {
                setIsBoxHovered(false);
            }}
            style={{
                transform: isBoxHovered ? 'translateY(-4px)' : 'none',
                borderColor: isBoxHovered ? `${activeHoverColor}50` : undefined,
                boxShadow: isBoxHovered 
                    ? `0 20px 25px -5px ${activeHoverColor}20, 0 8px 10px -6px ${activeHoverColor}15` 
                    : undefined,
            }}
            className="rounded-2xl flex flex-col overflow-hidden h-full border bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-gray-200/80 dark:border-gray-800 shadow-md shadow-slate-200/20 dark:shadow-none min-h-[360px] transition-all duration-300 relative"
        >
            {/* Top color bar */}
            <div 
                style={{
                    background: isBoxHovered 
                        ? `linear-gradient(to right, ${activeHoverColor}, ${activeHoverColor}CC)` 
                        : undefined,
                    height: isBoxHovered ? '3px' : '0px',
                    opacity: isBoxHovered ? 0.95 : 0,
                }}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-300 shrink-0" 
            />

            <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100/80 dark:border-emerald-500/20 shadow-sm shrink-0">
                            <Calendar className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-none">
                                Attendance Heat-Calendar
                            </h3>
                            <p className="text-[10px] mt-0.5 text-gray-400 dark:text-gray-500 font-medium">
                                Team presence rate history
                            </p>
                        </div>
                    </div>

                    {/* Month Picker */}
                    <div className="flex items-center gap-1.5 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-lg">
                        <button
                            onClick={handlePrevMonth}
                            className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer text-gray-500 dark:text-gray-400 border-none outline-none"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 min-w-[75px] text-center">
                            {monthNames[month]} {year}
                        </span>
                        <button
                            onClick={handleNextMonth}
                            className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded-md transition-colors cursor-pointer text-gray-500 dark:text-gray-400 border-none outline-none"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Calendar Heatmap Grid */}
                <div className="flex flex-col gap-2 flex-1 justify-center">
                    {/* Days Header */}
                    <div className="grid grid-cols-7 text-center text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                        <span>Su</span>
                        <span>Mo</span>
                        <span>Tu</span>
                        <span>We</span>
                        <span>Th</span>
                        <span>Fr</span>
                        <span>Sa</span>
                    </div>

                    {/* Grid Days */}
                    <div className="grid grid-cols-7 gap-1.5">
                        {calendarCells.map((cell, idx) => {
                            if (!cell.day || !cell.dateStr) {
                                return <div key={`blank-${idx}`} className="aspect-square rounded-lg bg-gray-50/50 dark:bg-gray-800/20" />;
                            }

                            const stats = statsByDate[cell.dateStr];
                            const total = stats ? stats.present + stats.absent : 0;
                            const rate = total > 0 ? (stats.present / total) * 100 : 0;

                            // Dynamic styles depending on presence rates
                            let cellBg = "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500";
                            let glowStyle = "";

                            if (total > 0) {
                                if (rate >= 85) {
                                    cellBg = "bg-emerald-500 text-white font-bold cursor-pointer";
                                    glowStyle = "hover:shadow-md hover:shadow-emerald-500/35 hover:-translate-y-0.5";
                                } else if (rate >= 60) {
                                    cellBg = "bg-green-400 text-white font-bold cursor-pointer";
                                    glowStyle = "hover:shadow-md hover:shadow-green-400/35 hover:-translate-y-0.5";
                                } else if (rate >= 35) {
                                    cellBg = "bg-amber-400 text-white font-bold cursor-pointer";
                                    glowStyle = "hover:shadow-md hover:shadow-amber-400/35 hover:-translate-y-0.5";
                                } else {
                                    cellBg = "bg-orange-500 text-white font-bold cursor-pointer";
                                    glowStyle = "hover:shadow-md hover:shadow-orange-500/35 hover:-translate-y-0.5";
                                }
                            }

                            return (
                                <button
                                    key={cell.dateStr}
                                    onClick={() => total > 0 && setSelectedDate(cell.dateStr)}
                                    disabled={!total}
                                    style={{ outline: "none" }}
                                    className={cn(
                                        "aspect-square rounded-lg text-xs flex flex-col items-center justify-center transition-all duration-205 border-none",
                                        cellBg,
                                        glowStyle
                                    )}
                                    title={total > 0 ? `${cell.day} ${monthNames[month]}: ${Math.round(rate)}% Present` : `${cell.day} ${monthNames[month]}: No Data`}
                                >
                                    <span>{cell.day}</span>
                                    {total > 0 && (
                                        <span className="text-[7px] font-black opacity-80 leading-none mt-0.5">
                                            {Math.round(rate)}%
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    <span>Presence Levels:</span>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-orange-500 shrink-0" />
                            <span>&lt;35%</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-amber-400 shrink-0" />
                            <span>35-60%</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-green-400 shrink-0" />
                            <span>60-85%</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0" />
                            <span>85%+</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Drilldown Modal */}
            {selectedDate && (
                <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-4.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-slate-50 dark:bg-gray-850">
                            <div>
                                <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 leading-none">
                                    Day Logs Details
                                </h4>
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mt-1 block">
                                    {new Date(selectedDate).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric"
                                    })}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-200/50 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700/80 rounded-lg cursor-pointer border-none outline-none"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 flex flex-col gap-4 max-h-[300px] overflow-y-auto">
                            {dayLogs.length === 0 ? (
                                <div className="text-center py-6">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 animate-bounce" />
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Perfect Presence Record!</p>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">No employees were late, absent, or on leave today.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2.5">
                                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                                        Exceptions & Absences ({dayLogs.length})
                                    </p>
                                    {dayLogs.map((log) => (
                                        <div 
                                            key={log.id} 
                                            className="flex items-center justify-between p-3 bg-gray-50/60 dark:bg-slate-800/40 border border-gray-100 dark:border-gray-800/60 rounded-xl"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-350">
                                                    {log.avatar || log.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-950 dark:text-white leading-tight">
                                                        {log.name}
                                                    </p>
                                                    <p className="text-[9px] text-gray-450 dark:text-gray-500 font-medium">
                                                        {log.department}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                {log.status === "Late" ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                                                        <Clock className="w-2.5 h-2.5" />
                                                        Late ({log.time})
                                                    </span>
                                                ) : log.status === "Absent" ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
                                                        <Ban className="w-2.5 h-2.5" />
                                                        Absent
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200/50 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                                                        <AlertCircle className="w-2.5 h-2.5" />
                                                        On Leave
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
