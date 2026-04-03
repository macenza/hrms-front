'use client';

import React, { useState } from 'react';
import LeaveStats from '@/components/leave/LeaveStats';
import LeaveTable from '@/components/leave/LeaveTable';
import ApplyLeaveModal from '@/components/leave/ApplyLeaveModal';
import { Plus } from 'lucide-react';

export default function LeavePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleLeaveSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Leave Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track, manage, and request time off.</p>
                </div>

                {/* Modal Toggle Button */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm shadow-blue-200"
                >
                    <Plus size={18} />
                    Apply Leave
                </button>
            </div>

            {/* Top Stats Section */}
            <LeaveStats />

            {/* Main Data Table */}
            <LeaveTable refreshTrigger={refreshTrigger} />

            {/* The Modal */}
            <ApplyLeaveModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={handleLeaveSuccess} 
            />

        </div>
    );
}