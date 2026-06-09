'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, XCircle, CalendarRange, Clock, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import AttendanceCalendar, { getAttendanceLabel } from '@/components/attendance/AttendanceCalendar';

export interface EmployeeAttendanceStats {
    present: number;
    absent: number;
    onLeave: number;
    lateCheckIns: number;
}

export type AttendanceLogStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave' | 'Holiday' | 'Weekend' | 'Work From Home' | 'Missing Punch';

export interface AttendanceLogRecord {
    id: string;
    _id?: string;
    date: string;
    checkIn: string;
    checkOut: string;
    totalHours: string;
    status: string;
    shift: string;
    remarks: string;
}

interface AttendanceTabProps {
    employeeId: string;
    stats?: EmployeeAttendanceStats;
    logs?: AttendanceLogRecord[] | any;
    isLoading?: boolean; 
}

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Present':
        case 'Work From Home':
            return 'success';
        case 'Late':
        case 'Leave':
            return 'warning';
        case 'Half Day':
        case 'Holiday':
            return 'info';
        case 'Absent':
        case 'Missing Punch':
            return 'error';
        default:
            return 'default';
    }
};

// Premium Skeleton Loaders
const StatCardSkeleton = () => (
    <Card className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 transition-colors">
        <CardContent className="p-5">
            <div className="flex justify-between items-start mb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse shrink-0" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse mt-2" />
        </CardContent>
    </Card>
);

const TableRowSkeleton = () => (
    <tr className="animate-pulse bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="hidden lg:table-cell px-6 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="hidden lg:table-cell px-6 py-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="lg:hidden px-6 py-4 text-center"><div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded mx-auto"></div></td>
    </tr>
);

