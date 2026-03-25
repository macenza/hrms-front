'use client';

import React, { useState } from 'react';
import { CalendarPlus, Download } from 'lucide-react';
import LeaveStats from '@/components/leave/LeaveStats';
import LeaveTable from '@/components/leave/LeaveTable';
import ApplyLeaveModal from '@/components/leave/ApplyLeaveModal';

export default function LeavePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track leave balances, history, and apply for time off</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export History</span>
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] transition-colors shadow-sm shadow-blue-500/30"
                    >
                        <CalendarPlus size={18} strokeWidth={2.5} />
                        Apply Leave
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <LeaveStats />

            {/* Main Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Leave History</h2>
                <LeaveTable />
            </div>

            {/* Application Modal */}
            <ApplyLeaveModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}