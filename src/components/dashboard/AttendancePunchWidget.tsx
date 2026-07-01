'use client';
import React, { useState, useEffect } from 'react';
import { Clock, Loader2, RotateCcw, TriangleAlert } from 'lucide-react';
import { useClockIn, useClockOut, useMyAttendance, useResetTodayAttendance } from '@/hooks/api/useAttendance';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logOut } from '@/store/authSlice';
import { logoutUser } from '@/services/authService';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';

export default function AttendancePunchWidget() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isAdminOrHR = role === 'admin' || role === 'hr';
    const { data: attendanceData, isLoading } = useMyAttendance();
    const clockInMutation = useClockIn();
    const clockOutMutation = useClockOut();
    const resetMutation = useResetTodayAttendance();

    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const [currentTime, setCurrentTime] = useState<string>('');

    // Normalize date string for checking today's status
    const todayString = new Date().toLocaleDateString('en-CA');
    const todayLog = attendanceData?.logs?.find((log: any) => log.dateString === todayString);
    const isClockedIn = todayLog && !todayLog.checkOutTime;
    const isClockedOut = todayLog && todayLog.checkOutTime;

    // Running duration timer
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    // Update real-time clock (showing seconds, e.g. "9:24:12 AM")
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
        };
        updateClock();
        const timeInterval = setInterval(updateClock, 1000);
        return () => clearInterval(timeInterval);
    }, []);

    // Elapsed worked timer (stopwatch format: hh:mm:ss)
    useEffect(() => {
        if (!isClockedIn || !todayLog?.checkInTime) {
            if (isClockedOut && todayLog?.totalWorkedMinutes) {
                // If clocked out, show the total worked duration in format hh:mm:00
                const hrs = Math.floor(todayLog.totalWorkedMinutes / 60);
                const mins = todayLog.totalWorkedMinutes % 60;
                const pad = (n: number) => String(n).padStart(2, '0');
                setElapsedTime(`${pad(hrs)}:${pad(mins)}:00`);
            } else {
                setElapsedTime('00:00:00');
            }
            return;
        }

        const updateTimer = () => {
            const checkInDate = new Date(todayLog.checkInTime);
            const diffMs = Date.now() - checkInDate.getTime();
            if (diffMs < 0) {
                setElapsedTime('00:00:00');
                return;
            }
            const hours = Math.floor(diffMs / 3600000);
            const mins = Math.floor((diffMs % 3600000) / 60000);
            const secs = Math.floor((diffMs % 60000) / 1000);

            const pad = (n: number) => String(n).padStart(2, '0');
            setElapsedTime(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
        };

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
        return () => clearInterval(timerInterval);
    }, [isClockedIn, isClockedOut, todayLog?.checkInTime, todayLog?.totalWorkedMinutes]);

    const handleClockIn = async () => {
        if (isClockedIn) {
            toast.error("You are already checked in!");
            return;
        }
        if (isClockedOut) {
            toast.error("You have already checked out for today!");
            return;
        }
        try {
            await clockInMutation.mutateAsync('Office');
            toast.success("Checked in successfully!");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Check-in failed";
            toast.error(msg);
        }
    };

    const handleLogoutAfterCheckout = async () => {
        try {
            await logoutUser();
        } catch (err) {
            console.error("Backend logout failed:", err);
        } finally {
            dispatch(logOut());
            router.push('/login');
        }
    };

    const handleClockOutClick = () => {
        if (!isClockedIn) {
            toast.error("You must check in first!");
            return;
        }
        setIsCheckoutModalOpen(true);
    };

    const confirmCheckout = async (shouldLogout: boolean) => {
        setIsCheckoutModalOpen(false);
        try {
            await clockOutMutation.mutateAsync();
            toast.success("Checked out successfully!");
            if (shouldLogout) {
                toast.info("Logging out...");
                await handleLogoutAfterCheckout();
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "Check-out failed";
            toast.error(msg);
        }
    };

    const handleReset = async () => {
        setIsResetModalOpen(false);
        try {
            const result = await resetMutation.mutateAsync();
            toast.success(result?.message || 'Today\'s attendance reset successfully!');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Reset failed';
            toast.error(msg);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-6 h-64 rounded-xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                <span className="text-xs text-gray-500">Loading Attendance Self Service...</span>
            </div>
        );
    }

    const isPending = clockInMutation.isPending || clockOutMutation.isPending;

    // Format today's checkin time if exists
    const checkInTimeString = todayLog?.checkInTime 
        ? new Date(todayLog.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        : '00:00 AM';

    return (
        <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-md shadow-slate-200/20 dark:shadow-none hover:shadow-lg transition-all duration-300 p-6 flex flex-col justify-between h-[270px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-800/80 pb-3.5">
                <div className="flex items-center gap-2.5">
                    <Clock className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Attendance Self Service
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Reset button — admin/hr only */}
                    {isAdminOrHR && (
                        <button
                            onClick={() => setIsResetModalOpen(true)}
                            disabled={resetMutation.isPending}
                            title="Reset Today's Attendance (Dev/Admin)"
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-amber-300/60 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:shadow-sm hover:shadow-amber-300/20 active:scale-95 transition-all duration-200 cursor-pointer select-none"
                        >
                            <RotateCcw className={`w-3 h-3 ${resetMutation.isPending ? 'animate-spin' : ''}`} />
                            Reset
                        </button>
                    )}
                    {/* Live dot indicator */}
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider select-none">
                        <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500' : 'bg-rose-500 animate-pulse shadow-sm shadow-rose-500'}`} />
                        {isClockedIn ? 'Clocked In' : 'Clocked Out'}
                    </span>
                </div>
            </div>

            {/* Time Display */}
            <div className="flex flex-col items-center justify-center my-4 py-3 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-100/50 dark:border-gray-800/30 rounded-2xl">
                <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-mono tabular-nums select-none">
                    {currentTime || '00:00:00 AM'}
                </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3.5 mb-1.5">
                <button
                    onClick={handleClockIn}
                    disabled={isPending || isClockedIn || isClockedOut}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all cursor-pointer select-none text-center duration-305 ${
                        isClockedIn || isClockedOut
                            ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent'
                            : 'bg-emerald-600 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 border border-emerald-600/10 shadow-[0_0_12px_rgba(16,185,129,0.2)] animate-pulse'
                    }`}
                >
                    {clockInMutation.isPending ? 'Processing...' : 'Checkin'}
                </button>
                <button
                    onClick={handleClockOutClick}
                    disabled={isPending || !isClockedIn}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all cursor-pointer select-none text-center duration-305 ${
                        !isClockedIn
                            ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent'
                            : 'bg-rose-600 hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/30 active:scale-95 border border-rose-600/10 shadow-[0_0_12px_rgba(244,63,94,0.2)] animate-pulse'
                    }`}
                >
                    {clockOutMutation.isPending ? 'Processing...' : 'Checkout'}
                </button>
            </div>

            {/* Status Footer columns */}
            <div className="grid grid-cols-2 border-t border-gray-150 dark:border-gray-800/80 pt-3.5 text-center">
                <div className="border-r border-gray-150 dark:border-gray-800/80">
                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-0.5">
                        Checkin Time
                    </span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                        {checkInTimeString}
                    </span>
                </div>
                <div>
                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-0.5">
                        Worked Today
                    </span>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block font-mono tabular-nums">
                        {elapsedTime}
                    </span>
                </div>
            </div>

            {/* Checkout Confirmation Modal */}
            <Modal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                title="Confirm Checkout"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        You are about to check out for today. Would you like to log out of your session as well?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
                        <button
                            type="button"
                            onClick={() => setIsCheckoutModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => confirmCheckout(false)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer"
                        >
                            Just Checkout
                        </button>
                        <button
                            type="button"
                            onClick={() => confirmCheckout(true)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all cursor-pointer"
                        >
                            Checkout & Logout
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Reset Today Confirmation Modal */}
            <Modal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                title="Reset Today's Attendance"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
                        <TriangleAlert className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                            This will <strong>permanently delete all attendance records for today</strong> across all employees. This action cannot be undone.
                        </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to reset today&apos;s attendance? All check-in and check-out data for today will be erased.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-end mt-2">
                        <button
                            type="button"
                            onClick={() => setIsResetModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={resetMutation.isPending}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                        >
                            <RotateCcw className={`w-3.5 h-3.5 ${resetMutation.isPending ? 'animate-spin' : ''}`} />
                            {resetMutation.isPending ? 'Resetting...' : 'Yes, Reset Now'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
