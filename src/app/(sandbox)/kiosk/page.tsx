'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, Clock, Terminal as TerminalIcon, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import apiClient from '@/services/apiClient';

interface LogEntry {
    time: string;
    text: string;
    type: 'success' | 'error' | 'info';
}

const SAMPLE_IDS = ['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004'];

export default function KioskPage() {
    const [employeeId, setEmployeeId] = useState('');
    const [action, setAction] = useState<'IN' | 'OUT'>('IN');
    const [logs, setLogs] = useState<LogEntry[]>([
        {
            time: new Date().toLocaleTimeString(),
            text: 'Sandbox biometric attendance scanner ready.',
            type: 'info',
        },
        {
            time: new Date().toLocaleTimeString(),
            text: 'Select Mode, scan/type an Employee ID, and hit Enter.',
            type: 'info',
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    
    const inputRef = useRef<HTMLInputElement>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    // Synchronize current date/time clock
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
            setCurrentDate(now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }));
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Scroll terminal log console to bottom on update
    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // Maintain auto-focus on input field
    useEffect(() => {
        const focusInput = () => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        };
        focusInput();
        
        const handlePageClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'BUTTON' || 
                target.closest('button') ||
                (target.tagName === 'INPUT' && target !== inputRef.current)
            ) {
                return;
            }
            focusInput();
        };

        document.addEventListener('click', handlePageClick);
        return () => {
            document.removeEventListener('click', handlePageClick);
        };
    }, []);

    const addLog = (text: string, type: 'success' | 'error' | 'info') => {
        setLogs((prev) => [
            ...prev,
            {
                time: new Date().toLocaleTimeString(),
                text,
                type,
            },
        ]);
    };

    const triggerAttendanceCall = async (idToScan: string) => {
        const targetId = idToScan.trim().toUpperCase();
        if (!targetId) {
            addLog('Scan ignored: Employee ID is empty.', 'error');
            return;
        }

        setIsLoading(true);
        addLog(`Requesting Clock-${action} for [${targetId}]...`, 'info');

        try {
            const response = await apiClient.post('/dev/kiosk-attendance', {
                employeeId: targetId,
                action,
            });

            if (response.data?.success) {
                addLog(response.data.message || `Success: Clocked-${action} for ${targetId}`, 'success');
            } else {
                addLog(`Server error: ${JSON.stringify(response.data)}`, 'error');
            }
        } catch (error: any) {
            const errMsg = error.response?.data?.error || error.message || 'Network communication error.';
            addLog(`Rejected: ${errMsg}`, 'error');
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const scannedId = employeeId;
            setEmployeeId(''); // Reset input immediately
            await triggerAttendanceCall(scannedId);
        }
    };

    const handleQuickSwipe = async (id: string) => {
        if (isLoading) return;
        addLog(`Simulated card tap for ${id}`, 'info');
        await triggerAttendanceCall(id);
    };

    const clearLogs = () => {
        setLogs([
            {
                time: new Date().toLocaleTimeString(),
                text: 'Terminal logs cleared.',
                type: 'info',
            },
        ]);
        inputRef.current?.focus();
    };

    return (
        <div className="min-h-screen lg:h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-y-auto lg:overflow-hidden">
            
            {/* Minimal Header */}
            <header className="border-b border-slate-900 bg-slate-900/30 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <Fingerprint className="text-white" size={18} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            Attendance Kiosk <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded font-semibold tracking-wider">SANDBOX</span>
                        </h1>
                        <p className="text-[10px] text-slate-400">Local Testing Hardware Simulator</p>
                    </div>
                </div>
                
                {/* Time Display */}
                <div className="flex items-center gap-4 shrink-0 text-center sm:text-right">
                    <div>
                        <div className="text-lg font-bold font-mono text-slate-200">{currentTime || '00:00:00'}</div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase mt-0.5">{currentDate || 'Loading...'}</div>
                    </div>
                </div>
            </header>

            {/* Simple, Highly Responsive Grid */}
            <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 min-h-0 relative overflow-visible lg:overflow-hidden">
                
                {/* Left Side: Biometric Scanner Card */}
                <div className="flex-1 flex flex-col items-center justify-center overflow-visible lg:overflow-y-auto">
                    <div className="w-full max-w-xl bg-slate-900/30 border border-slate-900 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center shadow-xl text-center">
                        
                        {/* Device Scanning Circle */}
                        <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center transition-colors duration-300 mb-6 ${
                            action === 'IN' 
                                ? 'border-blue-500/40 bg-blue-950/10 text-blue-400' 
                                : 'border-emerald-500/40 bg-emerald-950/10 text-emerald-400'
                        }`}>
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={32} />
                            ) : (
                                <Fingerprint size={36} className="animate-pulse" />
                            )}
                        </div>

                        <h2 className="text-md sm:text-lg font-bold text-white">
                            Ready to {action === 'IN' ? 'Clock IN' : 'Clock OUT'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">
                            Select mode below, type or scan your ID card, then press Enter.
                        </p>

                        {/* Flat Mode Selector */}
                        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-900 w-full max-w-md mt-6 shrink-0">
                            <button
                                onClick={() => {
                                    setAction('IN');
                                    addLog('Switched mode to Clock IN.', 'info');
                                    inputRef.current?.focus();
                                }}
                                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    action === 'IN'
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Clock size={14} />
                                Clock IN
                            </button>
                            <button
                                onClick={() => {
                                    setAction('OUT');
                                    addLog('Switched mode to Clock OUT.', 'info');
                                    inputRef.current?.focus();
                                }}
                                className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                                    action === 'OUT'
                                        ? 'bg-emerald-600 text-white'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Clock size={14} />
                                Clock OUT
                            </button>
                        </div>

                        {/* Scanner Swipe Input */}
                        <div className="w-full max-w-md mt-5 shrink-0">
                            <input
                                ref={inputRef}
                                type="text"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="TYPE ID OR SWIPE CARD..."
                                disabled={isLoading}
                                className="w-full bg-slate-950 border border-slate-900 hover:border-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-4 py-3 text-center font-mono text-sm tracking-wider placeholder:text-slate-700 text-white outline-none transition-all uppercase"
                            />
                        </div>

                        {/* Quick Demo Simulator Taps */}
                        <div className="w-full max-w-md mt-6 border-t border-slate-900 pt-5 text-center shrink-0">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-2.5">
                                Quick scan shortcuts
                            </span>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {SAMPLE_IDS.map((id) => (
                                    <button
                                        key={id}
                                        onClick={() => handleQuickSwipe(id)}
                                        disabled={isLoading}
                                        className="px-3 py-1.5 bg-slate-900 border border-slate-850 hover:border-slate-850 hover:bg-slate-800 text-slate-300 font-mono text-xs rounded-lg transition-all flex items-center gap-1 disabled:opacity-50"
                                    >
                                        {id}
                                        <ArrowRight size={10} className="text-slate-500" />
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Side: Clean Monospace Logs Terminal */}
                <div className="w-full lg:w-[380px] xl:w-[440px] flex flex-col shrink-0 h-[300px] lg:h-auto bg-black border border-slate-900 rounded-2xl overflow-hidden shadow-lg relative">
                    
                    {/* Terminal Header */}
                    <div className="bg-slate-900/60 px-4 py-2.5 flex items-center justify-between border-b border-slate-950 shrink-0">
                        <div className="flex items-center gap-2">
                            <TerminalIcon className="text-slate-400" size={14} />
                            <span className="text-xs font-bold font-mono tracking-tight text-slate-350">Terminal Output</span>
                        </div>
                        <button 
                            onClick={clearLogs}
                            className="text-[9px] font-bold font-mono uppercase bg-slate-950/80 text-slate-400 hover:text-white border border-slate-850 px-2 py-0.5 rounded transition-colors"
                        >
                            <Trash2 size={10} className="inline mr-1" />
                            Clear
                        </button>
                    </div>

                    {/* Terminal Lines */}
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] sm:text-xs leading-relaxed space-y-2 bg-black scrollbar-thin scrollbar-thumb-slate-850">
                        {logs.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-2 border-b border-slate-950/80 pb-1.5">
                                <span className="text-slate-600 shrink-0">[{log.time}]</span>
                                <span className={
                                    log.type === 'success' 
                                        ? 'text-emerald-400 font-medium' 
                                        : log.type === 'error' 
                                            ? 'text-red-400' 
                                            : 'text-slate-350'
                                }>
                                    {log.type === 'success' && '✓ '}
                                    {log.type === 'error' && '✘ '}
                                    {log.text}
                                </span>
                            </div>
                        ))}
                        <div ref={terminalEndRef}></div>
                    </div>

                </div>
            </main>
        </div>
    );
}
