"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle, Info, Loader2 } from "lucide-react";
import { useCalendarAttendance } from "@/hooks/api/useAttendance";
import { cn } from "@/utils/cn";

export const getAttendanceColor = (status: string | null) => {
    switch (status) {
        case 'PRESENT':
            return {
                bg: 'bg-emerald-50/70 dark:bg-emerald-500/10',
                text: 'text-emerald-700 dark:text-emerald-400',
                border: 'border-emerald-100 dark:border-emerald-500/20',
                hoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-500',
                dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
            };
        case 'ABSENT':
            return {
                bg: 'bg-rose-50/70 dark:bg-rose-500/10',
                text: 'text-rose-700 dark:text-rose-400',
                border: 'border-rose-100 dark:border-rose-500/20',
                hoverBorder: 'hover:border-rose-400 dark:hover:border-rose-500',
                dot: 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            };
        case 'HALF_DAY':
            return {
                bg: 'bg-amber-50/70 dark:bg-amber-500/10',
                text: 'text-amber-700 dark:text-amber-400',
                border: 'border-amber-100 dark:border-amber-500/20',
                hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-500',
                dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
            };
        case 'LEAVE':
            return {
                bg: 'bg-blue-50/70 dark:bg-blue-500/10',
                text: 'text-blue-700 dark:text-blue-400',
                border: 'border-blue-100 dark:border-blue-500/20',
                hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-500',
                dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
            };
        case 'HOLIDAY':
            return {
                bg: 'bg-violet-50/70 dark:bg-violet-500/10',
                text: 'text-violet-700 dark:text-violet-400',
                border: 'border-violet-100 dark:border-violet-500/20',
                hoverBorder: 'hover:border-violet-400 dark:hover:border-violet-500',
                dot: 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]'
            };
        case 'WEEKEND':
            return {
                bg: 'bg-gray-100/50 dark:bg-gray-800/30',
                text: 'text-gray-400 dark:text-gray-500',
                border: 'border-gray-200/50 dark:border-gray-800/50',
                hoverBorder: 'hover:border-gray-400 dark:hover:border-gray-600',
                dot: 'bg-gray-400'
            };
        case 'WORK_FROM_HOME':
            return {
                bg: 'bg-teal-50/70 dark:bg-teal-500/10',
                text: 'text-teal-700 dark:text-teal-400',
                border: 'border-teal-100 dark:border-teal-500/20',
                hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-500',
                dot: 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]'
            };
        case 'LATE':
            return {
                bg: 'bg-orange-50/70 dark:bg-orange-500/10',
                text: 'text-orange-700 dark:text-orange-400',
                border: 'border-orange-100 dark:border-orange-500/20',
                hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-500',
                dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
            };
        case 'MISSING_PUNCH':
            return {
                bg: 'bg-fuchsia-50/70 dark:bg-fuchsia-500/10',
                text: 'text-fuchsia-700 dark:text-fuchsia-400',
                border: 'border-fuchsia-100 dark:border-fuchsia-500/20',
                hoverBorder: 'hover:border-fuchsia-400 dark:hover:border-fuchsia-500',
                dot: 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.5)]'
            };
        default:
            return {
                bg: 'bg-white dark:bg-gray-900',
                text: 'text-gray-400 dark:text-gray-600',
                border: 'border-gray-100 dark:border-gray-800',
                hoverBorder: 'hover:border-gray-300 dark:hover:border-gray-700',
                dot: 'bg-gray-300 dark:bg-gray-700'
            };
    }
};

export const getAttendanceLabel = (status: string | null) => {
    switch (status) {
        case 'PRESENT': return 'Present';
        case 'ABSENT': return 'Absent';
        case 'HALF_DAY': return 'Half Day';
        case 'LEAVE': return 'Leave';
        case 'HOLIDAY': return 'Holiday';
        case 'WEEKEND': return 'Weekend';
        case 'WORK_FROM_HOME': return 'Work From Home';
        case 'LATE': return 'Late';
        case 'MISSING_PUNCH': return 'Missing Punch';
        default: return 'No Record';
    }
};

