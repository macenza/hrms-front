'use client';

import React from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Data Contracts for Backend Integration
export type LeaveStatus = 'Approved' | 'Pending' | 'Rejected';

export interface LeaveRecord {
    id: string;
    type: string;
    from: string;
    to: string;
    days: number;
    reason: string;
    status: LeaveStatus;
}

interface LeaveTableProps {
    data?: LeaveRecord[];
}

// Mock Data Fallback
const mockLeaveData: LeaveRecord[] = [
    { id: 'LV-1042', type: 'Annual Leave', from: 'Nov 20, 2023', to: 'Nov 24, 2023', days: 5, reason: 'Family vacation', status: 'Pending' },
    { id: 'LV-0981', type: 'Sick Leave', from: 'Oct 02, 2023', to: 'Oct 03, 2023', days: 2, reason: 'Viral fever', status: 'Approved' },
    { id: 'LV-0844', type: 'Casual Leave', from: 'Aug 15, 2023', to: 'Aug 15, 2023', days: 1, reason: 'Personal errands', status: 'Approved' },
    { id: 'LV-0712', type: 'Annual Leave', from: 'Jun 10, 2023', to: 'Jun 14, 2023', days: 5, reason: 'Out of station', status: 'Rejected' },
];

// Dynamic UI Helper
const getStatusBadgeVariant = (status: LeaveStatus) => {
    switch (status) {
        case 'Approved': return 'success';
        case 'Pending': return 'warning';
        case 'Rejected': return 'error';
        default: return 'default';
    }
};

export default function LeaveTable({ data = mockLeaveData }: LeaveTableProps) {
    return (
        <Card className="overflow-hidden border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">LEAVE TYPE</th>
                            <th className="px-6 py-4">DURATION</th>
                            <th className="px-6 py-4">DAYS</th>
                            <th className="px-6 py-4">REASON</th>
                            <th className="px-6 py-4">STATUS</th>
                            <th className="px-6 py-4 text-center">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No leave records found.
                                </td>
                            </tr>
                        ) : (
                            data.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-gray-900">{record.type}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{record.id}</p>
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {record.from} <span className="mx-1 text-gray-400">→</span> {record.to}
                                    </td>

                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {record.days} {record.days === 1 ? 'Day' : 'Days'}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]" title={record.reason}>
                                        {record.reason}
                                    </td>

                                    <td className="px-6 py-4">
                                        <Badge variant={getStatusBadgeVariant(record.status)}>
                                            {record.status}
                                        </Badge>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-2 h-8 w-8 rounded-full text-gray-400 hover:text-gray-700"
                                            aria-label="More actions"
                                        >
                                            <MoreVertical size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}