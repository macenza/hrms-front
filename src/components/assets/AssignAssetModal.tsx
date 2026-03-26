'use client';

import React, { useState } from 'react';
import { User, Laptop, Calendar, AlignLeft } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// 1. Data contracts for dropdowns and API submission
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
    onSubmit?: (payload: AssignAssetPayload) => void;
    // Passing these as props makes the component reusable and ready for live API data
    employees?: SelectOption[];
    availableAssets?: SelectOption[];
}

// Mock data fallbacks for development
const mockEmployees = [
    { id: 'EMP001', label: 'Alice Johnson (EMP001)' },
    { id: 'EMP002', label: 'Bob Smith (EMP002)' },
];

const mockAssets = [
    { id: 'AST-1088', label: 'iPhone 13 Pro (AST-1088)' },
    { id: 'AST-1090', label: 'Logitech MX Master 3 (AST-1090)' },
];

export default function AssignAssetModal({
    isOpen,
    onClose,
    onSubmit,
    employees = mockEmployees,
    availableAssets = mockAssets
}: AssignAssetModalProps) {

    // 2. Track form state for backend submission
    const [formData, setFormData] = useState<AssignAssetPayload>({
        employeeId: '',
        assetId: '',
        assignmentDate: '',
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // In the future, this is where API service call goes:
        // await apiClient.post('/assets/assign', formData);

        if (onSubmit) {
            onSubmit(formData);
        } else {
            console.log('API Payload Ready:', formData);
        }

        onClose();
        // Optional: Reset form state here if desired
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Assign Asset">
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
                            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
                        >
                            <option value="" disabled>Search employee...</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.label}</option>
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
                            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
                        >
                            <option value="" disabled>Select available asset...</option>
                            {availableAssets.map(asset => (
                                <option key={asset.id} value={asset.id}>{asset.label}</option>
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
                            placeholder="Add any notes about the asset's condition before handover..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[100px] resize-y bg-white"
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        Assign Asset
                    </Button>
                </div>
            </form>
        </Modal>
    );
}