const LEGEND_ITEMS = [
    { status: 'PRESENT', label: 'Present' },
    { status: 'LATE', label: 'Late' },
    { status: 'HALF_DAY', label: 'Half Day' },
    { status: 'LEAVE', label: 'Leave' },
    { status: 'WORK_FROM_HOME', label: 'Work From Home' },
    { status: 'MISSING_PUNCH', label: 'Missing Punch' },
    { status: 'ABSENT', label: 'Absent' },
    { status: 'HOLIDAY', label: 'Holiday' },
    { status: 'WEEKEND', label: 'Weekend' }
];

interface CalendarRecord {
    date: string;
    status: string | null;
    checkIn: string | null;
    checkOut: string | null;
    isLate: boolean;
    workFormat: string;
    notes: string;
    totalWorkedMinutes: number;
}

interface CalendarCell {
    day: number;
    dateString: string;
    isCurrentMonth: boolean;
    isFuture: boolean;
    record: CalendarRecord | null;
}

interface AttendanceCalendarProps {
    employeeId: string;
}

export default function AttendanceCalendar({ employeeId }: AttendanceCalendarProps) {
    const today = useMemo(() => new Date(), []);
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const todayString = useMemo(() => {
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    }, [today]);

    // Fetch monthly attendance from optimized calendar endpoint
    const { data, isLoading } = useCalendarAttendance(employeeId, currentMonth, currentYear);

    const records = data?.records || [];

    const handlePrevMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        const nextMonthDate = currentMonth === 12 
            ? new Date(currentYear + 1, 0, 1) 
            : new Date(currentYear, currentMonth, 1);
        
        if (nextMonthDate > today) return; // Future months disabled

        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const isNextMonthDisabled = useMemo(() => {
        const nextMonthDate = currentMonth === 12 
            ? new Date(currentYear + 1, 0, 1) 
            : new Date(currentYear, currentMonth, 1);
        return nextMonthDate > today;
    }, [currentMonth, currentYear, today]);

    // Generate calendar cell items (padding previous month, current month days)
    const calendarCells = useMemo<CalendarCell[]>(() => {
        const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0 (Sun) to 6 (Sat)
        const totalDays = new Date(currentYear, currentMonth, 0).getDate();
        
        const prevMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const totalDaysInPrevMonth = new Date(prevMonthYear, prevMonth, 0).getDate();

        const cells: CalendarCell[] = [];

        // 1. Previous Month days padding
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const dayNum = totalDaysInPrevMonth - i;
            const dateStr = `${prevMonthYear}-${String(prevMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            cells.push({
                day: dayNum,
                dateString: dateStr,
                isCurrentMonth: false,
                isFuture: dateStr > todayString,
                record: null
            });
        }

        // Map records by date for O(1) lookup
        const recordsMap = new Map<string, CalendarRecord>(
            (records as CalendarRecord[]).map((r) => [r.date, r])
        );

        // 2. Current Month days
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
            const record = recordsMap.get(dateStr) || null;
            cells.push({
                day: d,
                dateString: dateStr,
                isCurrentMonth: true,
                isFuture: dateStr > todayString,
                record
            });
        }

        // 3. Next Month days padding (to make grid complete multiple of 7)
        const remainingCells = 42 - cells.length;
        const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        for (let i = 1; i <= remainingCells; i++) {
            const dateStr = `${nextMonthYear}-${String(nextMonth).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
            cells.push({
                day: i,
                dateString: dateStr,
                isCurrentMonth: false,
                isFuture: dateStr > todayString,
                record: null
            });
        }

        return cells;
    }, [currentMonth, currentYear, records, todayString]);

    const monthName = useMemo(() => {
        return new Date(currentYear, currentMonth - 1, 1).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });
    }, [currentMonth, currentYear]);

    return (
        <div className="rounded-2xl p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 shadow-sm dark:shadow-none transition-colors duration-300">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">
                        Attendance Calendar
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        aria-label="Previous Month"
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 min-w-[120px] text-center select-none">
                        {monthName}
                    </span>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        disabled={isNextMonthDisabled}
                        aria-label="Next Month"
                        className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Skeleton / Loading view */}
            {isLoading ? (
                <div className="h-[360px] w-full flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Loading attendance data...</span>
                </div>
            ) : (
                <>
                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div
                                key={day}
                                className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider py-1"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {calendarCells.map((cell, idx) => {
                            const isToday = cell.dateString === todayString;
                            const status = cell.record?.status || (cell.isFuture ? null : (cell.isCurrentMonth ? (cell.record ? cell.record.status : null) : null));
                            const colors = getAttendanceColor(status);
                            
                            return (
                                <div
                                    key={`${cell.dateString}-${idx}`}
                                    className={cn(
                                        "relative flex flex-col items-center justify-between p-2 rounded-xl border aspect-square transition-all duration-300 group select-none",
                                        cell.isCurrentMonth 
                                            ? cn(colors.bg, colors.border, colors.hoverBorder)
                                            : "bg-gray-50/20 dark:bg-gray-900/10 border-transparent text-gray-300 dark:text-gray-700 pointer-events-none",
                                        isToday && "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 border-blue-400 dark:border-blue-500 z-10",
                                        cell.isFuture && "opacity-40 cursor-not-allowed border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-300 dark:text-gray-700 pointer-events-none"
                                    )}
                                    role="gridcell"
                                    tabIndex={cell.isCurrentMonth && !cell.isFuture ? 0 : -1}
                                    aria-label={`Date: ${cell.dateString}, Status: ${status ? getAttendanceLabel(status) : 'No record'}`}
                                >
                                    {/* Date Number */}
                                    <span
                                        className={cn(
                                            "text-sm font-bold",
                                            cell.isCurrentMonth
                                                ? (colors.text || "text-gray-700 dark:text-gray-300")
                                                : "text-gray-300 dark:text-gray-700"
                                        )}
                                    >
                                        {cell.day}
                                    </span>

                                    {/* Status Indicator (Dot) */}
                                    {status && cell.isCurrentMonth && (
                                        <span className={cn("w-2 h-2 rounded-full mt-1 shrink-0 transition-transform duration-300 group-hover:scale-125", colors.dot)} />
                                    )}

                                    {/* Custom Premium Hover Tooltip */}
                                    {cell.isCurrentMonth && !cell.isFuture && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-gray-950/90 dark:bg-gray-900/95 text-white rounded-xl shadow-xl backdrop-blur-md border border-gray-800 dark:border-gray-700/60 text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible transition-all duration-300 z-50 pointer-events-none flex flex-col gap-2">
                                            <div className="font-bold flex items-center justify-between border-b border-gray-800/80 pb-1.5">
                                                <span>{new Date(cell.dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                                <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide", colors.bg, colors.text)}>
                                                    {getAttendanceLabel(status)}
                                                </span>
                                            </div>
                                            
                                            {cell.record?.checkIn ? (
                                                <div className="flex flex-col gap-1 text-gray-300">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                                                        <span>In: <b className="text-white">{cell.record.checkIn}</b></span>
                                                        {cell.record.checkOut && (
                                                            <span> · Out: <b className="text-white">{cell.record.checkOut}</b></span>
                                                        )}
                                                    </div>
                                                    {cell.record.totalWorkedMinutes > 0 && (
                                                        <div className="text-[10px] text-gray-400 pl-5">
                                                            Duration: {Math.floor(cell.record.totalWorkedMinutes / 60)}h {cell.record.totalWorkedMinutes % 60}m
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-gray-400">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span>No punch data available</span>
                                                </div>
                                            )}

                                            {cell.record?.notes && (
                                                <div className="flex items-start gap-1.5 text-gray-400 border-t border-gray-800/80 pt-1.5 mt-0.5">
                                                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                                                    <span className="line-clamp-2 italic">{cell.record.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Color Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6 border-t border-gray-100 dark:border-gray-800/80 pt-5">
                        {LEGEND_ITEMS.map((item) => {
                            const colors = getAttendanceColor(item.status);
                            return (
                                <div key={item.status} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    <span className={cn("w-2 h-2 rounded-full", colors.dot)} />
                                    <span>{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
