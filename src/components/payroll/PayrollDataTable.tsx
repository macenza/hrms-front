// src/components/payroll/PayrollDataTable.tsx
'use client';

import React, { useState } from 'react';
import {
    ColumnDef,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    FilterFn,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    IndianRupee,
    ChevronDown,
    Loader2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useBreakpoint } from '@/hooks/useMediaQuery';

// ─── TYPES ──────────────────────────────────────────────────────
type PayrollStatus = 'Draft' | 'Accruing' | 'Processed' | 'Paid';

export interface PayrollAccrualRow {
    _id: string;
    employee: {
        _id: string;
        name: string;
        employeeId?: string;
        profile?: {
            employment?: {
                department?: string;
                designation?: string;
            };
        };
    };
    month: number;
    year: number;
    daysConsidered: number;
    daysAttended: number;
    lwpDays: number;
    loanDeduction: number;
    accruedGross: number;
    accruedAllowances: number;
    accruedDeductions: number;
    accruedNetPay: number;
    lastCalculatedDate: string;

    // Detailed day counts and breakdowns
    totalCalendarDays?: number;
    workingDaysCount?: number;
    presentDays?: number;
    absentDays?: number;
    paidLeaveDays?: number;
    unpaidLeaveDays?: number;
    holidaysCount?: number;
    weekendsCount?: number;
    paidDays?: number;
    preJoiningDays?: number;
    totalDays?: number;
    payableEarnings?: number;
    ctc?: number;
    basicSalary?: number;
    basic?: number; // fallback
    lwpDeduction?: number;
    allowancesSnapshot?: { name: string; amount: number }[];
    customDeductionsSnapshot?: { name: string; amount: number }[];
}

export interface PayrollDataTableProps {
    data: PayrollAccrualRow[];
    isLoading?: boolean;
    isError?: boolean;
    // Server-side pagination
    page: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    // Optional search (handled on client for current page data)
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
    // Row click handler (opens detail drawer)
    onRowClick?: (row: PayrollAccrualRow) => void;
}

// ─── HELPERS ────────────────────────────────────────────────────
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
        'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
        'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
        'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400',
        'bg-teal-100 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

const deriveStatus = (row: PayrollAccrualRow): PayrollStatus => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (row.accruedNetPay === 0 && row.daysConsidered === 0) return 'Draft';
    if (row.month === currentMonth && row.year === currentYear) return 'Accruing';
    // Past months with data are considered Processed
    return 'Processed';
};

const STATUS_CONFIG: Record<PayrollStatus, { label: string; classes: string }> = {
    Draft: {
        label: 'Draft',
        classes: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    },
    Accruing: {
        label: 'Accruing',
        classes: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    },
    Processed: {
        label: 'Processed',
        classes: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    },
    Paid: {
        label: 'Paid',
        classes: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    },
};

// ─── SORTABLE COLUMN HEADER ─────────────────────────────────────
function DataTableColumnHeader({
    column,
    title,
    className,
}: {
    column: any;
    title: string;
    className?: string;
}) {
    const isSorted = column.getIsSorted();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(isSorted === 'asc')}
            className={cn(
                '-ml-3 h-8 font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-transparent',
                className
            )}
        >
            {title}
            {isSorted === 'asc' ? (
                <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
            ) : isSorted === 'desc' ? (
                <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-blue-500" />
            ) : (
                <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-40" />
            )}
        </Button>
    );
}

