import type {
    DashboardAttendance,
    DashboardStats,
    DailyAttendance,
    AttendanceRecord,
    EmployeeSummaryRow,
    RoleDistributionItem,
    PendingLeaveRequest,
} from '@/store/dashboardSlice';

/** Unwrap common API envelopes: `{ data }`, `{ success, data }`, or raw payload. */
export function unwrapApiPayload<T = Record<string, unknown>>(raw: unknown): T {
    if (raw == null || typeof raw !== 'object') {
        return {} as T;
    }
    const obj = raw as Record<string, unknown>;
    if (obj.data != null && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
        return obj.data as T;
    }
    return obj as T;
}

function toRecordOfNumbers(value: unknown): Record<string, number> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {};
    }
    return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
            .map(([key, val]) => {
                const n = Number(val);
                return [key, n] as const;
            })
            .filter((entry): entry is [string, number] => {
                const n = entry[1];
                return Number.isFinite(n) && n >= 0;
            })
    );
}

function normalizeDailyChart(items: unknown): DailyAttendance[] {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const row = item as Record<string, unknown>;
            const id =
                (typeof row._id === 'string' && row._id) ||
                (typeof row.date === 'string' && row.date) ||
                (typeof row.day === 'string' && row.day) ||
                '';
            if (!id) return null;
            return {
                _id: id,
                present: Number(row.present ?? row.presentCount ?? 0) || 0,
                absent: Number(row.absent ?? row.absentCount ?? 0) || 0,
            };
        })
        .filter((row): row is DailyAttendance => row !== null);
}

function normalizeRecentList(items: unknown): AttendanceRecord[] {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const row = item as Record<string, unknown>;
            const id = typeof row._id === 'string' ? row._id : String(row.id ?? '');
            if (!id) return null;

            const userRaw = row.user;
            let user: AttendanceRecord['user'];
            if (userRaw && typeof userRaw === 'object') {
                const u = userRaw as Record<string, unknown>;
                user = {
                    _id: String(u._id ?? u.id ?? ''),
                    name: String(u.name ?? 'Unknown'),
                    profile:
                        u.profile && typeof u.profile === 'object'
                            ? (u.profile as { avatar?: string })
                            : undefined,
                };
            } else {
                user = {
                    _id: String(row.userId ?? ''),
                    name: String(row.employeeName ?? row.name ?? 'Unknown'),
                };
            }

            const checkIn =
                (typeof row.checkInTime === 'string' && row.checkInTime) ||
                (typeof row.clockIn === 'string' && row.clockIn) ||
                (typeof row.checkIn === 'string' && row.checkIn) ||
                '';
            if (!checkIn) return null;

            const checkOut =
                (typeof row.checkOutTime === 'string' && row.checkOutTime) ||
                (typeof row.clockOut === 'string' && row.clockOut) ||
                (typeof row.checkOut === 'string' && row.checkOut) ||
                null;

            return {
                _id: id,
                user,
                checkInTime: checkIn,
                checkOutTime: checkOut,
                status: String(row.status ?? 'present'),
            };
        })
        .filter((row): row is AttendanceRecord => row !== null);
}

function normalizeRecentEmployees(items: unknown): EmployeeSummaryRow[] {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const row = item as Record<string, unknown>;
            const id = String(row._id ?? row.id ?? '');
            if (!id) return null;
            const name = String(row.name ?? 'Unknown');
            const isActive = row.isActive !== false;
            const employee: EmployeeSummaryRow = {
                _id: id,
                name,
                jobTitle: String(row.jobTitle ?? row.role ?? row.designation ?? 'N/A'),
                netSalary: Number(row.netSalary ?? row.salary ?? 0) || 0,
                status: String(row.status ?? (isActive ? 'ACTIVE' : 'INACTIVE')),
                employeeId: typeof row.employeeId === 'string' ? row.employeeId : undefined,
                joiningDate: typeof row.joiningDate === 'string' ? row.joiningDate : undefined,
            };
            const avatar =
                typeof row.avatar === 'string'
                    ? row.avatar
                    : typeof (row.profile as { avatar?: string } | undefined)?.avatar === 'string'
                      ? (row.profile as { avatar: string }).avatar
                      : undefined;
            if (avatar) employee.avatar = avatar;
            return employee;
        })
        .filter((row): row is EmployeeSummaryRow => row !== null);
}

