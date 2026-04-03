'use client';

import React, { useState } from 'react';
import { Calendar, AlignLeft, Briefcase, Loader2, Clock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { applyForLeave } from '@/services/leaveService';

export interface LeaveApplicationPayload {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
}

interface ApplyLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const initialFormState: LeaveApplicationPayload = {
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
};

export default function ApplyLeaveModal({ isOpen, onClose, onSuccess }: ApplyLeaveModalProps) {
    const [formData, setFormData] = useState<LeaveApplicationPayload>(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleClose = () => {
        setFormData(initialFormState);
        setError('');
        onClose();
    };

    // Real-time calculation logic
    let calculatedDays = 0;
    if (formData.startDate && formData.endDate) {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        if (end >= start) {
            const timeDiff = end.getTime() - start.getTime();
            calculatedDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (calculatedDays <= 0) {
            setError("End date must be the same as or after the start date.");
            setIsLoading(false);
            return;
        }

        try {
            const finalPayload = {
                ...formData,
                numberOfDays: calculatedDays
            };

            await applyForLeave(finalPayload);
            
            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Apply for Leave" className="max-w-md">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">

                <div className="flex-1 space-y-5 p-2">
                    
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

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
                            <option value="Sick">Sick Leave</option>
                            <option value="Vacation">Vacation Leave</option>
                            <option value="Personal">Personal Leave</option>
                            <option value="Emergency">Emergency</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Date Range Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar size={16} className="text-gray-400" /> Start Date
                            </label>
                            <Input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
                        </div>

                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Calendar size={16} className="text-gray-400" /> End Date
                            </label>
                            <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required min={formData.startDate} />
                        </div>
                    </div>

                    {/*  Days Display */}
                    {calculatedDays > 0 && (
                        <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200 font-medium flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                            <Clock size={16} className="text-blue-500" />
                            Requesting {calculatedDays} day{calculatedDays > 1 ? 's' : ''} of leave.
                        </div>
                    )}

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
                    <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                        {isLoading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                </div>

            </form>
        </Modal>
    );
}