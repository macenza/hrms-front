
import type {
    StatCard,
    EmployeeSummaryRow,
    AttendanceRow,
    AttendanceDataPoint,
    WorkingFormatSegment,
    NavItem,
} from "@/types";

// Navigation
export const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", icon: "grid", href: "/" },
    { label: "Employees", icon: "users", href: "/employees" },
    { label: "Attendance", icon: "calendar", href: "/attendance" },
    { label: "Leave", icon: "user-x", href: "/leave" },
    { label: "Project", icon: "layers", href: "/project" },
    { label: "Payroll", icon: "file-text", href: "/payroll" },
    { label: "Loan", icon: "credit-card", href: "/loan" },
    { label: "Assets", icon: "grid", href: "/assets" },
    { label: "Notice", icon: "bell", href: "/notice" },
    { label: "Settings", icon: "settings", href: "/settings" },
];

// Stat Cards
export const STAT_CARDS: StatCard[] = [
    {
        id: "total-employee",
        title: "Total Employee",
        value: 550,
        change: "16.20%",
        changeType: "up",
        bgColor: "bg-blue-50",
        iconBg: "bg-blue-100",
    },
    {
        id: "new-employee",
        title: "New Employee",
        value: 120,
        change: "8.20%",
        changeType: "up",
        bgColor: "bg-green-50",
        iconBg: "bg-green-100",
    },
    {
        id: "today-attendance",
        title: "Today Attendance",
        value: 545,
        change: "89%",
        changeType: "up",
        bgColor: "bg-purple-50",
        iconBg: "bg-purple-100",
    },
    {
        id: "total-applicant",
        title: "Total Applicant",
        value: 250,
        change: "8.20%",
        changeType: "up",
        bgColor: "bg-teal-50",
        iconBg: "bg-teal-100",
    },
];

// Attendance Chart
export const ATTENDANCE_DATA: AttendanceDataPoint[] = [
    { day: "Mon", onTime: 75, lateArrival: 55, absent: 20 },
    { day: "Tue", onTime: 60, lateArrival: 40, absent: 30 },
    { day: "Wed", onTime: 80, lateArrival: 60, absent: 15 },
    { day: "Thu", onTime: 70, lateArrival: 50, absent: 25 },
    { day: "Fri", onTime: 65, lateArrival: 45, absent: 20 },
    { day: "Sat", onTime: 55, lateArrival: 35, absent: 35 },
    { day: "Sun", onTime: 45, lateArrival: 30, absent: 40 },
];

// Employee Summary
export const EMPLOYEE_SUMMARY: EmployeeSummaryRow[] = [
    {
        id: "1",
        name: "Cody Fisher",
        avatar: "CF",
        jobTitle: "UX Writer",
        netSalary: 450,
        status: "PAID",
    },
    {
        id: "2",
        name: "Robert Fox",
        avatar: "RF",
        jobTitle: "Web Designer",
        netSalary: 650,
        status: "PAID",
    },
    {
        id: "3",
        name: "Guy Hawkins",
        avatar: "GH",
        jobTitle: "Illustrator",
        netSalary: 250,
        status: "PENDING",
    },
];

// Attendance List
export const ATTENDANCE_LIST: AttendanceRow[] = [
    {
        id: "1",
        name: "Guy Hawkins",
        avatar: "GH",
        shift: "Morning",
        clockIn: "09:00 AM",
        clockOut: "06:00 PM",
    },
    {
        id: "2",
        name: "Cody Fisher",
        avatar: "CF",
        shift: "Morning",
        clockIn: "09:00 AM",
        clockOut: "06:00 PM",
    },
    {
        id: "3",
        name: "Robert Fox",
        avatar: "RF",
        shift: "Morning",
        clockIn: "09:00 AM",
        clockOut: "06:00 PM",
    },
];

// Working Format
export const WORKING_FORMAT: WorkingFormatSegment[] = [
    { label: "Employee Hybrid", count: 50, color: "#60A5FA" }, // blue-400
    { label: "Employee Onsite", count: 220, color: "#C4B5FD" }, // violet-300
    { label: "Employee Remote", count: 30, color: "#7C3AED" }, // violet-700
];

// Avatar colour palette (deterministic by initials hash)
export const AVATAR_COLORS: Record<string, string> = {
    CF: "bg-orange-200 text-orange-700",
    RF: "bg-blue-200 text-blue-700",
    GH: "bg-rose-200 text-rose-700",
};