export default function AttendanceTab({
    employeeId,
    stats,
    logs = [],
    isLoading = false
}: AttendanceTabProps) {

    const [calendarData, setCalendarData] = useState<any>(null);
    const [isCalendarLoading, setIsCalendarLoading] = useState<boolean>(true);
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const isDataLoading = isLoading || isCalendarLoading;

    // Filter non-future days that are weekdays or have clock-in details
    const attendanceList = useMemo(() => {
        if (!calendarData?.records) return [];
        return [...calendarData.records]
            .filter((r: any) => {
                const hasPunch = r.checkIn !== '--' || r.checkOut !== '--';
                const isPastWeekday = r.status && !['WEEKEND', 'HOLIDAY'].includes(r.status);
                return hasPunch || isPastWeekday;
            })
            .reverse();
    }, [calendarData]);

    // Format logs into AttendanceLogRecord-compliant shape
    const formattedLogs = useMemo(() => {
        return attendanceList.map((record: any, index: number) => {
            const date = record.date 
                ? new Date(record.date + 'T12:00:00.000Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                : '---';

            return {
                id: record.date || String(index),
                date,
                checkIn: record.checkIn,
                checkOut: record.checkOut,
                totalHours: record.duration,
                status: getAttendanceLabel(record.status),
                shift: record.shift || '---',
                remarks: record.notes || '---'
            } as AttendanceLogRecord;
        });
    }, [attendanceList]);

    const safeStats = useMemo(() => {
        if (calendarData) {
            return {
                present: calendarData.summary.present || 0,
                absent: calendarData.summary.absent || 0,
                onLeave: calendarData.summary.leave || 0,
                halfDay: calendarData.summary.halfDay || 0,
                attendancePercentage: calendarData.summary.attendancePercentage || 100
            };
        }
        return { present: 0, absent: 0, onLeave: 0, halfDay: 0, attendancePercentage: 100 };
    }, [calendarData]);

    const statCards = [
        {
            title: "Present Days",
            value: safeStats.present,
            icon: <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />,
            bgClass: "bg-emerald-50 dark:bg-emerald-500/10",
            className: "col-span-1"
        },
        {
            title: "Absent",
            value: safeStats.absent,
            icon: <XCircle size={18} className="text-red-600 dark:text-red-400" />,
            bgClass: "bg-red-50 dark:bg-red-500/10",
            className: "col-span-1"
        },
        {
            title: "On Leave",
            value: safeStats.onLeave,
            icon: <CalendarRange size={18} className="text-yellow-600 dark:text-yellow-400" />,
            bgClass: "bg-yellow-50 dark:bg-yellow-500/10",
            className: "col-span-1"
        },
        {
            title: "Half Day",
            value: safeStats.halfDay,
            icon: <Clock size={18} className="text-amber-600 dark:text-amber-400" />,
            bgClass: "bg-amber-50 dark:bg-amber-500/10",
            className: "col-span-1"
        },
        {
            title: "Attendance Rate",
            value: `${safeStats.attendancePercentage}%`,
            icon: <Calendar size={18} className="text-blue-600 dark:text-blue-400" />,
            bgClass: "bg-blue-50 dark:bg-blue-500/10",
            className: "col-span-1 md:col-span-2 lg:col-span-1"
        }
    ];

    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Stats Overview */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Attendance Overview (This Month)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {isDataLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <Card 
                                key={i} 
                                className={cn(
                                    "border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 transition-colors",
                                    i === 4 ? "col-span-1 md:col-span-2 lg:col-span-1" : "col-span-1"
                                )}
                            >
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                                        <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse shrink-0" />
                                    </div>
                                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse mt-2" />
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        statCards.map((stat, index) => (
                            <Card 
                                key={index} 
                                className={cn(
                                    "border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-md dark:hover:shadow-none hover:border-blue-200 dark:hover:border-blue-900/50",
                                    stat.className
                                )}
                            >
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{stat.title}</p>
                                        <div className={cn("p-1.5 rounded-lg transition-colors", stat.bgClass)}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">{stat.value}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Attendance Calendar */}
            <div className="mt-8">
                <AttendanceCalendar 
                    employeeId={employeeId} 
                    onDataFetched={setCalendarData}
                    onLoadingChange={setIsCalendarLoading}
                />
            </div>

            {/* Logs Table / Cards List */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Recent Logs</h2>
                
                {/* Desktop & Tablet Table Layout */}
                <div className="hidden md:block">
                    <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none overflow-hidden transition-colors duration-300">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-medium transition-colors">
                                    <tr>
                                        <th className="px-6 py-4 uppercase text-xs tracking-wider">Date</th>
                                        <th className="px-6 py-4 uppercase text-xs tracking-wider">Status</th>
                                        <th className="px-6 py-4 uppercase text-xs tracking-wider">Check In</th>
                                        <th className="px-6 py-4 uppercase text-xs tracking-wider">Check Out</th>
                                        <th className="px-6 py-4 uppercase text-xs tracking-wider">Total Hours</th>
                                        <th className="hidden lg:table-cell px-6 py-4 uppercase text-xs tracking-wider">Shift</th>
                                        <th className="hidden lg:table-cell px-6 py-4 uppercase text-xs tracking-wider">Remarks</th>
                                        <th className="lg:hidden px-6 py-4 text-center uppercase text-xs tracking-wider">Details</th>
                                    </tr>
                                </thead>
                                 <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                                    {isDataLoading ? (
                                        Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
                                    ) : formattedLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 transition-colors">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 transition-colors">
                                                        <Calendar size={24} className="text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-base transition-colors">No attendance logs found</p>
                                                    <p className="text-sm mt-1">There are no attendance records for this period.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        formattedLogs.map((log, index) => {
                                            const isExpanded = !!expandedRows[log.id];
                                            return (
                                                <React.Fragment key={log.id || index}>
                                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium transition-colors">{log.date}</td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant={getStatusBadgeVariant(log.status)}>
                                                                {log.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 transition-colors">{log.checkIn}</td>
                                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 transition-colors">{log.checkOut}</td>
                                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-350 font-medium transition-colors">{log.totalHours}</td>
                                                        <td className="hidden lg:table-cell px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors">{log.shift}</td>
                                                        <td className="hidden lg:table-cell px-6 py-4 text-gray-550 dark:text-gray-400 italic transition-colors truncate max-w-[200px]" title={log.remarks}>{log.remarks}</td>
                                                        <td className="lg:hidden px-6 py-4 text-center">
                                                            <button 
                                                                onClick={() => toggleRow(log.id)}
                                                                className="p-1 rounded-lg hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                                                                aria-label={isExpanded ? "Collapse Details" : "Expand Details"}
                                                            >
                                                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {isExpanded && (
                                                        <tr className="lg:hidden bg-gray-50/50 dark:bg-gray-800/20 transition-colors">
                                                            <td colSpan={6} className="px-6 py-3.5 border-b border-gray-150 dark:border-gray-800 text-xs">
                                                                <div className="grid grid-cols-2 gap-4 max-w-md">
                                                                    <div>
                                                                        <span className="block text-[9px] font-extrabold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-0.5">Shift</span>
                                                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{log.shift}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="block text-[9px] font-extrabold uppercase text-gray-500 dark:text-gray-400 tracking-wider mb-0.5">Remarks / Notes</span>
                                                                        <span className="font-semibold text-gray-700 dark:text-gray-300 italic">{log.remarks}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Mobile Cards Stack Layout */}
                <div className="block md:hidden space-y-4">
                    {isDataLoading ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm animate-pulse space-y-3">
                                <div className="flex justify-between items-center">
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : formattedLogs.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 transition-colors border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
                            <Calendar size={24} className="text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">No attendance logs found</p>
                            <p className="text-xs mt-0.5">There are no attendance records for this period.</p>
                        </div>
                    ) : (
                        formattedLogs.map((log) => (
                            <div key={log.id} className="p-4 rounded-xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all duration-300">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{log.date}</span>
                                    <Badge variant={getStatusBadgeVariant(log.status)}>
                                        {log.status}
                                    </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                                    <div>
                                        <span className="block text-[9px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Check In</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{log.checkIn}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Check Out</span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{log.checkOut}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Duration</span>
                                        <span className="font-semibold text-gray-850 dark:text-gray-200">{log.totalHours}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[9px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Shift</span>
                                        <span className="font-semibold text-gray-850 dark:text-gray-200">{log.shift}</span>
                                    </div>
                                    {log.remarks && log.remarks !== '---' && (
                                        <div className="col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2.5 mt-1">
                                            <span className="block text-[9px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Remarks / Notes</span>
                                            <p className="text-gray-600 dark:text-gray-300 italic">{log.remarks}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
}