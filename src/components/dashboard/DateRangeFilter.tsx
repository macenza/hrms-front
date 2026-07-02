'use client';

import React, { useState } from 'react';
import { CalendarRange, Search, RotateCcw } from 'lucide-react';

export interface DateRange {
    from: string; // YYYY-MM-DD
    to: string;   // YYYY-MM-DD
}

interface DateRangeFilterProps {
    onApply: (range: DateRange) => void;
    onReset: () => void;
    isFiltered?: boolean;
}

export default function DateRangeFilter({ onApply, onReset, isFiltered = false }: DateRangeFilterProps) {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [error, setError] = useState('');

    const todayStr = new Date().toISOString().split('T')[0];

    const handleApply = () => {
        setError('');
        if (!from || !to) {
            setError('Please select both From and To dates.');
            return;
        }
        if (from > to) {
            setError('"From" date cannot be after "To" date.');
            return;
        }
        onApply({ from, to });
    };

    const handleReset = () => {
        setFrom('');
        setTo('');
        setError('');
        onReset();
    };

    return (
        <div className="w-full rounded-2xl border bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-md shadow-slate-200/20 dark:shadow-none overflow-hidden">
            {/* Top accent bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-70" />

            <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
                {/* Label */}
                <div className="flex items-center gap-2.5 shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100/80 dark:border-indigo-500/20 shadow-sm shrink-0">
                        <CalendarRange className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-100 leading-none">
                            Date Range Filter
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">
                            Filter attendance by custom period
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-800 shrink-0" />

                {/* Date pickers row */}
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
                    {/* From */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 select-none">
                            From
                        </label>
                        <input
                            type="date"
                            value={from}
                            max={to || todayStr}
                            onChange={(e) => { setFrom(e.target.value); setError(''); }}
                            className="h-9 px-3 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all cursor-pointer"
                        />
                    </div>

                    {/* Arrow separator */}
                    <span className="text-gray-300 dark:text-gray-600 text-lg font-light mt-4 select-none">→</span>

                    {/* To */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 select-none">
                            To
                        </label>
                        <input
                            type="date"
                            value={to}
                            min={from || undefined}
                            max={todayStr}
                            onChange={(e) => { setTo(e.target.value); setError(''); }}
                            className="h-9 px-3 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all cursor-pointer"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                        <button
                            type="button"
                            onClick={handleApply}
                            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all duration-200 shadow-sm shadow-indigo-500/30 hover:shadow-md hover:shadow-indigo-500/30 cursor-pointer"
                        >
                            <Search className="w-3.5 h-3.5" />
                            Apply Filter
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={!isFiltered && !from && !to}
                            className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* Active filter badge */}
                {isFiltered && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20 shrink-0 animate-in fade-in duration-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        Filter Active
                    </span>
                )}
            </div>

            {/* Inline error */}
            {error && (
                <p className="px-5 pb-3 text-[11px] font-semibold text-rose-500 dark:text-rose-400 animate-in fade-in duration-200">
                    ⚠ {error}
                </p>
            )}
        </div>
    );
}
