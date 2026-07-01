'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, AlignLeft, Briefcase, Loader2, Clock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useApplyLeave, useLeaveStats } from '@/hooks/api/useLeave';
import { useAppSelector } from '@/store/hooks';

export interface LeaveApplicationPayload {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
}

interface ApplyLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialFormState: LeaveApplicationPayload = {
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
};

export default function ApplyLeaveModal({ isOpen, onClose }: ApplyLeaveModalProps) {
    const [formData, setFormData] = useState<LeaveApplicationPayload>(initialFormState);
    const [error, setError] = useState('');
    const todayString = new Date().toISOString().split('T')[0];
    
    // Connect to React Query Mutation
    const applyLeaveMutation = useApplyLeave();

    // Reset form state cleanly every time the modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
            setError('');
        }
    }, [isOpen]);

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

    const { user } = useAppSelector((state) => state.auth);
    const { data: statsData } = useLeaveStats(user?.id);
    
    const quotaNotSet = statsData?.quotaNotSet || statsData?.data?.quotaNotSet || false;
    const paidLeaveBalance = statsData?.paidLeaveBalance !== undefined && statsData?.paidLeaveBalance !== null
        ? statsData.paidLeaveBalance 
        : (statsData?.data?.paidLeaveBalance !== undefined && statsData?.data?.paidLeaveBalance !== null
            ? statsData.data.paidLeaveBalance 
            : 0);

    const getWorkingDaysCount = (startStr: string, endStr: string) => {
        if (!startStr || !endStr) return 0;
        const start = new Date(startStr);
        const end = new Date(endStr);
        if (end < start) return 0;
        
        let count = 0;
        const cur = new Date(start);
        while (cur <= end) {
            const day = cur.getDay(); // 0 = Sun, 6 = Sat
            if (day !== 0 && day !== 6) {
                count++;
            }
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    };

    const calculatedDays = getWorkingDaysCount(formData.startDate, formData.endDate);
    
    const isSubmitDisabled = applyLeaveMutation.isPending || 
        calculatedDays <= 0 || 
        (formData.leaveType !== 'Unpaid' && formData.leaveType !== '' && quotaNotSet);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (calculatedDays <= 0) {
            setError("End date must be the same as or after the start date.");
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(formData.startDate);
        if (start < today) {
            setError("Leave start date cannot be in the past.");
            return;
        }

        try {
            const finalPayload = {
                ...formData,
                numberOfDays: calculatedDays
            };
            
            // Execute the mutation; cache invalidation happens automatically
            await applyLeaveMutation.mutateAsync(finalPayload);
            handleClose();
        } catch (err: any) {
            // Check if the backend sent a specific error message, otherwise fallback
            setError(err?.response?.data?.message || err.message || "Failed to submit leave request.");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Apply for Leave" className="max-w-md">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 space-y-5 p-2">
                    
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-900/50 transition-colors animate-in fade-in">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <Briefcase size={16} className="text-gray-400 dark:text-gray-500" /> Leave Type
                        </label>
                        <select
                            name="leaveType"
                            value={formData.leaveType}
                            onChange={handleChange}
                            required
                            disabled={applyLeaveMutation.isPending}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 disabled:opacity-50 transition-all shadow-sm dark:shadow-none cursor-pointer"
                        >
                            <option value="" disabled>Select leave type...</option>
                            <option value="Sick">Sick Leave</option>
                            <option value="Casual">Casual Leave</option>
                            <option value="Earned">Earned Leave</option>
                            <option value="Vacation">Vacation Leave</option>
                            <option value="Maternity">Maternity Leave</option>
                            <option value="Paternity">Paternity Leave</option>
                            <option value="Unpaid">Unpaid Leave (LWP)</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                                <Calendar size={16} className="text-gray-400 dark:text-gray-500" /> Start Date
                            </label>
                            <Input 
                                type="date" 
                                name="startDate" 
                                value={formData.startDate} 
                                onChange={handleChange} 
                                required 
                                min={todayString}
                                disabled={applyLeaveMutation.isPending}
                                className="text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                                <Calendar size={16} className="text-gray-400 dark:text-gray-500" /> End Date
                            </label>
                            <Input 
                                type="date" 
                                name="endDate" 
                                value={formData.endDate} 
                                onChange={handleChange} 
                                required 
                                min={formData.startDate} 
                                disabled={applyLeaveMutation.isPending}
                                className="text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {calculatedDays > 0 && !error && (
                        <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-sm rounded-lg border border-blue-200 dark:border-blue-900/50 font-medium flex items-center gap-2 transition-colors">
                                <Clock size={16} className="text-blue-500 dark:text-blue-400" />
                                Requesting {calculatedDays} working day{calculatedDays > 1 ? 's' : ''} of leave.
                            </div>
                            
                              {formData.leaveType && formData.leaveType !== 'Unpaid' && (
                                quotaNotSet ? (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm rounded-lg border border-amber-200 dark:border-amber-900/50 font-medium transition-colors">
                                        ⚠️ Your organization has not set the annual paid leave quota. Kindly ask your admin to do so.
                                    </div>
                                ) : paidLeaveBalance === 0 ? (
                                    <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-900/50 font-medium transition-colors">
                                        ⚠️ You cannot apply for a paid leave as your quota has finished. This request will be treated as Unpaid Leave (LWP).
                                    </div>
                                ) : calculatedDays > paidLeaveBalance ? (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm rounded-lg border border-amber-200 dark:border-amber-900/50 font-medium transition-colors">
                                        ⚠️ You can take only {paidLeaveBalance} days as paid leave. The remaining {calculatedDays - paidLeaveBalance} days will be considered as unpaid leave (LWP).
                                    </div>
                                ) : (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm rounded-lg border border-emerald-200 dark:border-emerald-900/50 font-medium transition-colors">
                                        ✓ You have {paidLeaveBalance - calculatedDays} days of paid leave quota remaining.
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <AlignLeft size={16} className="text-gray-400 dark:text-gray-500" /> Reason for Leave
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            required
                            disabled={applyLeaveMutation.isPending}
                            placeholder="Please provide a brief reason for your leave request..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent min-h-[120px] resize-y bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 disabled:opacity-50 transition-all shadow-sm dark:shadow-none"
                        />
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 transition-colors">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={handleClose} 
                        disabled={applyLeaveMutation.isPending}
                        className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={isSubmitDisabled}
                        className="shadow-sm shadow-blue-500/25 dark:shadow-none font-semibold min-w-[150px]"
                    >
                        {applyLeaveMutation.isPending ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                        {applyLeaveMutation.isPending ? 'Submitting...' : 'Submit Application'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}