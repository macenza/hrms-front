'use client';

import React from 'react';
import { X, Calendar, User, FileText, ChevronRight, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { formatLoanType } from './LoanTable';

interface LoanDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    record: any | null;
}

const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Completed': return 'success';
        case 'Active': return 'info';
        case 'Pending': return 'warning';
        case 'Rejected': return 'error';
        default: return 'default';
    }
};

export default function LoanDetailsDrawer({ isOpen, onClose, record }: LoanDetailsDrawerProps) {
    if (!isOpen || !record) return null;

    const formatTimelineDate = (dateString: any) => {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit' 
            });
        } catch (e) {
            return '';
        }
    };

    // Helper to calculate EMI schedule dynamically for the UI
    const generateEmiSchedule = () => {
        const schedule = [];
        const amount = record.approvedAmount || record.amount || 0;
        const tenure = record.tenureMonths || 12;
        const baseEmi = Math.round(amount / tenure);
        
        // Deduction Start parsing
        let startMonth = new Date();
        if (record.deductionStart) {
            const parts = record.deductionStart.split('-');
            if (parts.length === 2) {
                startMonth = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
            }
        }

        for (let i = 1; i <= tenure; i++) {
            const currentMonth = new Date(startMonth.getTime());
            currentMonth.setMonth(startMonth.getMonth() + i - 1);
            
            const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            // Simulating statuses
            let emiStatus = 'Pending';
            if (record.status === 'Completed') {
                emiStatus = 'Paid';
            } else if (record.status === 'Rejected') {
                emiStatus = 'N/A';
            } else if (record.status === 'Active') {
                // If it is active, mark some installments as Paid
                if (i <= Math.min(2, tenure - 1)) {
                    emiStatus = 'Paid';
                } else if (record.remarks?.toLowerCase().includes('pause') && i === 3) {
                    emiStatus = 'Paused';
                }
            }

            schedule.push({
                installment: i,
                month: monthLabel,
                amount: baseEmi,
                status: emiStatus
            });
        }
        return schedule;
    };

    const emiSchedule = record.emiSchedule && record.emiSchedule.length > 0
        ? record.emiSchedule.map((emi: any) => ({
            installment: emi.month,
            month: new Date(emi.date).toLocaleString('default', { month: 'long', year: 'numeric' }),
            amount: emi.totalEMI,
            status: emi.status
        }))
        : generateEmiSchedule();

    return (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            {/* Backdrop Blur Overlay */}
            <div 
                className="absolute inset-0 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
            />

            <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
                <div className="w-screen max-w-lg bg-white dark:bg-gray-950 shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-900 animate-in slide-in-from-right duration-300">
                    
                    {/* Header */}
                    <div className="px-6 py-5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-900 flex items-center justify-between transition-colors">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-gray-400 uppercase">
                                    REF ID: #{record.id.slice(-6).toUpperCase()}
                                </span>
                                <Badge variant={getStatusBadgeVariant(record.status)}>
                                    {record.status}
                                </Badge>
                            </div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors mt-1">
                                Loan Application Details
                            </h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 divide-y divide-gray-200 dark:divide-gray-900 scrollbar-thin">
                        
                        {/* Employee Information Card */}
                        <div className="flex items-center gap-4 pb-6">
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-black shadow-sm">
                                {record.employeeName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{record.employeeName}</h3>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">{record.employeeId}</p>
                            </div>
                        </div>

                        {/* Request Summary Details */}
                        <div className="pt-6 pb-2 space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                                Financial Details
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-900/50">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Requested Amount</span>
                                    <span className="text-base font-black text-gray-900 dark:text-gray-200 mt-1 block">
                                        {formatINR(record.amount)}
                                    </span>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-900/50">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Approved Amount</span>
                                    <span className="text-base font-black text-gray-950 dark:text-gray-100 mt-1 block">
                                        {formatINR(record.approvedAmount || record.amount)}
                                    </span>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-900/50">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Monthly EMI</span>
                                    <span className="text-base font-bold text-gray-900 dark:text-gray-100 mt-1 block">
                                        {formatINR(record.emi)}
                                    </span>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-900/50">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block">Interest Rate</span>
                                    <span className="text-base font-bold text-gray-900 dark:text-gray-100 mt-1 block">
                                        {record.interestRate ? `${record.interestRate}%` : '0%'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Loan Type</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{formatLoanType(record.type)}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Repayment Tenure</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{record.tenureMonths} Months</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Deduction Starts</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{record.deductionStart || 'Next Cycle'}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Applied Date</span>
                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>

                            {record.reason && (
                                <div className="bg-gray-50/50 dark:bg-gray-900/20 p-4 rounded-xl border border-gray-100 dark:border-gray-900 mt-2">
                                    <span className="text-xs text-gray-400 dark:text-gray-500 block font-bold uppercase tracking-wider mb-1">Reason / Notes</span>
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 leading-relaxed">{record.reason}</p>
                                </div>
                            )}

                            {record.remarks && (
                                <div className="flex flex-col gap-2 mt-4 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap break-words">
                                    <span className="text-xs text-blue-600 dark:text-blue-400 block font-bold uppercase tracking-wider mb-1">HR Remarks</span>
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 leading-relaxed">{record.remarks}</p>
                                </div>
                            )}

                            {['Active', 'Completed', 'Rejected'].includes(record.status) && record.processedBy?.name && (
                                <div className="flex flex-col gap-2 mt-4 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap break-words">
                                    <span className="text-xs text-gray-400 dark:text-gray-500 block font-bold uppercase tracking-wider mb-1">Audit Details</span>
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {"Approved by: " + record.processedBy.name}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Progress Timeline */}
                        <div className="pt-6 pb-6">
                            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-5">
                                Application Timeline
                            </h4>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                                            <CheckCircle2 size={14} />
                                        </div>
                                        <div className="w-0.5 h-10 bg-emerald-200 dark:bg-emerald-900" />
                                    </div>
                                    <div className="pt-0.5">
                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100">Application Submitted</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                                            {formatTimelineDate(record.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                            record.status === 'Pending' 
                                                ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400" 
                                                : (record.status === 'Rejected' 
                                                    ? "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400" 
                                                    : "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400")
                                        )}>
                                            {record.status === 'Pending' ? <Clock size={14} /> : (record.status === 'Rejected' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />)}
                                        </div>
                                        <div className={cn(
                                            "w-0.5 h-10",
                                            ['Active', 'Completed'].includes(record.status) ? "bg-emerald-200 dark:bg-emerald-900" : "bg-gray-100 dark:bg-gray-900"
                                        )} />
                                    </div>
                                    <div className="pt-0.5">
                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                                            {record.status === 'Pending' ? 'Awaiting HR Audit' : (record.status === 'Rejected' ? 'Application Rejected' : 'Audit Approved')}
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
                                            {record.status === 'Pending' ? 'Reviewing request' : `Finalized: ${record.remarks || 'No remarks provided'}`}
                                        </p>
                                        {['Active', 'Completed', 'Rejected'].includes(record.status) && (
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                                                {formatTimelineDate(record.processedAt || record.approvedAt)}
                                            </p>
                                        )}
                                        {['Active', 'Completed', 'Rejected'].includes(record.status) && record.processedBy?.name && (
                                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 mt-1">
                                                {"Approved by: " + record.processedBy.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                            ['Active', 'Completed'].includes(record.status) 
                                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" 
                                                : "bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-500"
                                        )}>
                                            <ShieldCheck size={14} />
                                        </div>
                                    </div>
                                    <div className="pt-0.5">
                                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100">
                                            {record.status === 'Completed' ? 'Loan Fully Settled' : (record.status === 'Active' ? 'Active Disbursement & Recovery' : 'Disbursement Awaiting')}
                                        </p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                            {record.status === 'Completed' ? 'All outstanding EMIs recovered' : (record.status === 'Active' ? 'Ongoing monthly deductions' : 'Pending review completion')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Amortization Repayment Schedule */}
                        <div className="pt-6 pb-6">
                            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                                EMI Repayment Schedule
                            </h4>
                            <div className="border border-gray-100 dark:border-gray-900 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left text-xs whitespace-nowrap">
                                    <thead className="bg-gray-100/70 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-900 uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Installment</th>
                                            <th className="px-4 py-3">Month</th>
                                            <th className="px-4 py-3 text-right">Amount</th>
                                            <th className="px-4 py-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-900 bg-white dark:bg-gray-950">
                                        {emiSchedule.map((emi: any) => (
                                            <tr key={emi.installment} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
                                                <td className="px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-center">
                                                    #{emi.installment}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">
                                                    {emi.month}
                                                </td>
                                                <td className="px-4 py-3 font-black text-right text-gray-900 dark:text-gray-100">
                                                    {formatINR(emi.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                                                        emi.status === 'Paid' 
                                                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400" 
                                                            : (emi.status === 'Paused'
                                                                ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400"
                                                                : (emi.status === 'N/A' 
                                                                    ? "bg-gray-100 dark:bg-gray-900 text-gray-400" 
                                                                    : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"))
                                                    )}>
                                                        {emi.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* Footer action */}
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-900 flex justify-end bg-gray-50 dark:bg-gray-900/50 transition-colors">
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 px-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-center text-sm shadow-md"
                        >
                            Close Details
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
