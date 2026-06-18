"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from 'next/navigation';
import { CalendarDays, Upload, Loader2, Cake } from "lucide-react";
import dynamic from 'next/dynamic';
import StatCard from "@/components/dashboard/StatCard";
import EmployeeSummary from "@/components/dashboard/EmployeeSummary";
import AttendanceList from "@/components/dashboard/AttendanceList";
import { STAT_CARDS } from "@/lib/data";
import { useAppSelector } from "@/store/hooks";
import { useDashboardStats, useDashboardAttendance } from "@/hooks/api/useDashboard";
import { useActiveEmployees } from "@/hooks/api/useEmployees";
import { normalizeRoleDistribution } from "@/lib/dashboard";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";

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

    const { data: stats, isLoading: isStatsLoading } = useDashboardStats(
        isAuthenticated && isAdminOrHR
    );

    const { data: attendanceData, isLoading: isAttendanceLoading } =
        useDashboardAttendance(activeTimeframe);

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
                        <button
                            type="button"
                            onClick={() =>
                                !isEmployee &&
                                setAttendanceTimeframe((prev) =>
                                    prev === 'month' ? 'week' : 'month'
                                )
                            }
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all border
                                ${isEmployee ? 'cursor-default opacity-80' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'}
                                bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none
                            `}
                        >
                            <CalendarDays className="w-4 h-4 text-blue-500" />
                            This {activeTimeframe}
                        </button>
                        {isAdminOrHR && (
                            <button
                                type="button"
                                onClick={handleExport}
                                disabled={!stats || isStatsLoading}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Upload className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                Export CSV
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
                    <div className={isAdminOrHR ? "lg:col-span-3" : "lg:col-span-5"}>
                        {isEmployee ? (
                            <AttendanceCalendar employeeId={user?.id || user?._id || ""} />
                        ) : (
                            <AttendanceChart
                                timeframe={activeTimeframe}
                                isEmployee={isEmployee}
                                chartData={attendanceData}
                                isLoading={isAttendanceLoading}
                            />
                        )}
                    </div>
                    {isAdminOrHR && (
                        <div className="lg:col-span-2">
                            <EmployeeSummary
                                employees={stats?.recentEmployees ?? []}
                                isLoading={isStatsLoading}
                            />
                        </div>
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
                                isLoading={isStatsLoading}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}