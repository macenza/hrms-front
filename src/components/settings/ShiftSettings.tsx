'use client';

import React, { useState } from 'react';
import { Clock, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAppSelector } from '@/store/hooks';
import { useShifts, useCreateShift, useUpdateShift, useDeleteShift } from '@/hooks/api/useShifts';
import toast from 'react-hot-toast';

export default function ShiftSettings() {
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role?.toLowerCase() || '';
    const isUserAdmin = userRole === 'admin';

    // Shift Management State
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [editingShift, setEditingShift] = useState<any>(null);
    const [shiftName, setShiftName] = useState('');
    const [shiftStart, setShiftStart] = useState('09:00');
    const [shiftEnd, setShiftEnd] = useState('17:00');

    const { data: shifts = [], isLoading: isLoadingShifts } = useShifts();
    const createShiftMutation = useCreateShift();
    const updateShiftMutation = useUpdateShift();
    const deleteShiftMutation = useDeleteShift();

    const convert24To12 = (time24: string): string => {
        if (!time24) return '';
        const [hoursStr, minutesStr] = time24.split(':');
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        const strHours = hours < 10 ? '0' + hours : hours;
        return `${strHours}:${strMinutes} ${ampm}`;
    };

    const convert12To24 = (time12: string): string => {
        if (!time12) return '';
        const [time, modifier] = time12.split(' ');
        const [hoursStr, minutes] = time.split(':');
        let hours = parseInt(hoursStr, 10);
        if (hours === 12) {
            hours = 0;
        }
        if (modifier === 'PM') {
            hours = hours + 12;
        }
        const strHours = hours < 10 ? '0' + hours : hours;
        return `${strHours}:${minutes}`;
    };

    const handleOpenAddShift = () => {
        if (!isUserAdmin) return;
        setEditingShift(null);
        setShiftName('');
        setShiftStart('09:00');
        setShiftEnd('17:00');
        setIsShiftModalOpen(true);
    };

    const handleOpenEditShift = (shift: any) => {
        if (!isUserAdmin) return;
        setEditingShift(shift);
        setShiftName(shift.name);
        setShiftStart(convert12To24(shift.startTime));
        setShiftEnd(convert12To24(shift.endTime));
        setIsShiftModalOpen(true);
    };

    const handleSaveShift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shiftName.trim()) {
            toast.error('Shift name is required');
            return;
        }

        const start12 = convert24To12(shiftStart);
        const end12 = convert24To12(shiftEnd);

        const payload = {
            name: shiftName.trim(),
            startTime: start12,
            endTime: end12
        };

        if (editingShift) {
            updateShiftMutation.mutate({
                id: editingShift._id,
                data: payload
            }, {
                onSuccess: () => {
                    toast.success('Shift updated successfully');
                    setIsShiftModalOpen(false);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || 'Failed to update shift');
                }
            });
        } else {
            createShiftMutation.mutate(payload, {
                onSuccess: () => {
                    toast.success('Shift created successfully');
                    setIsShiftModalOpen(false);
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || 'Failed to create shift');
                }
            });
        }
    };

    const handleDeleteShift = (shiftId: string) => {
        if (!isUserAdmin) return;
        if (confirm('Are you sure you want to delete this shift?')) {
            deleteShiftMutation.mutate(shiftId, {
                onSuccess: () => {
                    toast.success('Shift deleted successfully');
                },
                onError: (error: any) => {
                    toast.error(error?.response?.data?.message || 'Failed to delete shift. Employees might be assigned to this shift.');
                }
            });
        }
    };

    return (
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none transition-colors duration-300">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 transition-colors">Shift Management</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                            Configure work shifts, start times, and end times for employee attendance schedules.
                        </p>
                    </div>
                    {isUserAdmin && (
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleOpenAddShift}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1"
                        >
                            <Plus size={16} /> Add Shift
                        </Button>
                    )}
                </div>

                {isLoadingShifts ? (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic py-4">Loading shifts...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {shifts.map((shift: any) => (
                            <div
                                key={shift._id}
                                className="flex flex-col justify-between p-4 bg-gray-50/50 dark:bg-gray-950/30 border border-gray-150 dark:border-gray-800/80 rounded-xl transition-all hover:border-primary/20 hover:bg-gray-50 dark:hover:bg-gray-950/50 group"
                            >
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 capitalize">
                                        {shift.name}
                                    </h4>
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Clock size={14} className="text-gray-400" />
                                        <span>{shift.startTime} - {shift.endTime}</span>
                                    </div>
                                </div>
                                {isUserAdmin && (
                                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-150 dark:border-gray-800/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEditShift(shift)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary transition-colors border border-gray-200 dark:border-gray-800 rounded bg-white dark:bg-gray-900"
                                            title="Edit Shift"
                                        >
                                            <Edit2 size={12} /> Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteShift(shift._id)}
                                            className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-colors border border-red-200 dark:border-red-950/30 rounded bg-white dark:bg-gray-900"
                                            title="Delete Shift"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        {shifts.length === 0 && (
                            <div className="col-span-full py-6 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                                <p className="text-xs text-gray-400 dark:text-gray-500 italic">No shifts configured yet. Create one to get started.</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Add/Edit Shift Modal */}
            <Modal
                isOpen={isShiftModalOpen}
                onClose={() => setIsShiftModalOpen(false)}
                title={editingShift ? 'Edit Shift' : 'Add Shift'}
            >
                <form onSubmit={handleSaveShift} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Shift Name</label>
                        <Input
                            placeholder="e.g. Day Shift, Night Shift"
                            value={shiftName}
                            onChange={(e) => setShiftName(e.target.value)}
                            required
                            className="text-xs font-semibold"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Start Time</label>
                            <input
                                type="time"
                                value={shiftStart}
                                onChange={(e) => setShiftStart(e.target.value)}
                                required
                                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent text-xs bg-white dark:bg-gray-950 font-semibold text-gray-700 dark:text-gray-300"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">End Time</label>
                            <input
                                type="time"
                                value={shiftEnd}
                                onChange={(e) => setShiftEnd(e.target.value)}
                                required
                                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent text-xs bg-white dark:bg-gray-950 font-semibold text-gray-700 dark:text-gray-300"
                            />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsShiftModalOpen(false)}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                            disabled={createShiftMutation.isPending || updateShiftMutation.isPending}
                        >
                            {createShiftMutation.isPending || updateShiftMutation.isPending ? 'Saving...' : 'Save Shift'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
}
