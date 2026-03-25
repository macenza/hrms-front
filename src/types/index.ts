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
