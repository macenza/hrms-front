'use client';

import React, { useState, useEffect } from 'react';
import { User, Laptop, Calendar, AlignLeft, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Data contracts for dropdowns and API submission
export interface SelectOption {
    id: string;
    label: string;
}

export interface AssignAssetPayload {
    employeeId: string;
    assetId: string;
    assignmentDate: string;
    notes: string;
}

interface AssignAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (payload: AssignAssetPayload) => Promise<void>; // Upgraded to expect a Promise for loading states
    employees?: SelectOption[];
    availableAssets?: SelectOption[];
}

const initialFormState: AssignAssetPayload = {
    employeeId: '',
    assetId: '',
    assignmentDate: '',
    notes: ''
};

export default function AssignAssetModal({
    isOpen,
    onClose,
    onSubmit,
    employees = [],
    availableAssets = []
}: AssignAssetModalProps) {

    // Track form state for backend submission
    const [formData, setFormData] = useState<AssignAssetPayload>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-select employee if there is only 1 option
    useEffect(() => {
        if (isOpen && employees.length === 1) {
            setFormData(prev => ({ ...prev, employeeId: employees[0].id }));
        }
    }, [isOpen, employees]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setFormData(initialFormState); // Clear form on close
        setIsSubmitting(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (onSubmit) {
                await onSubmit(formData);
            }
            handleClose(); // Close and reset only on success
        } catch (error) {
            console.error('Submission failed:', error);
            // Modal stays open so the user can fix any errors
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Assign Asset" className="max-w-lg">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 space-y-5 p-2">

                    {/* Employee Selection */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <User size={16} className="text-gray-400" /> Employee
                        </label>
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
                                <option key={emp.id || `emp-${index}`} value={emp.id || ""}>{emp.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Asset Selection */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Laptop size={16} className="text-gray-400" /> Available Asset
                        </label>
                        <select
                            name="assetId"
                            value={formData.assetId}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
                        >
                            <option value="" disabled>Select available asset...</option>
                            {availableAssets.length === 0 && (
                                <option value="" disabled>No assets currently available</option>
                            )}
                            {availableAssets.map((asset, index) => (
                                // FIX: Add || "" to the value prop to prevent HTML text fallback
                                <option key={asset.id || `asset-${index}`} value={asset.id || ""}>
                                    {asset.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Selection */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Calendar size={16} className="text-gray-400" /> Assignment Date
                        </label>
                        <Input
                            type="date"
                            name="assignmentDate"
                            value={formData.assignmentDate}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    {/* Notes Textarea */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <AlignLeft size={16} className="text-gray-400" /> Condition Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="Add any notes about the asset's condition before handover..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[100px] resize-y bg-white disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3 px-2 pb-2 shrink-0">
                    <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || !formData.employeeId || !formData.assetId}
                        className="min-w-[140px] gap-2"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                        {isSubmitting ? 'Assigning...' : 'Assign Asset'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}