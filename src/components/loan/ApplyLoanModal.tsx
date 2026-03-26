'use client';

import React, { useState } from 'react';
import { AlignLeft, IndianRupee, Calendar } from 'lucide-react';

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
    onSubmit?: (data: LoanApplicationPayload) => void;
    employees?: SelectOption[]; // Passed down so it can be dynamically populated from an API later
}

const initialFormState: LoanApplicationPayload = {
    employeeId: '',
    loanType: '',
    amount: '',
    tenure: '',
    deductionStart: '',
    reason: ''
};

// Mock data fallback for employees
const mockEmployees: SelectOption[] = [
    { id: 'EMP001', label: 'Alice Johnson (EMP001)' },
    { id: 'EMP002', label: 'Bob Smith (EMP002)' },
];

export default function ApplyLoanModal({
    isOpen,
    onClose,
    onSubmit,
    employees = mockEmployees
}: ApplyLoanModalProps) {

    // Centralized Form State
    const [formData, setFormData] = useState<LoanApplicationPayload>(initialFormState);

    // Universal Change Handler
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setFormData(initialFormState); // Clear form on close
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // When backend is ready: await apiClient.post('/loans/request', formData);
        if (onSubmit) {
            onSubmit(formData);
        } else {
            console.log('Loan Application Payload Ready:', formData);
        }

        handleClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="New Loan Request" className="max-w-lg">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">

                <div className="flex-1 space-y-5 p-2">

                    {/* Employee Selection */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Select Employee</label>
                        <select
                            name="employeeId"
                            value={formData.employeeId}
                            onChange={handleChange}
                            required
                            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
                        >
                            <option value="" disabled>Search employee...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.label}</option>
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
                                className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
                            >
                                <option value="" disabled>Select type...</option>
                                <option value="advance">Salary Advance</option>
                                <option value="personal">Personal Loan</option>
                                <option value="medical">Medical Emergency</option>
                            </select>
                        </div>

                        {/* Amount with custom Rupee Icon */}
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
                                    placeholder="50000"
                                    min="0"
                                    className="w-full h-10 pl-7 pr-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
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
                            placeholder="Add any specific details regarding this request..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[100px] resize-y bg-white"
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        Submit Request
                    </Button>
                </div>

            </form>
        </Modal>
    );
}