function normalizePendingLeaves(items: unknown): PendingLeaveRequest[] {
    if (!Array.isArray(items)) return [];
    const result: PendingLeaveRequest[] = [];
    for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const row = item as Record<string, unknown>;
        const id = String(row._id ?? row.id ?? '');
        if (!id) continue;
        result.push({
            _id: id,
            employeeName: String(row.employeeName ?? 'Unknown'),
            avatar: typeof row.avatar === 'string' ? row.avatar : undefined,
            leaveType: String(row.leaveType ?? 'Casual'),
            numberOfDays: Number(row.numberOfDays ?? 0) || 0,
            createdAt: String(row.createdAt ?? new Date().toISOString())
        });
    }
    return result;
}

export function normalizeRoleDistributionArray(items: unknown): RoleDistributionItem[] {
    if (!Array.isArray(items)) return [];
    return items
        .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const row = item as Record<string, unknown>;
            const name = String(row.name ?? row._id ?? 'Unspecified');
            const value = Number(row.value ?? row.count ?? 0) || 0;
            return {
                name: formatRoleLabel(name),
                value,
            };
        })
        .filter((row): row is RoleDistributionItem => row !== null);
}

export function normalizeDashboardStats(raw: unknown): DashboardStats {
    const payload = unwrapApiPayload(raw);
    const recentRaw =
        payload.recentEmployees ??
        payload.recentUsers ??
        payload.employees ??
        [];

    const usersByRole = toRecordOfNumbers(payload.usersByRole ?? payload.roles);
    let roleDistribution = normalizeRoleDistributionArray(payload.roleDistribution);

    // Bulletproof fallback: if roleDistribution is empty, construct it from usersByRole
    if (roleDistribution.length === 0 && Object.keys(usersByRole).length > 0) {
        roleDistribution = Object.entries(usersByRole).map(([role, count]) => ({
            name: formatRoleLabel(role),
            value: count,
        }));
    }

    return {
        totalUsers: Number(payload.totalUsers ?? payload.totalEmployees ?? 0) || 0,
        newUsers: Number(payload.newUsers ?? payload.newEmployees ?? 0) || 0,
        activeUsers: Number(payload.activeUsers ?? payload.activeEmployees ?? 0) || 0,
        inactiveUsers: Number(payload.inactiveUsers ?? payload.inactiveEmployees ?? 0) || 0,
        usersByRole,
        usersByTeam: toRecordOfNumbers(payload.usersByTeam ?? payload.teams),
        recentEmployees: normalizeRecentEmployees(recentRaw),
        pendingLeaves: normalizePendingLeaves(payload.pendingLeaves),
        roleDistribution,
        totalApplicants: Number(payload.totalApplicants ?? 0) || 0,
        openPositions: Number(payload.openPositions ?? 0) || 0,
    };
}

export function normalizeDashboardAttendance(raw: unknown): DashboardAttendance {
    const payload = unwrapApiPayload(raw);
    const chartRaw =
        payload.overviewChart ??
        payload.chart ??
        payload.attendanceOverview ??
        payload.dailyStats ??
        [];

    const listRaw =
        payload.recentList ??
        payload.logs ??
        payload.recentCheckIns ??
        payload.checkIns ??
        [];

    const workingFormat =
        toRecordOfNumbers(payload.workingFormat) ||
        toRecordOfNumbers(payload.workFormats) ||
        toRecordOfNumbers(payload.formatDistribution);

    return {
        todayPresent:
            Number(
                payload.todayPresent ??
                    payload.presentToday ??
                    payload.todayAttendance ??
                    0
            ) || 0,
        workingFormat,
        overviewChart: normalizeDailyChart(chartRaw),
        recentList: normalizeRecentList(listRaw),
    };
}

/** Capitalize role keys for chart legend (e.g. `hr` → `HR`, `employee` → `Employee`). */
export function formatRoleLabel(role: string): string {
    if (!role) return 'Unspecified';
    const lower = role.toLowerCase();
    if (lower === 'hr') return 'HR';
    if (lower === 'admin') return 'Admin';
    if (lower === 'employee') return 'Employee';
    if (lower === 'manager') return 'Manager';
    return role.charAt(0).toUpperCase() + role.slice(1);
}

export function normalizeRoleDistribution(
    data: Record<string, number> | undefined
): Record<string, number> {
    if (!data) return {};
    return Object.fromEntries(
        Object.entries(data).map(([role, count]) => [formatRoleLabel(role), count])
    );
}