// ─── COLUMN DEFINITIONS ─────────────────────────────────────────
const columns: ColumnDef<PayrollAccrualRow>[] = [
    {
        id: 'employee',
        accessorFn: (row) => row.employee?.name || 'Unknown',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => {
            const emp = row.original.employee;
            const name = emp?.name || 'Unknown';
            const empId = emp?.employeeId || 'N/A';
            const dept = emp?.profile?.employment?.department || 'Unassigned';
            return (
                <div className="flex items-center gap-3 min-w-[200px]">
                    <div
                        className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm dark:shadow-none transition-colors',
                            getAvatarColor(name)
                        )}
                    >
                        {getInitials(name)}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">
                            {name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {empId}
                            </span>
                            <span className="text-gray-300 dark:text-gray-700 text-xs">•</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase">
                                {dept}
                            </span>
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        id: 'attendancePeriod',
        accessorFn: (row) => `${MONTH_NAMES[row.month - 1] || ''} ${row.year}`,
        header: 'Period',
        cell: ({ row }) => {
            const period = `${MONTH_NAMES[row.original.month - 1] || ''} ${row.original.year}`;
            return (
                <span className="font-mono text-xs font-bold text-gray-800 dark:text-gray-200 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/40">
                    {period}
                </span>
            );
        },
        enableSorting: false,
    },
    {
        accessorKey: 'daysAttended',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Payable Days" />,
        cell: ({ row }) => (
            <div className="text-center">
                <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200">
                    {row.original.daysAttended}
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-xs ml-0.5">/ {row.original.daysConsidered}</span>
            </div>
        ),
    },
    {
        accessorKey: 'lwpDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title="LWP" />,
        cell: ({ row }) => {
            const lwp = row.original.lwpDays;
            return lwp > 0 ? (
                <span className="font-mono text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full border border-red-100 dark:border-red-900/40">
                    {lwp} {lwp === 1 ? 'Day' : 'Days'}
                </span>
            ) : (
                <span className="text-xs text-gray-400 font-medium">None</span>
            );
        },
    },
    {
        accessorKey: 'accruedAllowances',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Allowances" />,
        cell: ({ row }) => (
            <span className="font-mono font-bold text-gray-700 dark:text-gray-300 text-sm">
                {formatINR(row.original.accruedAllowances)}
            </span>
        ),
    },
    {
        accessorKey: 'accruedGross',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Gross Pay" />,
        cell: ({ row }) => (
            <span className="font-mono font-bold text-gray-900 dark:text-gray-100 text-sm">
                {formatINR(row.original.accruedGross)}
            </span>
        ),
    },
    {
        accessorKey: 'accruedDeductions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Deductions" className="text-red-500 dark:text-red-400" />
        ),
        cell: ({ row }) => {
            const displayDeductions = (row.original.accruedDeductions || 0) + (row.original.lwpDeduction || 0);
            return (
                <span className="font-mono font-bold text-red-500 dark:text-red-400 text-sm">
                    {formatINR(displayDeductions)}
                </span>
            );
        },
    },
    {
        accessorKey: 'accruedNetPay',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Net Pay" className="text-emerald-600 dark:text-emerald-400" />
        ),
        cell: ({ row }) => (
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-base">
                {formatINR(row.original.accruedNetPay)}
            </span>
        ),
    },
    {
        accessorKey: 'lastCalculatedDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Last Updated" />,
        cell: ({ row }) => {
            const dateStr = row.original.lastCalculatedDate;
            if (!dateStr) return <span className="text-xs text-gray-400">—</span>;
            const date = new Date(dateStr);
            return (
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="block text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            );
        },
        sortingFn: (rowA, rowB) =>
            new Date(rowA.original.lastCalculatedDate).getTime() - new Date(rowB.original.lastCalculatedDate).getTime(),
    },
    {
        id: 'status',
        accessorFn: (row) => deriveStatus(row),
        header: 'Status',
        cell: ({ row }) => {
            const status = deriveStatus(row.original);
            const cfg = STATUS_CONFIG[status];
            return (
                <span
                    className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors',
                        cfg.classes
                    )}
                >
                    {status === 'Accruing' && (
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                        </span>
                    )}
                    {cfg.label}
                </span>
            );
        },
        enableSorting: false,
    },
];

