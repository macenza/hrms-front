'use client';

import React, { useState } from 'react';
import { CalendarPlus, Download } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

// Feature Components
import LeaveStats from '@/components/leave/LeaveStats';
import LeaveTable from '@/components/leave/LeaveTable';
import ApplyLeaveModal, { LeaveApplicationPayload } from '@/components/leave/ApplyLeaveModal';

export default function LeavePage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // In the future, this is where you will fetch your data hooks:
    // const { data: stats, isLoading: statsLoading } = useLeaveStats();
    // const { data: leaveHistory, isLoading: historyLoading } = useLeaveHistory();

    const handleApplyLeave = (payload: LeaveApplicationPayload) => {
        // When backend is ready:
        // await apiClient.post('/leaves', payload);
        console.log('Submitting leave application:', payload);
        
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track leave balances, history, and apply for time off
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 shadow-sm">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export History</span>
                    </Button>
                    
                    <Button 
                        variant="primary" 
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2 shadow-sm shadow-blue-500/30"
                    >
                        <CalendarPlus size={18} strokeWidth={2.5} />
                        Apply Leave
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            {/* When API is ready, pass the data: <LeaveStats data={stats} /> */}
            <LeaveStats />

            {/* Main Data Table */}
            <Card className="border-gray-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Leave History</CardTitle>
                </CardHeader>
                {/* We remove the internal padding from CardContent so the table sits flush against the card edges */}
                <CardContent className="p-0 sm:p-0">
                    {/* When API is ready, pass the data: <LeaveTable data={leaveHistory} /> */}
                    <LeaveTable />
                </CardContent>
            </Card>

            {/* Application Modal */}
            <ApplyLeaveModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleApplyLeave}
            />
        </div>
    );
}