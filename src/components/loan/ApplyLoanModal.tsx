'use client';

import React, { useState, useEffect } from 'react';
import { AlignLeft, IndianRupee, Calendar, Loader2 } from 'lucide-react';

// UI Components
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Data Contract for Backend Integration
export interface SelectOption {
    id: string;
    label: string;
}

export interface LoanApplicationPayload {
    employeeId: string;
    loanType: string;
    amount: string;
    tenure: string;
    deductionStart: string;
    reason: string;
}

interface ApplyLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LoanApplicationPayload) => Promise<void>; // Updated to expect a Promise
    employees?: SelectOption[];
}

const initialFormState: LoanApplicationPayload = {
    employeeId: '',
    loanType: '',
    amount: '',
    tenure: '',
    deductionStart: '',
    reason: ''
};

export default function ApplyLoanModal({
    isOpen,
    onClose,
    onSubmit,
    employees = []
}: ApplyLoanModalProps) {

    const [formData, setFormData] = useState<LoanApplicationPayload>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-select employee if there is only 1 (Role-Based: Standard Employees applying for themselves)
    useEffect(() => {
        if (isOpen && employees.length === 1) {
            setFormData(prev => ({ ...prev, employeeId: employees[0].id }));
        }
    }, [isOpen, employees]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setFormData(initialFormState);
        setIsSubmitting(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            handleClose(); // Close and reset only on success
        } catch (error) {
            console.error('Submission failed:', error);
            // Modal stays open so the user can fix errors
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="New Loan Request" className="max-w-lg">
            <form id="loan-form" onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 space-y-5 p-2">

                    {/* Employee Selection */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Select Employee</label>
                        <select
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            required
                            disabled={employees.length === 1 || isSubmitting}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
                        >
                            <option value="" disabled>Search employee...</option>
                            {employees.map((emp, index) => (
                                <option key={emp.id || `fallback-${index}`} value={emp.id}>{emp.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Loan Type */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Loan Type</label>
                            <select
                                name="loanType"
                                value={formData.loanType}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
                            >
                                <option value="" disabled>Select type...</option>
                                <option value="advance">Salary Advance</option>
                                <option value="personal">Personal Loan</option>
                                <option value="medical">Medical Emergency</option>
                            </select>
                        </div>

                        {/* Amount */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <IndianRupee size={16} className="text-gray-400" /> Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    placeholder="50000"
                                    min="1000"
                                    className="w-full h-10 pl-7 pr-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm disabled:bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Tenure */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar size={16} className="text-gray-400" /> Repayment Tenure
                            </label>
                            <select
                                name="tenure"
                                value={formData.tenure}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
                            >
                                <option value="" disabled>Select tenure...</option>
                                <option value="1">1 Month (Next Payroll)</option>
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                            </select>
                        </div>

                        {/* Start Date */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Deduction Start</label>
                            <Input
                                type="month"
                                name="deductionStart"
                                value={formData.deductionStart}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>

                    {/* Reason / Notes */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <AlignLeft size={16} className="text-gray-400" /> Reason / Notes
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="Add any specific details regarding this request..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[100px] resize-y bg-white disabled:bg-gray-50"
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-6 mt-2 border-t border-gray-100 flex justify-end gap-3 px-2 pb-2 shrink-0">
                    <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || !formData.employeeId || !formData.amount}
                        className="min-w-[140px] gap-2"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}