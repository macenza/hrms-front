"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle, Info, Loader2 } from "lucide-react";
import { useCalendarAttendance } from "@/hooks/api/useAttendance";
import { cn } from "@/utils/cn";

export interface CalendarRecord {
    date: string;
    status: string | null;
    checkIn: string | null;
    checkOut: string | null;
    duration: string | null;
    totalWorkedMinutes: number;
    isLate: boolean;
    lateByMinutes: number;
    overtimeMinutes: number;
    overtime: string | null;
    workFormat: string;
    notes: string;
    shift: string;
}

export interface CalendarCell {
    day: number;
    dateString: string;
    isCurrentMonth: boolean;
    isFuture: boolean;
    record: CalendarRecord | null;
}

export const getAttendanceColor = (status: string | null) => {
    switch (status) {
        case 'PRESENT':
            return {
                bg: 'bg-green-50 dark:bg-emerald-500/10',
                text: 'text-green-750 dark:text-emerald-400',
                border: 'border-green-100 dark:border-emerald-500/20',
                hoverBorder: 'hover:border-green-400 dark:hover:border-emerald-400',
                dot: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
            };
        case 'ABSENT':
            return {
                bg: 'bg-red-50 dark:bg-rose-500/10',
                text: 'text-red-750 dark:text-rose-400',
                border: 'border-red-100 dark:border-rose-500/20',
                hoverBorder: 'hover:border-red-400 dark:hover:border-rose-400',
                dot: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            };
        case 'HALF_DAY':
            return {
                bg: 'bg-amber-50 dark:bg-amber-500/10',
                text: 'text-amber-750 dark:text-amber-400',
                border: 'border-amber-100 dark:border-amber-500/20',
                hoverBorder: 'hover:border-amber-400 dark:hover:border-amber-400',
                dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
            };
        case 'LEAVE':
            return {
                bg: 'bg-blue-50 dark:bg-blue-500/10',
                text: 'text-blue-750 dark:text-blue-400',
                border: 'border-blue-100 dark:border-blue-500/20',
                hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-400',
                dot: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
            };
        case 'HOLIDAY':
            return {
                bg: 'bg-violet-50 dark:bg-violet-500/10',
                text: 'text-violet-750 dark:text-violet-400',
                border: 'border-violet-100 dark:border-violet-500/20',
                hoverBorder: 'hover:border-violet-400 dark:hover:border-violet-400',
                dot: 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]'
            };
        case 'WEEKEND':
            return {
                bg: 'bg-slate-50 dark:bg-slate-800/30',
                text: 'text-slate-500 dark:text-slate-400',
                border: 'border-slate-100 dark:border-slate-800/50',
                hoverBorder: 'hover:border-slate-300 dark:hover:border-slate-700',
                dot: 'bg-slate-400'
            };
        case 'WORK_FROM_HOME':
            return {
                bg: 'bg-teal-50 dark:bg-teal-500/10',
                text: 'text-teal-750 dark:text-teal-400',
                border: 'border-teal-100 dark:border-teal-500/20',
                hoverBorder: 'hover:border-teal-400 dark:hover:border-teal-400',
                dot: 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]'
            };
        case 'LATE':
            return {
                bg: 'bg-orange-50 dark:bg-orange-500/10',
                text: 'text-orange-750 dark:text-orange-400',
                border: 'border-orange-100 dark:border-orange-500/20',
                hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-400',
                dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'
            };
        case 'MISSING_PUNCH':
            return {
                bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10',
                text: 'text-fuchsia-755 dark:text-fuchsia-400',
                border: 'border-fuchsia-100 dark:border-fuchsia-500/20',
                hoverBorder: 'hover:border-fuchsia-400 dark:hover:border-fuchsia-400',
                dot: 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.5)]'
            };
        default:
            return {
                bg: 'bg-slate-50/50 dark:bg-slate-900/40',
                text: 'text-slate-500 dark:text-slate-400',
                border: 'border-slate-150 dark:border-slate-800',
                hoverBorder: 'hover:border-slate-300 dark:hover:border-slate-700',
                dot: 'bg-slate-400'
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

export const getCompactStatusLabel = (status: string | null) => {
    switch (status) {
        case 'PRESENT': return 'P';
        case 'ABSENT': return 'A';
        case 'HALF_DAY': return 'HD';
        case 'LEAVE': return 'L';
        case 'HOLIDAY': return 'H';
        case 'WEEKEND': return 'W';
        case 'WORK_FROM_HOME': return 'WFH';
        case 'LATE': return 'LT';
        case 'MISSING_PUNCH': return 'MP';
        default: return '-';
    }
};

export const LEGEND_ITEMS = [
    { status: 'PRESENT', label: 'Present' },
    { status: 'ABSENT', label: 'Absent' },
    { status: 'HALF_DAY', label: 'Half Day' },
    { status: 'LEAVE', label: 'Leave' },
    { status: 'HOLIDAY', label: 'Holiday' },
    { status: 'WEEKEND', label: 'Weekend' },
    { status: 'WORK_FROM_HOME', label: 'WFH' },
    { status: 'LATE', label: 'Late' },
    { status: 'MISSING_PUNCH', label: 'Missing Punch' },
];

interface AttendanceCalendarProps {
    employeeId: string;
    onDataFetched?: (data: any) => void;
    onLoadingChange?: (isLoading: boolean) => void;
}

export default function AttendanceCalendar({ employeeId, onDataFetched, onLoadingChange }: AttendanceCalendarProps) {
    const today = useMemo(() => new Date(), []);
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedCell, setSelectedCell] = useState<CalendarCell | null>(null);

    const todayString = useMemo(() => {
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    }, [today]);

    // Fetch monthly attendance from optimized calendar endpoint
    const { data, isLoading } = useCalendarAttendance(employeeId, currentMonth, currentYear);

    // Sync fetched data to parent if needed
    React.useEffect(() => {
        if (data && onDataFetched) {
            onDataFetched(data);
        }
    }, [data, onDataFetched]);

    // Sync loading state to parent if needed
    React.useEffect(() => {
        if (onLoadingChange) {
            onLoadingChange(isLoading);
        }
    }, [isLoading, onLoadingChange]);

    const records = data?.records || [];
    const summary = data?.summary || { present: 0, absent: 0, leave: 0, halfDay: 0, holiday: 0, weekend: 0, attendancePercentage: 100 };
    const insights = data?.insights || { perfectAttendanceStreak: 0, averageCheckIn: "--:--", lateArrivals: 0, overtimeDays: 0 };

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

    // Generate calendar cell items
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

    const handleCellClick = (cell: CalendarCell) => {
        if (!cell.isCurrentMonth || cell.isFuture) return;
        setSelectedCell(cell);
    };

    const handleClosePopover = () => {
        setSelectedCell(null);
    };

    return (
        <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
            {/* Header Navigation */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Attendance Calendar
                    </h3>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        aria-label="Previous Month"
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-100 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 min-w-[120px] text-center select-none">
                        {monthName}
                    </span>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        disabled={isNextMonthDisabled}
                        aria-label="Next Month"
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-slate-100 transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Skeleton / Loading view */}
            {isLoading ? (
                <div className="h-[360px] w-full flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">Loading attendance data...</span>
                </div>
            ) : (
                <>
                    {/* Top Widgets Grid: Summary & Insights */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        {/* Month Summary Widget */}
                        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">Month Summary</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Present</span>
                                    <span className="text-xl font-black text-green-650 dark:text-emerald-400">{summary.present}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Absent</span>
                                    <span className="text-xl font-black text-red-650 dark:text-rose-400">{summary.absent}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Leave</span>
                                    <span className="text-xl font-black text-blue-650 dark:text-blue-400">{summary.leave}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">Half Day</span>
                                    <span className="text-xl font-black text-amber-650 dark:text-amber-400">{summary.halfDay}</span>
                                </div>
                                <div className="flex flex-col justify-center sm:border-l sm:border-slate-200 dark:sm:border-slate-800/80 sm:pl-4 col-span-2 sm:col-span-1">
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-400">Attendance</span>
                                    <span className="text-2xl font-black text-blue-650 dark:text-blue-400">{summary.attendancePercentage}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Smart Insights Widget */}
                        <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-650 dark:text-slate-400 mb-3">Attendance Insights</h4>
                            <div className="flex flex-col gap-1.5 text-[11px]">
                                <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800/50">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Perfect Streak</span>
                                    <span className="font-extrabold text-green-650 dark:text-emerald-400">{insights.perfectAttendanceStreak} Days</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800/50">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Avg Check-In</span>
                                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{insights.averageCheckIn}</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5 border-b border-slate-100 dark:border-slate-800/50">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Late Arrivals</span>
                                    <span className="font-extrabold text-orange-655 dark:text-orange-400">{insights.lateArrivals}</span>
                                </div>
                                <div className="flex justify-between items-center py-0.5">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Overtime Days</span>
                                    <span className="font-extrabold text-violet-650 dark:text-violet-400">{insights.overtimeDays}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div
                                key={day}
                                className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider py-1"
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
                                <button
                                    type="button"
                                    key={`${cell.dateString}-${idx}`}
                                    onClick={() => handleCellClick(cell)}
                                    disabled={cell.isFuture || !cell.isCurrentMonth}
                                    className={cn(
                                        "relative flex flex-col items-stretch justify-between p-2 rounded-xl border aspect-square transition-all duration-300 group select-none text-left w-full overflow-hidden",
                                        cell.isCurrentMonth 
                                            ? cn(colors.bg, colors.border, colors.hoverBorder, "hover:bg-slate-100/50 dark:hover:bg-slate-800/40 cursor-pointer")
                                            : "bg-slate-50/30 dark:bg-slate-900/10 border-transparent text-slate-400 dark:text-slate-700 pointer-events-none",
                                        isToday && "ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-slate-900 border-primary z-10",
                                        cell.isFuture && "opacity-25 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-700 pointer-events-none"
                                    )}
                                    role="gridcell"
                                    tabIndex={cell.isCurrentMonth && !cell.isFuture ? 0 : -1}
                                    aria-label={`Date: ${cell.dateString}, Status: ${status ? getAttendanceLabel(status) : 'No record'}`}
                                >
                                    {/* Date Number and Compact Mobile Badge */}
                                    <div className="flex justify-between items-center w-full">
                                        <span
                                            className={cn(
                                                "text-xs sm:text-sm font-bold",
                                                cell.isCurrentMonth
                                                    ? "text-slate-900 dark:text-slate-100"
                                                    : "text-slate-450 dark:text-slate-700"
                                            )}
                                        >
                                            {cell.day}
                                        </span>
                                        {/* Mobile status badge (Compact label e.g. P, WFH, LT, LV) */}
                                        {status && cell.isCurrentMonth && (
                                            <span className={cn("sm:hidden text-[9px] font-extrabold uppercase px-1 py-0.5 rounded leading-none shrink-0", colors.bg, colors.text)}>
                                                {getCompactStatusLabel(status)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Check-In time (Desktop & Tablet) */}
                                    {cell.isCurrentMonth && cell.record && cell.record.checkIn !== '--' && (
                                        <div className="hidden sm:block text-[10px] text-slate-550 dark:text-slate-400 font-medium truncate mt-1">
                                            {cell.record.checkIn}
                                        </div>
                                    )}

                                    {/* Duration (Desktop Only) */}
                                    {cell.isCurrentMonth && cell.record && cell.record.duration !== '--' && (
                                        <div className="hidden lg:block text-[9px] text-slate-600 dark:text-slate-500 truncate font-semibold mt-0.5">
                                            {cell.record.duration}
                                        </div>
                                    )}

                                    {/* Status Label (Desktop & Tablet) */}
                                    {status && cell.isCurrentMonth && (
                                        <span className={cn("hidden sm:inline-flex text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1.5 w-fit leading-none shrink-0", colors.bg, colors.text)}>
                                            {getAttendanceLabel(status)}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Color Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                        {LEGEND_ITEMS.map((item) => {
                            const colors = getAttendanceColor(item.status);
                            return (
                                <div key={item.status} className="flex items-center gap-1.5 text-xs font-semibold text-slate-550 dark:text-slate-400">
                                    <span className={cn("w-2 h-2 rounded-full", colors.dot)} />
                                    <span>{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Detailed Day Popover Modal */}
            {selectedCell && (
                <div 
                    className="fixed inset-0 bg-slate-950/50 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    onClick={handleClosePopover}
                >
                    <div 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative flex flex-col gap-4 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Attendance Details</h4>
                                <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                                    {new Date(selectedCell.dateString).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric"
                                    })}
                                </p>
                            </div>
                            <button
                                onClick={handleClosePopover}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 transition-colors p-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                                aria-label="Close details"
                            >
                                <ChevronRight className="w-5 h-5 rotate-90" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-3 text-xs">
                            {/* Status */}
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-550 dark:text-slate-400">Status</span>
                                <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide",
                                    getAttendanceColor(selectedCell.record?.status || (selectedCell.isFuture ? null : 'ABSENT')).bg,
                                    getAttendanceColor(selectedCell.record?.status || (selectedCell.isFuture ? null : 'ABSENT')).text
                                )}>
                                    {getAttendanceLabel(selectedCell.record?.status || (selectedCell.isFuture ? null : 'ABSENT'))}
                                </span>
                            </div>

                            {/* Shift */}
                            <div className="flex justify-between items-start py-1">
                                <span className="text-slate-550 dark:text-slate-400">Shift</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[200px]">
                                    {selectedCell.record?.shift || "Day Shift (09:00 AM - 05:00 PM)"}
                                </span>
                            </div>

                            {/* Check-In & Check-Out */}
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-550 dark:text-slate-400">Punch Times</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {selectedCell.record?.checkIn || "--"} - {selectedCell.record?.checkOut || "--"}
                                </span>
                            </div>

                            {/* Duration */}
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-550 dark:text-slate-400">Working Duration</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {selectedCell.record?.duration || "--"}
                                </span>
                            </div>

                            {/* Late Minutes */}
                            {selectedCell.record?.isLate && (
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-slate-550 dark:text-slate-400">Late Minutes</span>
                                    <span className="font-semibold text-orange-655 dark:text-orange-400">
                                        {selectedCell.record.lateByMinutes} mins
                                    </span>
                                </div>
                            )}

                            {/* Overtime */}
                            {selectedCell.record && selectedCell.record.overtimeMinutes > 0 && (
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-slate-550 dark:text-slate-400">Overtime</span>
                                    <span className="font-semibold text-violet-650 dark:text-violet-400">
                                        {selectedCell.record.overtime}
                                    </span>
                                </div>
                            )}

                            {/* Remarks */}
                            {selectedCell.record?.notes && (
                                <div className="flex flex-col gap-1.5 border-t border-slate-100 dark:border-slate-800 pt-3.5 mt-1">
                                    <span className="text-slate-650 dark:text-slate-455 text-[10px] font-bold uppercase tracking-wider">Remarks / Notes</span>
                                    <p className="text-[11px] text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-850/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                        {selectedCell.record.notes}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer button */}
                        <button
                            onClick={handleClosePopover}
                            className="mt-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] cursor-pointer animate-none"
                        >
                            Close Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
