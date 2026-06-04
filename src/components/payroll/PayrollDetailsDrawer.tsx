// src/components/payroll/PayrollDetailsDrawer.tsx
'use client';

import React from 'react';
import { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    User,
    Building2,
    Briefcase,
    CalendarCheck,
    CalendarMinus,
    IndianRupee,
    Wallet,
    ArrowDownRight,
    Hash,
    Clock,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { PayrollAccrualRow } from './PayrollDataTable';

// ─── TYPES ──────────────────────────────────────────────────────
interface PayrollDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    data: PayrollAccrualRow | null;
}

// ─── HELPERS ────────────────────────────────────────────────────
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);

const getInitials = (name: string) =>
    name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-500', 'bg-emerald-500', 'bg-purple-500',
        'bg-orange-500', 'bg-pink-500', 'bg-teal-500',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

// ─── SECTION COMPONENT ─────────────────────────────────────────
function DrawerSection({
    title,
    icon: Icon,
    children,
    className,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('px-6', className)}>
            <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Icon size={14} className="text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {title}
                </h3>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                {children}
            </div>
        </div>
    );
}

// ─── DATA ROW ───────────────────────────────────────────────────
function DataRow({
    label,
    value,
    valueClassName,
    isLast = false,
}: {
    label: string;
    value: React.ReactNode;
    valueClassName?: string;
    isLast?: boolean;
}) {
    return (
        <div
            className={cn(
                'flex items-center justify-between px-4 py-3',
                !isLast && 'border-b border-gray-100 dark:border-gray-800/60'
            )}
        >
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
            <span className={cn('text-sm font-semibold text-gray-900 dark:text-gray-100', valueClassName)}>
                {value}
            </span>
        </div>
    );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function PayrollDetailsDrawer({ isOpen, onClose, data }: PayrollDetailsDrawerProps) {
    if (!data) return null;

    const emp = data.employee;
    const name = emp?.name || 'Unknown';
    const empId = emp?.employeeId || 'N/A';
    const department = emp?.profile?.employment?.department || 'Unassigned';
    const designation = emp?.profile?.employment?.designation || '—';
    const period = `${MONTH_NAMES[data.month - 1] || ''} ${data.year}`;

    // Attendance derived values
    const absentDays = Math.max(0, data.daysConsidered - data.daysAttended - data.lwpDays);
    const attendancePct = data.daysConsidered > 0
        ? Math.round((data.daysAttended / data.daysConsidered) * 100)
        : 0;

    // Deduction percentage
    const deductionPct = data.accruedGross > 0
        ? Math.round((data.accruedDeductions / data.accruedGross) * 100)
        : 0;

    return (
        <Sheet isOpen={isOpen} onClose={onClose} side="right">
            {/* ── Header with Avatar ── */}
            <SheetHeader className="pb-0">
                <div className="flex items-center gap-4 mb-1">
                    <div
                        className={cn(
                            'w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg',
                            getAvatarColor(name)
                        )}
                    >
                        {getInitials(name)}
                    </div>
                    <div className="min-w-0">
                        <SheetTitle className="truncate">{name}</SheetTitle>
                        <SheetDescription className="flex items-center gap-1.5 mt-0.5">
                            <Hash size={12} className="shrink-0" />
                            <span className="font-mono">{empId}</span>
                        </SheetDescription>
                    </div>
                </div>
            </SheetHeader>

            {/* ── Period badge ── */}
            <div className="px-6 pb-4 pt-2">
                <div className="flex items-center gap-2">
                    <Badge variant="info" className="gap-1.5 px-3 py-1 text-xs font-bold">
                        <Clock size={12} />
                        {period}
                    </Badge>
                    <Badge
                        variant={attendancePct >= 90 ? 'success' : attendancePct >= 70 ? 'warning' : 'error'}
                        className="text-xs font-bold px-3 py-1"
                    >
                        {attendancePct}% Attendance
                    </Badge>
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-gray-200 dark:border-gray-800" />

            {/* ── Scrollable sections ── */}
            <div className="flex-1 overflow-y-auto py-5 space-y-5">
                {/* Employee Information */}
                <DrawerSection title="Employee Information" icon={User}>
                    <DataRow label="Full Name" value={name} />
                    <DataRow label="Employee ID" value={<span className="font-mono">{empId}</span>} />
                    <DataRow label="Department" value={
                        <span className="inline-flex items-center gap-1.5">
                            <Building2 size={13} className="text-gray-400" />
                            {department}
                        </span>
                    } />
                    <DataRow label="Designation" value={
                        <span className="inline-flex items-center gap-1.5">
                            <Briefcase size={13} className="text-gray-400" />
                            {designation}
                        </span>
                    } isLast />
                </DrawerSection>

                {/* Attendance Summary */}
                <DrawerSection title="Attendance Summary" icon={CalendarCheck}>
                    <DataRow
                        label="Present Days"
                        value={
                            <span className="inline-flex items-center gap-1.5">
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    {data.daysAttended}
                                </span>
                                <span className="text-xs text-gray-400">/ {data.daysConsidered}</span>
                            </span>
                        }
                    />
                    <DataRow
                        label="Absent Days"
                        value={
                            <span className={cn(
                                'font-mono font-bold',
                                absentDays > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-400'
                            )}>
                                {absentDays > 0 ? absentDays : '—'}
                            </span>
                        }
                    />
                    <DataRow
                        label="LWP Days"
                        value={
                            data.lwpDays > 0 ? (
                                <span className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full text-xs font-bold border border-red-100 dark:border-red-900/40">
                                    <CalendarMinus size={12} />
                                    {data.lwpDays} {data.lwpDays === 1 ? 'Day' : 'Days'}
                                </span>
                            ) : (
                                <span className="text-gray-400 text-xs font-medium">None</span>
                            )
                        }
                        isLast
                    />
                </DrawerSection>

                {/* Payroll Summary */}
                <DrawerSection title="Payroll Summary" icon={IndianRupee}>
                    <DataRow
                        label="Gross Salary"
                        value={formatINR(data.accruedGross)}
                        valueClassName="text-gray-900 dark:text-gray-100 font-bold"
                    />
                    <DataRow
                        label="Allowances"
                        value={
                            <span className="inline-flex items-center gap-1">
                                <span className="text-blue-600 dark:text-blue-400 font-bold">
                                    {formatINR(data.accruedAllowances)}
                                </span>
                            </span>
                        }
                    />
                    <DataRow
                        label="Deductions"
                        value={
                            <span className="inline-flex items-center gap-2">
                                <span className="text-red-500 dark:text-red-400 font-bold">
                                    {formatINR(data.accruedDeductions)}
                                </span>
                                {deductionPct > 0 && (
                                    <span className="inline-flex items-center gap-0.5 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                        <ArrowDownRight size={10} />
                                        {deductionPct}%
                                    </span>
                                )}
                            </span>
                        }
                    />
                    {data.loanDeduction > 0 && (
                        <DataRow
                            label="Loan Deduction"
                            value={
                                <span className="text-amber-600 dark:text-amber-400 font-bold">
                                    {formatINR(data.loanDeduction)}
                                </span>
                            }
                        />
                    )}
                    <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-700" />
                    <DataRow
                        label="Net Salary"
                        value={formatINR(data.accruedNetPay)}
                        valueClassName="text-lg font-black text-emerald-600 dark:text-emerald-400"
                        isLast
                    />
                </DrawerSection>

                {/* Last updated info */}
                {data.lastCalculatedDate && (
                    <div className="px-6">
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <Clock size={12} />
                            <span>
                                Last calculated:{' '}
                                <span className="font-semibold text-gray-500 dark:text-gray-400">
                                    {new Date(data.lastCalculatedDate).toLocaleString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            <SheetFooter>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <Wallet size={16} className="text-emerald-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            Net: {formatINR(data.accruedNetPay)}
                        </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={onClose} className="font-semibold">
                        Close
                    </Button>
                </div>
            </SheetFooter>
        </Sheet>
    );
}
