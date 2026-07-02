'use client';

import React, { useState, useEffect } from 'react';
import { X, UserCheck, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useActiveEmployees } from '@/hooks/api/useEmployees';
import { useMarkAttendance } from '@/hooks/api/useAttendance';
import { AttendanceRecord, AttendanceStatus } from './AttendanceTable';
import { toast } from 'sonner';

interface MarkAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRecord: AttendanceRecord | null;
    selectedDate: string; // YYYY-MM-DD
}

export default function MarkAttendanceModal({
    isOpen,
    onClose,
    selectedRecord,
    selectedDate
}: MarkAttendanceModalProps) {
    const [employeeId, setEmployeeId] = useState('');
    const [status, setStatus] = useState<AttendanceStatus>('Present');
    const [checkInTime, setCheckInTime] = useState('');
    const [checkOutTime, setCheckOutTime] = useState('');
    const [isLate, setIsLate] = useState(false);
    const [lateMinutes, setLateMinutes] = useState(0);
    const [workFormat, setWorkFormat] = useState('Office');

    const { data: activeEmployees = [] } = useActiveEmployees();
    const markMutation = useMarkAttendance();

    const parseToTimeString = (timeStr: string | null) => {
        if (!timeStr) return '';
        if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
        const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (match) {
            let hours = parseInt(match[1], 10);
            const minutes = match[2];
            const ampm = match[3].toUpperCase();
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            return `${String(hours).padStart(2, '0')}:${minutes}`;
        }
        return '';
    };

    useEffect(() => {
        if (selectedRecord) {
            setEmployeeId(selectedRecord.employeeUserId || '');
            setStatus(selectedRecord.status === 'Late' ? 'Present' : selectedRecord.status);
            setCheckInTime(parseToTimeString(selectedRecord.checkIn));
            setCheckOutTime(parseToTimeString(selectedRecord.checkOut));
            setIsLate(selectedRecord.status === 'Late' || selectedRecord.late === 'Yes');
            setLateMinutes(0);
            setWorkFormat((selectedRecord as any).workFormat || 'Office');
        } else {
            setEmployeeId('');
            setStatus('Present');
            setCheckInTime('');
            setCheckOutTime('');
            setIsLate(false);
            setLateMinutes(0);
            setWorkFormat('Office');
        }
    }, [selectedRecord, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!employeeId) {
            toast.error("Please select an employee.");
            return;
        }

        const isAbsentOrLeave = status === 'Absent' || status === 'On Leave';

        if (!isAbsentOrLeave) {
            if (checkOutTime && !checkInTime) {
                toast.error("Check-in time is required if check-out time is specified.");
                return;
            }

            if (checkInTime && checkOutTime) {
                const [inH, inM] = checkInTime.split(':').map(Number);
                const [outH, outM] = checkOutTime.split(':').map(Number);
                if (outH < inH || (outH === inH && outM < inM)) {
                    toast.error("Check-out time cannot be before check-in time.");
                    return;
                }
            }
        }

        try {
            await markMutation.mutateAsync({
                employeeId,
                dateString: selectedDate,
                status,
                checkInTime: isAbsentOrLeave ? undefined : checkInTime || undefined,
                checkOutTime: isAbsentOrLeave ? undefined : checkOutTime || undefined,
                isLate: isAbsentOrLeave ? false : isLate,
                lateByMinutes: (isAbsentOrLeave || !isLate) ? 0 : lateMinutes,
                workFormat
            });
            toast.success("Attendance marked successfully!");
            onClose();
        } catch (error: any) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to mark attendance.");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/40 transition-colors">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 transition-colors">
                        <UserCheck size={20} className="text-blue-600 dark:text-blue-400" />
                        {selectedRecord ? 'Adjust Attendance' : 'Mark Attendance'}
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 dark:text-gray-500"
                    >
                        <X size={18} />
                    </button>
                </div>
                
                {/* Form Body */}
                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                    
                    {/* Employee Selection */}
                    {selectedRecord ? (
                        <div>
                            <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Employee</label>
                            <div className="h-10 px-3 flex items-center bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-bold text-gray-900 dark:text-gray-100 transition-colors">
                                {selectedRecord.name} ({selectedRecord.id})
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Select Employee</label>
                            <div className="relative">
                                <select
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    className="w-full h-10 pl-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm transition-all"
                                >
                                    <option value="">-- Choose Employee --</option>
                                    {activeEmployees.map((emp: any) => (
                                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.empId})</option>
                                    ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Attendance Status Selector */}
                    <div>
                        <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Attendance Status</label>
                        <div className="relative">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                                className="w-full h-10 pl-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm transition-all"
                            >
                                <option value="Present">Present</option>
                                <option value="Half-Day">Half Day</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Absent">Absent</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Clock Times */}
                    {status !== 'Absent' && status !== 'On Leave' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Check-In Time</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={checkInTime}
                                            onChange={(e) => setCheckInTime(e.target.value)}
                                            className="w-full h-10 px-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Check-Out Time</label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={checkOutTime}
                                            onChange={(e) => setCheckOutTime(e.target.value)}
                                            className="w-full h-10 px-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm transition-all [color-scheme:light] dark:[color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Lateness Manual Overrides */}
                            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800 transition-colors">
                                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-semibold cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isLate}
                                        onChange={(e) => setIsLate(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500"
                                    />
                                    Mark as Late (Manual Override)
                                </label>
                                {isLate && (
                                    <div className="flex items-center gap-1.5 ml-auto animate-in fade-in slide-in-from-right-2 duration-200">
                                        <input
                                            type="number"
                                            value={lateMinutes}
                                            min={0}
                                            onChange={(e) => setLateMinutes(Number(e.target.value))}
                                            placeholder="Minutes"
                                            className="w-20 h-8 px-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded text-xs font-mono font-bold text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-500"
                                        />
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-extrabold uppercase">mins</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Working Format */}
                    <div>
                        <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Working Format</label>
                        <div className="relative">
                            <select
                                value={workFormat}
                                onChange={(e) => setWorkFormat(e.target.value)}
                                className="w-full h-10 pl-3 pr-8 appearance-none bg-white dark:bg-gray-950 border border-gray-200/80 dark:border-gray-800/60 rounded-lg text-sm font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 shadow-sm transition-all"
                            >
                                <option value="Office">Office</option>
                                <option value="Remote">Remote</option>
                                <option value="Field">Field</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex justify-end gap-3 transition-colors">
                    <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="h-10 px-4 text-xs font-semibold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSubmit}
                        disabled={markMutation.isPending}
                        className="h-10 px-6 text-xs font-bold gap-1.5 shadow-sm shadow-blue-500/25 dark:shadow-none"
                    >
                        {markMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                        {markMutation.isPending ? 'Saving...' : 'Save Record'}
                    </Button>
                </div>

            </div>
        </div>
    );
}
