"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { CalendarDays, CalendarRange, Search, ChevronDown, Upload, Loader2, Cake, LogIn, LogOut, RotateCcw } from "lucide-react";
import dynamic from 'next/dynamic';

const StatCard = dynamic(() => import("@/components/dashboard/StatCard"), { ssr: false });
const EmployeeSummary = dynamic(() => import("@/components/dashboard/EmployeeSummary"), { ssr: false });
const AttendanceList = dynamic(() => import("@/components/dashboard/AttendanceList"), { ssr: false });
const AttendanceCalendar = dynamic(() => import("@/components/attendance/AttendanceCalendar"), { ssr: false });
const AttendancePunchWidget = dynamic(() => import("@/components/dashboard/AttendancePunchWidget"), { ssr: false });
import { STAT_CARDS } from "@/lib/data";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useDashboardStats, useDashboardAttendance, useDashboardAttendanceByDateRange } from "@/hooks/api/useDashboard";
import { useActiveEmployees } from "@/hooks/api/useEmployees";
import { useClockIn, useClockOut, useMyAttendance, useResetTodayAttendance } from "@/hooks/api/useAttendance";
import { normalizeRoleDistribution } from "@/lib/dashboard";
export interface DateRange {
    from: string; // YYYY-MM-DD
    to: string;   // YYYY-MM-DD
}
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { logOut } from "@/store/authSlice";
import { logoutUser } from "@/services/authService";

const AttendanceChart = dynamic(
    () => import('@/components/dashboard/AttendanceChart'),
    {
        ssr: false,
        loading: () => (
            <div className="h-[320px] w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-pulse rounded-xl" />
        ),
    }
);

const RoleChart = dynamic(
    () => import('@/components/(hrms)/dashboard/RoleChart'),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full min-h-[340px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-pulse rounded-xl" />
        ),
    }
);

