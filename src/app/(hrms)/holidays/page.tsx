'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarHeart, Plus, Upload, List, CalendarDays, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAppSelector } from '@/store/hooks';
import { useHolidays } from '@/hooks/api/useHolidays';
import HolidayTable from '@/components/holidays/HolidayTable';
import HolidayCalendar from '@/components/holidays/HolidayCalendar';
import AddHolidayModal from '@/components/holidays/AddHolidayModal';
import BulkImportModal from '@/components/holidays/BulkImportModal';
import type { Holiday } from '@/services/holidayService';

export default function HolidaysPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isAdmin = role === 'admin';

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
    const [countryFilter, setCountryFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [editHoliday, setEditHoliday] = useState<Holiday | null>(null);

    // Data
    const { data: holidays = [], isLoading } = useHolidays({
        year: yearFilter,
        country: countryFilter || undefined,
        type: typeFilter || undefined
    });

    // Route Protection
    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.replace('/hrms-login');
        }
    }, [isAuthenticated, router]);

    const handleEditClick = (holiday: Holiday) => {
        setEditHoliday(holiday);
        setIsAddModalOpen(true);
    };

    const handleModalClose = () => {
        setIsAddModalOpen(false);
        setEditHoliday(null);
    };

    // Stat Calculations
    const totalHolidays = holidays.length;
    const nationalCount = holidays.filter(h => h.type === 'National').length;
    const upcomingCount = holidays.filter(h => new Date(h.date) >= new Date()).length;

    if (!isAuthenticated) {
        return (
            <div className="flex h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] items-center justify-center transition-colors duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                            Public Holidays
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Company-wide holiday calendar and management
                        </p>
                    </div>

                    {isAdmin && (
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => setIsBulkImportOpen(true)}
                                className="gap-2 font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <Upload size={18} strokeWidth={2.5} />
                                Import
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => { setEditHoliday(null); setIsAddModalOpen(true); }}
                                className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none font-bold"
                            >
                                <Plus size={18} strokeWidth={2.5} />
                                Add Holiday
                            </Button>
                        </div>
                    )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Total Holidays', value: totalHolidays, color: 'blue' },
                        { label: 'National Holidays', value: nationalCount, color: 'emerald' },
                        { label: 'Upcoming', value: upcomingCount, color: 'amber' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm dark:shadow-none transition-colors">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">{stat.label}</p>
                            <p className={`text-2xl font-black text-${stat.color}-600 dark:text-${stat.color}-400 tracking-tight`}>
                                {isLoading ? '—' : stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main Content Card */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 transition-colors">
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-2">
                            <CalendarHeart size={20} className="text-blue-600 dark:text-blue-500" />
                            Holiday Calendar
                        </CardTitle>

                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Year Selector */}
                            <select
                                value={yearFilter}
                                onChange={(e) => setYearFilter(Number(e.target.value))}
                                className="h-9 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium outline-none focus:ring-2 focus:ring-blue-600/20 bg-gray-50 dark:bg-gray-950 cursor-pointer appearance-none transition-all shadow-sm dark:shadow-none"
                            >
                                {[2024, 2025, 2026, 2027, 2028].map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>

                            {/* Country Filter */}
                            <div className="relative flex items-center group">
                                <Filter className="absolute left-2.5 text-gray-400 dark:text-gray-500 pointer-events-none transition-colors" size={14} />
                                <select
                                    value={countryFilter}
                                    onChange={(e) => setCountryFilter(e.target.value)}
                                    className="h-9 pl-8 pr-6 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium outline-none focus:ring-2 focus:ring-blue-600/20 bg-gray-50 dark:bg-gray-950 cursor-pointer appearance-none transition-all shadow-sm dark:shadow-none"
                                >
                                    <option value="">All Countries</option>
                                    <option value="IN">India</option>
                                    <option value="US">United States</option>
                                    <option value="UK">United Kingdom</option>
                                </select>
                            </div>

                            {/* Type Filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="h-9 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium outline-none focus:ring-2 focus:ring-blue-600/20 bg-gray-50 dark:bg-gray-950 cursor-pointer appearance-none transition-all shadow-sm dark:shadow-none"
                            >
                                <option value="">All Types</option>
                                <option value="National">National</option>
                                <option value="Regional">Regional</option>
                                <option value="Optional">Optional</option>
                                <option value="Company">Company</option>
                                <option value="Religious">Religious</option>
                            </select>

                            {/* View Toggle */}
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 flex items-center">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <List size={14} />
                                </button>
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <CalendarDays size={14} />
                                </button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {viewMode === 'list' ? (
                            <HolidayTable
                                holidays={holidays}
                                isLoading={isLoading}
                                isAdmin={isAdmin}
                                onEdit={handleEditClick}
                            />
                        ) : (
                            <HolidayCalendar
                                holidays={holidays}
                                year={yearFilter}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Modals */}
                <AddHolidayModal
                    isOpen={isAddModalOpen}
                    onClose={handleModalClose}
                    editHoliday={editHoliday}
                />
                <BulkImportModal
                    isOpen={isBulkImportOpen}
                    onClose={() => setIsBulkImportOpen(false)}
                />
            </div>
        </div>
    );
}
