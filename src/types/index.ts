/** Navigation item shape used in the sidebar */
export interface NavItem {
    label: string;
    icon: string;
    href: string;
    children?: NavItem[];
}

/** Stat card data shape */
export interface StatCard {
    id: string;
    title: string;
    value: string | number;
    change: string;
    changeType: "up" | "down";
    bgColor: string;
    iconBg: string;
}

/** Employee summary row */
export interface EmployeeSummaryRow {
    id: string;
    name: string;
    avatar: string;
    jobTitle: string;
    netSalary: number;
    status: "PAID" | "PENDING" | "OVERDUE";
    employeeId?: string;
}

/** Attendance list row */
export interface AttendanceRow {
    id: string;
    name: string;
    avatar: string;
    shift: string;
    clockIn: string;
    clockOut: string;
}

/** Weekly attendance chart data point */
export interface AttendanceDataPoint {
    day: string;
    onTime: number;
    lateArrival: number;
    absent: number;
}

/** Working format segment */
export interface WorkingFormatSegment {
    label: string;
    count: number;
    color: string;
}

export type Theme = "light" | "dark";


export type Role = 'Employee' | 'Manager' | 'HR' | 'Admin';
export type LeaveType = 'Sick' | 'Vacation' | 'Personal' | 'Emergency' | 'Other';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: Role;
    team?: string;
    isActive: boolean;
    joinedAt: string;
    profile?: {
        phone?: string;
        address?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Leave {
    _id: string;
    userId: string | User; // Depending on if backend populates the user
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    numberOfDays: number;
    reason: string;
    status: LeaveStatus;
    reviewedBy?: string | User;
    reviewedAt?: string;
    rejectionReason?: string;
    requestedAt: string;
    createdAt: string;
    updatedAt: string;
}

// Signup payload
export interface SignupPayload {
    name: string;
    email: string;
    password: string;
    role: string;
    team: string;
    profile: {
        phone: string;
        address: string;
    };
}