const calculateDaysToBirthday = (dobString?: string) => {
    if (!dobString) return undefined;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return undefined;
    const today = new Date();
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (todayZero > nextBirthday) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const diffTime = nextBirthday.getTime() - todayZero.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isAdminOrHR = role === 'admin' || role === 'hr';
    const isEmployee = role === 'employee';
    const [attendanceTimeframe, setAttendanceTimeframe] = useState<'week' | 'month'>('month');
    const activeTimeframe = isEmployee ? 'month' : attendanceTimeframe;
    const [activeDateRange, setActiveDateRange] = useState<DateRange | null>(null);

    const [colorPaletteIndex, setColorPaletteIndex] = useState(0);
    const cycleColorPalette = () => {
        setColorPaletteIndex(prev => (prev + 1) % 6);
    };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [customError, setCustomError] = useState('');
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isDropdownOpen) {
            if (activeDateRange) {
                setShowCustomPicker(true);
                setCustomFrom(activeDateRange.from);
                setCustomTo(activeDateRange.to);
            } else {
                setShowCustomPicker(false);
            }
        }
    }, [isDropdownOpen, activeDateRange]);

    const handleApplyCustomFilter = () => {
        setCustomError('');
        if (!customFrom || !customTo) {
            setCustomError('Please select both From and To dates.');
            return;
        }
        if (customFrom > customTo) {
            setCustomError('"From" date cannot be after "To" date.');
            return;
        }
        setActiveDateRange({ from: customFrom, to: customTo });
        setIsDropdownOpen(false);
        cycleColorPalette();
    };

    const handleResetCustomFilter = () => {
        setCustomFrom('');
        setCustomTo('');
        setCustomError('');
        setActiveDateRange(null);
        setAttendanceTimeframe('month');
        setIsDropdownOpen(false);
        cycleColorPalette();
    };

    const dropdownLabel = useMemo(() => {
        if (activeDateRange) {
            const formatDate = (dateStr: string) => {
                const [year, month, day] = dateStr.split('-');
                return `${day}/${month}/${year}`;
            };
            return `${formatDate(activeDateRange.from)} - ${formatDate(activeDateRange.to)}`;
        }
        return activeTimeframe === 'week' ? 'This Week' : 'This Month';
    }, [activeDateRange, activeTimeframe]);

    const { data: stats, isLoading: isStatsLoading } = useDashboardStats(
        isAuthenticated && isAdminOrHR
    );

    const { data: timeframeAttendance, isLoading: isTimeframeLoading } =
        useDashboardAttendance(activeTimeframe);

    const { data: rangeAttendance, isLoading: isRangeLoading } =
        useDashboardAttendanceByDateRange(activeDateRange);

    // Use range data when a filter is active, otherwise fall back to timeframe data
    const attendanceData = activeDateRange ? rangeAttendance : timeframeAttendance;
    const isAttendanceLoading = activeDateRange ? isRangeLoading : isTimeframeLoading;

    const dispatch = useAppDispatch();
    const { data: myAttendance, isLoading: isMyAttendanceLoading } = useMyAttendance();
    const clockInMutation = useClockIn();
    const clockOutMutation = useClockOut();

    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const resetAttendanceMutation = useResetTodayAttendance();

    const handleResetAttendance = async () => {
        setIsResetModalOpen(false);
        try {
            await resetAttendanceMutation.mutateAsync();
            toast.success("Today's attendance has been reset successfully.");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Reset failed";
            toast.error(msg);
        }
    };
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        };
        updateClock();
        const timeInterval = setInterval(updateClock, 1000);
        return () => clearInterval(timeInterval);
    }, []);

    const todayString = useMemo(() => new Date().toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'), []);
    const todayLog = useMemo(() => myAttendance?.logs?.find((log: any) => log.dateString === todayString), [myAttendance, todayString]);
    
    const isClockedIn = todayLog && !todayLog.checkOutTime;
    const isClockedOut = todayLog && todayLog.checkOutTime;
    
    const isPunchPending = clockInMutation.isPending || clockOutMutation.isPending;

    const handleClockIn = async () => {
        if (isClockedIn) {
            toast.error("You are already checked in!");
            return;
        }
        if (isClockedOut) {
            toast.error("You have already checked out for today!");
            return;
        }
        try {
            await clockInMutation.mutateAsync('Office');
            toast.success("Checked in successfully!");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Check-in failed";
            toast.error(msg);
        }
    };

    const handleLogoutAfterCheckout = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.error("Backend logout failed:", err);
        } finally {
            dispatch(logOut());
            router.push('/login');
        }
    };

    const handleClockOutClick = () => {
        if (!isClockedIn) {
            toast.error("You must check in first!");
            return;
        }
        setIsCheckoutModalOpen(true);
    };

    const confirmCheckout = async (shouldLogout: boolean) => {
        setIsCheckoutModalOpen(false);
        try {
            await clockOutMutation.mutateAsync();
            toast.success("Checked out successfully!");
            if (shouldLogout) {
                toast.info("Logging out...");
                await handleLogoutAfterCheckout();
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Check-out failed";
            toast.error(msg);
        }
    };

    const adaptedStats = stats
        ? { ...stats, totalEmployees: stats.totalUsers, activeEmployees: stats.activeUsers }
        : null;

    const roleDistribution = useMemo(() => {
        if (stats?.roleDistribution && stats.roleDistribution.length > 0) {
            return stats.roleDistribution;
        }
        const source =
            attendanceData?.workingFormat &&
            Object.keys(attendanceData.workingFormat).length > 0
                ? attendanceData.workingFormat
                : stats?.usersByRole;
        return normalizeRoleDistribution(source);
    }, [stats?.roleDistribution, attendanceData?.workingFormat, stats?.usersByRole]);

    // Fetch all active employees for birthday reminders (Admin/HR only)
    const { data: allEmployees } = useActiveEmployees();

    const upcomingBirthdays = useMemo(() => {
        if (!allEmployees) return [];
        return allEmployees
            .map((emp: any) => ({
                emp,
                days: calculateDaysToBirthday(emp.dob),
            }))
            .filter((item: any) => item.days !== undefined && item.days <= 10)
            .sort((a: any, b: any) => (a.days ?? 0) - (b.days ?? 0));
    }, [allEmployees]);

    const csvContent = useMemo(() => {
        if (!stats) return null;

        const rows: any[][] = [];

        // 1. Overview Cards Metrics Section
        rows.push(["--- DASHBOARD OVERVIEW METRICS ---"]);
        rows.push(["Metric", "Value"]);
        rows.push(["Total Employees", stats.totalUsers ?? 0]);
        rows.push(["Active Employees", stats.activeUsers ?? 0]);
        rows.push(["Inactive Employees", stats.inactiveUsers ?? 0]);
        rows.push(["New Hires (Last 30 Days)", stats.newUsers ?? 0]);
        rows.push(["Today's Present Employees", attendanceData?.todayPresent ?? 0]);
        rows.push(["Today's Attendance Rate", stats.totalUsers > 0 ? `${Math.round(((attendanceData?.todayPresent ?? 0) / stats.totalUsers) * 100)}%` : "0%"]);
        rows.push(["Total Applicants", stats.totalApplicants ?? 0]);
        rows.push(["Open Positions", stats.openPositions ?? 0]);
        rows.push([]);

        // 2. Department Breakdown Section
        rows.push(["--- DEPARTMENT DISTRIBUTION ---"]);
        rows.push(["Department", "Employee Count"]);
        Object.entries(stats.usersByTeam || {}).forEach(([team, count]) => {
            rows.push([team || "Unassigned", count]);
        });
        rows.push([]);

        // 3. Role Breakdown Section
        rows.push(["--- ROLE DISTRIBUTION ---"]);
        rows.push(["Role", "Employee Count"]);
        Object.entries(stats.usersByRole || {}).forEach(([role, count]) => {
            const displayRole = role.charAt(0).toUpperCase() + role.slice(1);
            rows.push([displayRole, count]);
        });
        rows.push([]);

        // 4. Recent Hires Section
        rows.push(["--- RECENT HIRES ---"]);
        rows.push(["Employee ID", "Name", "Role/Designation", "Joining Date", "Status"]);
        (stats.recentEmployees || []).forEach((emp: any) => {
            rows.push([
                emp.employeeId || "N/A",
                emp.name,
                emp.jobTitle,
                emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : "N/A",
                emp.status
            ]);
        });
        rows.push([]);

        // 5. Pending Leaves Section
        rows.push(["--- PENDING LEAVE REQUESTS ---"]);
        rows.push(["Employee Name", "Leave Type", "Duration (Days)", "Requested On"]);
        (stats.pendingLeaves || []).forEach((leave: any) => {
            rows.push([
                leave.employeeName,
                leave.leaveType,
                leave.numberOfDays,
                leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : "N/A"
            ]);
        });

        // Map to standard CSV format with cell escaping
        return rows
            .map((row) => 
                row.map((cell) => {
                    const stringVal = cell === undefined || cell === null ? "" : String(cell);
                    if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n")) {
                        return `"${stringVal.replace(/"/g, '""')}"`;
                    }
                    return stringVal;
                }).join(",")
            )
            .join("\n");
    }, [stats, attendanceData]);

    const handleExport = () => {
        if (!csvContent) return;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `HRMS_Report_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 flex items-center gap-3 transition-colors">
                        {isEmployee ? "My Dashboard" : "Dashboard Overview"}
                        {(isStatsLoading || isAttendanceLoading) && (
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        )}
                    </h1>
                    <div className="flex items-center gap-3">
                        {isAuthenticated && (
                            <div className="flex items-center gap-3.5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 shadow-md transition-all duration-300">
                                {/* Live Status Clock */}
                                <div className="hidden xs:flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-800/50">
                                    <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500' : 'bg-rose-500 animate-pulse shadow-sm shadow-rose-500'}`} />
                                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none">
                                        {isClockedIn ? 'Clocked In' : 'Clocked Out'}
                                    </span>
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 font-mono tabular-nums border-l border-gray-200 dark:border-gray-800 pl-2">
                                        {currentTime || '00:00:00'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={handleClockIn}
                                        disabled={isPunchPending || isClockedIn || isClockedOut || isMyAttendanceLoading}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 select-none group
                                            ${isClockedIn || isClockedOut
                                                ? 'bg-gray-100 dark:bg-gray-800/40 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent'
                                                : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 text-white cursor-pointer border border-emerald-600/10 shadow-[0_0_12px_rgba(16,185,129,0.2)] animate-pulse'
                                            }
                                        `}
                                    >
                                        <LogIn className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-12 group-hover:-translate-x-0.5" />
                                        {clockInMutation.isPending ? 'Checking In...' : 'Check In'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleClockOutClick}
                                        disabled={isPunchPending || !isClockedIn || isMyAttendanceLoading}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 select-none group
                                            ${!isClockedIn
                                                ? 'bg-gray-100 dark:bg-gray-800/40 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent'
                                                : 'bg-rose-600 hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/30 active:scale-95 text-white cursor-pointer border border-rose-600/10 shadow-[0_0_12px_rgba(244,63,94,0.2)] animate-pulse'
                                            }
                                        `}
                                    >
                                        <LogOut className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                                        {clockOutMutation.isPending ? 'Checking Out...' : 'Check Out'}
                                    </button>
                                </div>
                            </div>
                        )}
                        {isEmployee ? (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold capitalize bg-white/70 dark:bg-gray-900/70 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-850 shadow-md opacity-80 select-none">
                                <CalendarDays className="w-4 h-4 text-blue-500" />
                                This {activeTimeframe}
                            </div>
                        ) : (
                            <div ref={dropdownRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(prev => !prev)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border bg-white/70 dark:bg-gray-900/70 backdrop-blur-md text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-850 hover:bg-white dark:hover:bg-gray-900 cursor-pointer shadow-md hover:shadow-lg hover:shadow-slate-500/5 duration-200 select-none"
                                >
                                    <CalendarDays className="w-4 h-4 text-blue-500" />
                                    <span>{dropdownLabel}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-80 rounded-2xl border bg-white dark:bg-gray-950 border-gray-200/80 dark:border-gray-800 shadow-xl dark:shadow-none p-2.5 z-50 flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                                        <div className="px-2 py-1.5">
                                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Select Range</p>
                                        </div>

                                        {/* Option: This Month */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAttendanceTimeframe('month');
                                                setActiveDateRange(null);
                                                setIsDropdownOpen(false);
                                                cycleColorPalette();
                                            }}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left w-full
                                                ${activeTimeframe === 'month' && !activeDateRange
                                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4" />
                                                <span>This Month</span>
                                            </div>
                                            {activeTimeframe === 'month' && !activeDateRange && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            )}
                                        </button>

                                        {/* Option: This Week */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAttendanceTimeframe('week');
                                                setActiveDateRange(null);
                                                setIsDropdownOpen(false);
                                                cycleColorPalette();
                                            }}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left w-full
                                                ${activeTimeframe === 'week' && !activeDateRange
                                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-2">
                                                <CalendarDays className="w-4 h-4" />
                                                <span>This Week</span>
                                            </div>
                                            {activeTimeframe === 'week' && !activeDateRange && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            )}
                                        </button>

                                        {/* Option: Custom Range */}
                                        <button
                                            type="button"
                                            onClick={() => setShowCustomPicker(prev => !prev)}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left w-full
                                                ${activeDateRange || showCustomPicker
                                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-2">
                                                <CalendarRange className="w-4 h-4" />
                                                <span>Custom Range</span>
                                            </div>
                                            {(activeDateRange || showCustomPicker) && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            )}
                                        </button>

                                        {/* Expandable inline sub-panel */}
                                        {showCustomPicker && (
                                            <div className="flex flex-col gap-3 p-3 mt-1.5 border-t border-gray-150 dark:border-gray-800/80 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex items-center justify-between gap-2.5">
                                                    <div className="flex flex-col gap-1 flex-1">
                                                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 select-none">From</label>
                                                        <input
                                                            type="date"
                                                            value={customFrom}
                                                            max={customTo || todayStr}
                                                            onChange={(e) => { setCustomFrom(e.target.value); setCustomError(''); }}
                                                            className="h-8 px-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-205 bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all cursor-pointer"
                                                        />
                                                    </div>
                                                    <span className="text-gray-300 dark:text-gray-600 text-xs mt-4 select-none">→</span>
                                                    <div className="flex flex-col gap-1 flex-1">
                                                        <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 select-none">To</label>
                                                        <input
                                                            type="date"
                                                            value={customTo}
                                                            min={customFrom || undefined}
                                                            max={todayStr}
                                                            onChange={(e) => { setCustomTo(e.target.value); setCustomError(''); }}
                                                            className="h-8 px-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-205 bg-gray-50 dark:bg-gray-900 border border-gray-205 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                                {customError && (
                                                    <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400 animate-in fade-in duration-200">
                                                        ⚠ {customError}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={handleApplyCustomFilter}
                                                        className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-sm cursor-pointer"
                                                    >
                                                        <Search className="w-3 h-3" />
                                                        Apply Filter
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleResetCustomFilter}
                                                        disabled={!activeDateRange && !customFrom && !customTo}
                                                        className="flex items-center gap-1 h-8 px-3 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                                    >
                                                        <RotateCcw className="w-3 h-3" />
                                                        Reset
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {isAdminOrHR && (
                            <button
                                type="button"
                                onClick={handleExport}
                                disabled={!stats || isStatsLoading}
                                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border bg-white/70 dark:bg-gray-900/70 backdrop-blur-md text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-850 hover:bg-white dark:hover:bg-gray-900 cursor-pointer shadow-md hover:shadow-lg hover:shadow-slate-500/5 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Upload className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                Export CSV
                            </button>
                        )}
                        {isAdminOrHR && (
                            <button
                                type="button"
                                onClick={() => setIsResetModalOpen(true)}
                                disabled={resetAttendanceMutation.isPending}
                                title="Temporary: Reset today's attendance records"
                                className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border bg-amber-50/80 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 hover:bg-amber-100 dark:hover:bg-amber-500/20 cursor-pointer shadow-md hover:shadow-lg duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resetAttendanceMutation.isPending
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <RotateCcw className="w-4 h-4" />}
                                Reset Attendance
                            </button>
                        )}
                    </div>
                </div>

                {isAdminOrHR && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {STAT_CARDS.map((card) => (
                            <StatCard
                                key={card.id}
                                card={card}
                                statsData={adaptedStats}
                                attendanceData={attendanceData}
                                isLoading={isStatsLoading || isAttendanceLoading}
                            />
                        ))}
                    </div>
                )}


                {/* Upcoming Birthdays (Admin/HR only) */}
                {isAdminOrHR && upcomingBirthdays.length > 0 && (
                    <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 dark:from-pink-500/20 dark:via-purple-500/20 dark:to-blue-500/20 rounded-xl p-5 border border-pink-500/20 dark:border-pink-500/30 shadow-sm animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-2 mb-3">
                            <Cake className="w-5 h-5 text-pink-500" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                Upcoming Birthdays (Within 10 Days)
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {upcomingBirthdays.map(({ emp, days }: any) => {
                                const dayText = days === 0 ? "Today! 🎂" : days === 1 ? "Tomorrow!" : `in ${days} days`;
                                return (
                                    <div
                                        key={emp.id}
                                        onClick={() => router.push(`/employees/${emp.id}`)}
                                        className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-lg shadow-sm cursor-pointer hover:shadow transition-all duration-200"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center font-bold text-pink-600 dark:text-pink-400 text-sm shrink-0">
                                            {emp.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{emp.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                {emp.department} · <span className="font-bold text-pink-600 dark:text-pink-400">{dayText}</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {isEmployee ? (
                        <>
                            <div className="lg:col-span-3">
                                <AttendanceCalendar employeeId={user?.id || user?._id || ""} />
                            </div>
                            <div className="lg:col-span-2">
                                <AttendancePunchWidget />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={isAdminOrHR ? "lg:col-span-3" : "lg:col-span-5"}>
                                <AttendanceChart
                                    timeframe={activeTimeframe}
                                    isEmployee={isEmployee}
                                    chartData={attendanceData}
                                    isLoading={isAttendanceLoading}
                                    dateRange={activeDateRange}
                                    colorPaletteIndex={colorPaletteIndex}
                                />
                            </div>
                            {isAdminOrHR && (
                                <div className="lg:col-span-2">
                                    <EmployeeSummary
                                        employees={stats?.recentEmployees ?? []}
                                        isLoading={isStatsLoading}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className={isAdminOrHR ? "lg:col-span-3" : "lg:col-span-5"}>
                        <AttendanceList
                            isEmployee={isEmployee}
                            listData={stats?.pendingLeaves ?? []}
                            isLoading={isStatsLoading}
                        />
                    </div>
                    {isAdminOrHR && (
                        <div className="lg:col-span-2">
                            <RoleChart
                                roleDistribution={stats?.roleDistribution}
                                totalEmployees={stats?.totalUsers}
                                isLoading={isStatsLoading}
                                disableAnimations={true}
                            />
                        </div>
                    )}
                </div>

            </div>
            {/* Reset Attendance Confirmation Modal */}
            <Modal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                title="Reset Today's Attendance"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                        <RotateCcw className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                            This will <strong>permanently delete all attendance records for today</strong> — including all check-ins and check-outs. This action cannot be undone.
                        </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        This is a temporary developer utility. Use with caution.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-end mt-2">
                        <button
                            type="button"
                            onClick={() => setIsResetModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleResetAttendance}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-400 transition-all cursor-pointer"
                        >
                            Yes, Reset Attendance
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Checkout Confirmation Modal */}
            <Modal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                title="Confirm Checkout"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        You are about to check out for today. Would you like to log out of your session as well?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
                        <button
                            type="button"
                            onClick={() => setIsCheckoutModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => confirmCheckout(false)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer"
                        >
                            Just Checkout
                        </button>
                        <button
                            type="button"
                            onClick={() => confirmCheckout(true)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer"
                        >
                            Checkout & Logout
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}