'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle, Loader2, IndianRupee, Percent } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatLoanType } from './LoanTable';

interface ReviewLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: any | null;
    onSubmit: (
        loanId: string,
        payload: {
            status: 'Active' | 'Rejected';
            remarks: string;
            approvedAmount: number;
            interestRate: number;
        }
    ) => Promise<void>;
    isSubmitting?: boolean;
}

export default function ReviewLoanModal({
    isOpen,
    onClose,
    record,
    onSubmit,
    isSubmitting = false
}: ReviewLoanModalProps) {
    const [approvedAmount, setApprovedAmount] = useState<number>(0);
    const [interestRate, setInterestRate] = useState<number>(0);
    const [remarks, setRemarks] = useState<string>('');

    useEffect(() => {
        if (isOpen && record) {
            setApprovedAmount(record.amount || 0);
            setInterestRate(record.interestRate || 0);
            setRemarks('');
        }
    }, [isOpen, record]);

    if (!isOpen || !record) return null;

    const handleAction = async (status: 'Active' | 'Rejected') => {
        if (!remarks.trim()) {
            alert("Please provide HR remarks before finalizing the review.");
            return;
        }

        try {
            await onSubmit(record.id, {
                status,
                remarks,
                approvedAmount: Number(approvedAmount),
                interestRate: Number(interestRate),
            });
            onClose();
        } catch (error) {
            console.error("Failed to submit review", error);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Review Loan Application" 
            className="max-w-lg"
        >
            <div className="space-y-5 p-2 flex flex-col h-full">
                
                {/* Employee and Request Overview */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-900 flex flex-col gap-2 transition-colors">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 uppercase">
                            REF: #{record.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {formatLoanType(record.type)} Request
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                            {record.employeeName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{record.employeeName}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">{record.employeeId}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800 text-center">
                        <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Requested</span>
                            <span className="text-xs font-black text-gray-800 dark:text-gray-300 block mt-0.5">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(record.amount)}
                            </span>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Tenure</span>
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-300 block mt-0.5">
                                {record.tenureMonths} Months
                            </span>
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Starts</span>
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-300 block mt-0.5">
                                {record.deductionStart || 'Next Cycle'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Adjustment Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Approved Amount */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <IndianRupee size={15} className="text-gray-400 dark:text-gray-500" /> Approved Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm font-semibold">₹</span>
                            <input
                                type="number"
                                value={approvedAmount}
                                onChange={(e) => setApprovedAmount(Math.max(0, Number(e.target.value)))}
                                min="0"
                                required
                                disabled={isSubmitting}
                                className="w-full h-10 pl-7 pr-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-bold transition-all shadow-sm dark:shadow-none"
                            />
                        </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <Percent size={15} className="text-gray-400 dark:text-gray-500" /> Interest Rate (Annual)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={interestRate}
                                onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value)))}
                                min="0"
                                max="100"
                                step="0.1"
                                required
                                disabled={isSubmitting}
                                className="w-full h-10 pl-3 pr-8 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-bold transition-all shadow-sm dark:shadow-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">%</span>
                        </div>
                    </div>

                </div>

                {/* Audit Comments / Remarks */}
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                        Reviewer Comments & Decision Remarks
                    </label>
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="State reason for your approval limits, rejection reason, or other relevant remarks..."
                        required
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent min-h-[100px] resize-y bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-sm dark:shadow-none"
                    />
                </div>

                {/* Actions Footer */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-900 flex flex-col sm:flex-row justify-end gap-3 mt-4 shrink-0 transition-colors">
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 order-last sm:order-none"
                    >
                        Cancel
                    </Button>
                    <div className="flex-1 flex gap-3">
                        <Button
                            type="button"
                            onClick={() => handleAction('Rejected')}
                            disabled={isSubmitting || !remarks.trim()}
                            className="flex-1 gap-2 font-bold border border-red-200 dark:border-red-950 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 bg-transparent transition-all"
                        >
                            <XCircle size={16} />
                            Reject Request
                        </Button>
                        <Button
                            type="button"
                            onClick={() => handleAction('Active')}
                            disabled={isSubmitting || !remarks.trim()}
                            className="flex-1 gap-2 font-bold bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-700 text-white border-transparent transition-all shadow-md shadow-emerald-500/25 dark:shadow-none"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                            Approve Loan
                        </Button>
                    </div>
                </div>

            </div>
        </Modal>
    );
}
