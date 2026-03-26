'use client';

import React, { useState } from 'react';
import { Calendar, AlignLeft, Briefcase } from 'lucide-react';

// UI Components
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Define the data contract for backend API
export interface LeaveApplicationPayload {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
}

interface ApplyLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: LeaveApplicationPayload) => void;
}

const initialFormState: LeaveApplicationPayload = {
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
};

export default function ApplyLeaveModal({ isOpen, onClose, onSubmit }: ApplyLeaveModalProps) {
    // Centralized form state
    const [formData, setFormData] = useState<LeaveApplicationPayload>(initialFormState);

    // Change handler for all inputs
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setFormData(initialFormState); // Reset form on close
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // When backend is ready: await apiClient.post('/leaves/apply', formData);
        if (onSubmit) {
            onSubmit(formData);
        } else {
            console.log('Leave Application Payload Ready:', formData);
        }

        handleClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Apply for Leave" className="max-w-md">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">

                <div className="flex-1 space-y-5 p-2">

                    {/* Leave Type Selection */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Briefcase size={16} className="text-gray-400" /> Leave Type
                        </label>
                        <select
                            name="leaveType"
                            value={formData.leaveType}
                            onChange={handleChange}
                            required
                            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white"
                        >
                            <option value="" disabled>Select leave type...</option>
                            <option value="sick">Sick Leave</option>
                            <option value="casual">Casual Leave</option>
                            <option value="annual">Annual Leave</option>
                            <option value="maternity">Maternity/Paternity Leave</option>
                            <option value="unpaid">Unpaid Leave</option>
                        </select>
                    </div>

                    {/* Date Range Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar size={16} className="text-gray-400" /> Start Date
                            </label>
                            <Input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar size={16} className="text-gray-400" /> End Date
                            </label>
                            <Input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                                // Basic HTML validation to prevent end date before start date
                                min={formData.startDate}
                            />
                        </div>
                    </div>

                    {/* Reason Textarea */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <AlignLeft size={16} className="text-gray-400" /> Reason for Leave
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            required
                            placeholder="Please provide a brief reason for your leave request..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[120px] resize-y bg-white"
                        />
                    </div>

                </div>

                {/* Footer Controls */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        Submit Application
                    </Button>
                </div>

            </form>
        </Modal>
    );
}