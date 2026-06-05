'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Holiday } from '@/services/holidayService';

interface HolidayCalendarProps {
    holidays: Holiday[];
    year: number;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TYPE_DOT_COLORS: Record<string, string> = {
    National: 'bg-blue-500',
    Regional: 'bg-purple-500',
    Optional: 'bg-gray-400',
    Company: 'bg-emerald-500',
    Religious: 'bg-amber-500',
};

export default function HolidayCalendar({ holidays, year }: HolidayCalendarProps) {
    const [month, setMonth] = useState(new Date().getMonth());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // Build a Map from date string → holidays on that date
    const holidayMap = useMemo(() => {
        const map = new Map<string, Holiday[]>();
        holidays.forEach(h => {
            const d = new Date(h.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const existing = map.get(key) || [];
            existing.push(h);
            map.set(key, existing);
        });
        return map;
    }, [holidays]);

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const calendarDays: Array<{ day: number | null; dateStr: string }> = [];

    // Leading empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push({ day: null, dateStr: '' });
    }
    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        calendarDays.push({ day: d, dateStr });
    }

    const prevMonth = () => {
        if (month === 0) return;
        setMonth(month - 1);
        setSelectedDate(null);
    };

    const nextMonth = () => {
        if (month === 11) return;
        setMonth(month + 1);
        setSelectedDate(null);
    };

    const selectedHolidays = selectedDate ? (holidayMap.get(selectedDate) || []) : [];

    return (
        <div className="p-5 sm:p-6">
            {/* Month Navigator */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={prevMonth}
                    disabled={month === 0}
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                    {MONTHS[month]} {year}
                </h3>
                <button
                    onClick={nextMonth}
                    disabled={month === 11}
                    className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-px mb-1">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 py-2">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
                {calendarDays.map((cell, idx) => {
                    const isToday = cell.dateStr === todayStr;
                    const dayHolidays = cell.dateStr ? (holidayMap.get(cell.dateStr) || []) : [];
                    const hasHoliday = dayHolidays.length > 0;
                    const isSelected = cell.dateStr === selectedDate;

                    return (
                        <div
                            key={idx}
                            onClick={() => {
                                if (cell.day && hasHoliday) {
                                    setSelectedDate(isSelected ? null : cell.dateStr);
                                }
                            }}
                            className={`
                                min-h-[60px] sm:min-h-[80px] p-1.5 sm:p-2 bg-white dark:bg-gray-900 transition-all relative
                                ${!cell.day ? 'bg-gray-50/50 dark:bg-gray-950/50' : ''}
                                ${hasHoliday ? 'cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20' : ''}
                                ${isSelected ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/50 dark:bg-blue-950/30' : ''}
                            `}
                        >
                            {cell.day && (
                                <>
                                    <span className={`
                                        text-xs sm:text-sm font-semibold inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-colors
                                        ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'}
                                    `}>
                                        {cell.day}
                                    </span>

                                    {/* Holiday Indicator Dots */}
                                    {hasHoliday && (
                                        <div className="mt-0.5 sm:mt-1 flex flex-col gap-0.5">
                                            {dayHolidays.slice(0, 2).map((h, i) => (
                                                <div key={i} className="flex items-center gap-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TYPE_DOT_COLORS[h.type] || 'bg-gray-400'}`} />
                                                    <span className="text-[9px] sm:text-[10px] font-semibold text-gray-600 dark:text-gray-400 truncate leading-tight">
                                                        {h.name}
                                                    </span>
                                                </div>
                                            ))}
                                            {dayHolidays.length > 2 && (
                                                <span className="text-[9px] font-bold text-blue-500">+{dayHolidays.length - 2} more</span>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Selected Date Detail Popover */}
            {selectedDate && selectedHolidays.length > 0 && (
                <div className="mt-4 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg shadow-blue-500/5">
                    <h4 className="text-sm font-black text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h4>
                    <div className="space-y-2.5">
                        {selectedHolidays.map(h => (
                            <div key={h._id} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 transition-colors">
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${TYPE_DOT_COLORS[h.type] || 'bg-gray-400'}`} />
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{h.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{h.type}</span>
                                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{h.country}</span>
                                    </div>
                                    {h.description && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{h.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 flex-wrap">
                {Object.entries(TYPE_DOT_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${color}`} />
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{type}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