// ─── LOADING SKELETON ───────────────────────────────────────────
function TableSkeleton() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800" />
                            <div className="space-y-1.5">
                                <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800" />
                                <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800/50" />
                            </div>
                        </div>
                    </TableCell>
                    {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}>
                            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-800" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function PayrollDataTable({
    data,
    isLoading = false,
    isError = false,
    page,
    totalCount,
    pageSize,
    onPageChange,
    onPageSizeChange,
    searchTerm = '',
    onSearchChange,
    onRowClick,
}: PayrollDataTableProps) {
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === 'mobile';
    const [sorting, setSorting] = useState<SortingState>([]);

    // Global filter that searches across employee name, ID, and department
    const globalFilterFn: FilterFn<PayrollAccrualRow> = (row, _columnId, filterValue) => {
        const search = (filterValue as string).toLowerCase();
        if (!search) return true;
        const emp = row.original.employee;
        const name = (emp?.name || '').toLowerCase();
        const empId = (emp?.employeeId || '').toLowerCase();
        const dept = (emp?.profile?.employment?.department || '').toLowerCase();
        return name.includes(search) || empId.includes(search) || dept.includes(search);
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        globalFilterFn,
        state: {
            sorting,
            globalFilter: searchTerm,
        },
    });

    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    // Show max 5 page buttons around current page
    const getPageNumbers = () => {
        const pages: number[] = [];
        const maxButtons = 5;
        let start = Math.max(1, page - Math.floor(maxButtons / 2));
        const end = Math.min(totalPages, start + maxButtons - 1);
        if (end - start < maxButtons - 1) {
            start = Math.max(1, end - maxButtons + 1);
        }
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <Card className="overflow-hidden">
            {/* ── Header ──────────────────────────────────── */}
            <CardHeader className="border-b border-gray-200 dark:border-gray-800 p-6">
                <CardTitle className="text-lg">Payroll Records</CardTitle>
                <CardDescription>Employee payroll data for the current period</CardDescription>
                <CardAction>
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700">
                        {totalCount} {totalCount === 1 ? 'record' : 'records'}
                    </div>
                </CardAction>
            </CardHeader>

            {/* ── Toolbar ─────────────────────────────────── */}
            <CardContent className="py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Search */}
                    {onSearchChange && (
                        <div className="relative w-full sm:w-80 group">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search by name, ID, or department..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 transition-all shadow-sm dark:shadow-none"
                            />
                        </div>
                    )}

                    {/* Rows per page */}
                    <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Show:</span>
                        <div className="relative">
                            <select
                                value={pageSize}
                                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                className="h-9 pl-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 shadow-sm dark:shadow-none transition-all cursor-pointer"
                            >
                                <option value={5}>5 rows</option>
                                <option value={10}>10 rows</option>
                                <option value={25}>25 rows</option>
                            </select>
                            <ChevronDown
                                size={14}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* ── Mobile Card View ────────────────────────── */}
            {isMobile ? (
                <div className="p-3 space-y-3">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="animate-pulse p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800" />
                                    <div className="space-y-1.5 flex-1">
                                        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-800" />
                                        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800/50" />
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
                                    <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
                                </div>
                            </div>
                        ))
                    ) : isError ? (
                        <div className="p-8 text-center">
                            <p className="font-semibold text-red-500">Failed to load payroll records.</p>
                            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Please try refreshing.</p>
                        </div>
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => {
                            const accrual = row.original;
                            const emp = accrual.employee;
                            const name = emp?.name || 'Unknown';
                            const empId = emp?.employeeId || 'N/A';
                            const status = deriveStatus(accrual);
                            const cfg = STATUS_CONFIG[status];
                            const period = `${MONTH_NAMES[accrual.month - 1] || ''} ${accrual.year}`;

                            return (
                                <div
                                    key={row.id}
                                    onClick={() => onRowClick?.(accrual)}
                                    className={cn(
                                        'p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800',
                                        'hover:bg-gray-100 dark:hover:bg-gray-800/40 transition-colors active:scale-[0.99]',
                                        onRowClick && 'cursor-pointer'
                                    )}
                                >
                                    {/* Top row: Employee + Status */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0', getAvatarColor(name))}>
                                                {getInitials(name)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate" title={name}>{name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{empId}</p>
                                            </div>
                                        </div>
                                        <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0', cfg.classes)}>
                                            {status === 'Accruing' && (
                                                <span className="relative flex h-1.5 w-1.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
                                                </span>
                                            )}
                                            {cfg.label}
                                        </span>
                                    </div>
                                    {/* Bottom row: Period + Pay */}
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-mono font-bold text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/40">
                                            {period}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-gray-500 dark:text-gray-400 mr-1">Net:</span>
                                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                                                {formatINR(accrual.accruedNetPay)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                <IndianRupee size={24} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">No payroll records found</p>
                            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Payroll data will appear here once accruals are generated.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* ── Desktop/Tablet Table (shadcn + TanStack) ───── */
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-gray-50/75 dark:bg-gray-800/40 hover:bg-gray-50/75 dark:hover:bg-gray-800/40">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="text-xs uppercase tracking-wider font-bold h-12">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableSkeleton />
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-40 text-center">
                                        <p className="font-semibold text-red-500 text-base">Failed to load payroll records.</p>
                                        <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">Please try refreshing the page.</p>
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className={cn(
                                            'group',
                                            onRowClick && 'cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors'
                                        )}
                                        onClick={() => onRowClick?.(row.original)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-4">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 transition-colors">
                                                <IndianRupee size={24} className="text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                                                No payroll records found
                                            </p>
                                            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                                                Payroll data will appear here once attendance accruals are generated.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* ── Pagination ──────────────────────────────── */}
            {totalCount > 0 && (
                <CardContent className="py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            Showing{' '}
                            <span className="text-gray-900 dark:text-gray-100 font-bold">
                                {(page - 1) * pageSize + 1}
                            </span>{' '}
                            to{' '}
                            <span className="text-gray-900 dark:text-gray-100 font-bold">
                                {Math.min(page * pageSize, totalCount)}
                            </span>{' '}
                            of{' '}
                            <span className="text-gray-900 dark:text-gray-100 font-bold">
                                {totalCount}
                            </span>{' '}
                            records
                        </div>

                        {/* Page navigation */}
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft size={16} />
                            </Button>

                            {getPageNumbers().map((pg) => (
                                <Button
                                    key={pg}
                                    variant={page === pg ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => onPageChange(pg)}
                                    className={cn(
                                        'h-8 w-8 p-0 font-bold text-xs',
                                        page === pg
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white dark:bg-gray-900'
                                    )}
                                >
                                    {pg}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
