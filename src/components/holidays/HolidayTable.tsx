'use client';

import React from 'react';
import { Loader2, Edit3, Trash2, RotateCcw, Calendar } from 'lucide-react';
import { useDeleteHoliday, useRestoreHoliday } from '@/hooks/api/useHolidays';
import type { Holiday } from '@/services/holidayService';

interface HolidayTableProps {
    holidays: Holiday[];
    isLoading: boolean;
    isAdmin: boolean;
    onEdit: (holiday: Holiday) => void;
}

const TYPE_BADGE_COLORS: Record<string, string> = {
    National: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Regional: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    Optional: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    Company: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Religious: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

export default function HolidayTable({ holidays, isLoading, isAdmin, onEdit }: HolidayTableProps) {
    const deleteHoliday = useDeleteHoliday();
    const restoreHoliday = useRestoreHoliday();

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this holiday?')) {
            await deleteHoliday.mutateAsync(id);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    };

    const getDayOfWeek = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-7 h-7 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    if (holidays.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
                <Calendar size={48} strokeWidth={1.5} className="mb-4" />
                <p className="text-base font-semibold">No holidays found</p>
                <p className="text-sm mt-1">Try adjusting your filters or add a new holiday.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30">
                        <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Holiday</th>
                        <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</th>
                        <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden md:table-cell">Day</th>
                        <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden sm:table-cell">Country</th>
                        <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden lg:table-cell">Type</th>
                        <th className="text-left py-3 px-5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 hidden lg:table-cell">Status</th>
                        {isAdmin && (
                            <th className="text-right py-3 px-5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {holidays.map((holiday) => {
                        const isPast = new Date(holiday.date) < new Date();
                        return (
                            <tr
                                key={holiday._id}
                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isPast ? 'opacity-60' : ''}`}
                            >
                                <td className="py-3.5 px-5">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100 transition-colors">{holiday.name}</p>
                                        {holiday.description && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1 max-w-[200px]">{holiday.description}</p>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3.5 px-5 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatDate(holiday.date)}</td>
                                <td className="py-3.5 px-5 text-gray-500 dark:text-gray-400 hidden md:table-cell">{getDayOfWeek(holiday.date)}</td>
                                <td className="py-3.5 px-5 hidden sm:table-cell">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                        {holiday.country}
                                    </span>
                                </td>
                                <td className="py-3.5 px-5 hidden lg:table-cell">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${TYPE_BADGE_COLORS[holiday.type] || TYPE_BADGE_COLORS.Optional}`}>
                                        {holiday.type}
                                    </span>
                                </td>
                                <td className="py-3.5 px-5 hidden lg:table-cell">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                                        holiday.status === 'Active'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                                    }`}>
                                        {holiday.status}
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td className="py-3.5 px-5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => onEdit(holiday)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit3 size={15} />
                                            </button>
                                            {holiday.isDeleted ? (
                                                <button
                                                    onClick={() => restoreHoliday.mutateAsync(holiday._id)}
                                                    className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors"
                                                    title="Restore"
                                                >
                                                    <RotateCcw size={15} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleDelete(holiday._id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
