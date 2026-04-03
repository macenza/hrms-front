'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { getMyLeaves, getAllLeaves } from '@/services/leaveService';
import { Leave } from '@/types';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function RecentLeaves() {
    const { user } = useAppSelector((state) => state.auth);
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaves = async () => {
            if (!user) return;
            try {
                // 1. Add ': any' to fix the TypeScript 'never' error
                let rawData: any; 
                
                if (user.role === 'HR' || user.role === 'Admin') {
                    rawData = await getAllLeaves();
                } else {
                    rawData = await getMyLeaves();
                }

                // 2. Log it to the console so we can see the exact shape!
                console.log("Raw Leave API Response:", rawData);

                // 3. Bulletproof Array Extraction (Using optional chaining '?.' for extra safety)
                let leavesArray: Leave[] = [];
                if (Array.isArray(rawData)) {
                    leavesArray = rawData;
                } else if (rawData?.data && Array.isArray(rawData.data)) {
                    leavesArray = rawData.data;
                } else if (rawData?.leaves && Array.isArray(rawData.leaves)) {
                    leavesArray = rawData.leaves;
                } else if (rawData?.results && Array.isArray(rawData.results)) {
                    leavesArray = rawData.results;
                } else {
                    console.warn("Could not find the array inside the response.");
                }
                
                setLeaves(leavesArray);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaves();
    }, [user]);

    // Helper function for status colors
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Approved': return <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200"><CheckCircle2 size={12}/> Approved</span>;
            case 'Rejected': return <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-md border border-red-200"><XCircle size={12}/> Rejected</span>;
            case 'Pending': return <span className="flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-200"><Clock size={12}/> Pending</span>;
            default: return <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md">{status}</span>;
        }
    };

    if (isLoading) return <div className="h-48 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center animate-pulse text-gray-400">Loading leave data...</div>;
    if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>;

    // --- THE FINAL FIX: Safe Rendering ---
    // This guarantees that the variable we map and slice over is ALWAYS an array.
    const safeLeaves = Array.isArray(leaves) ? leaves : [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">
                    {user?.role === 'HR' || user?.role === 'Admin' ? 'Organization Leave Requests' : 'My Recent Leaves'}
                </h3>
            </div>
            
            <div className="divide-y divide-gray-50">
                {/* Use safeLeaves instead of leaves here */}
                {safeLeaves.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500">No leave requests found.</div>
                ) : (
                    // Use safeLeaves instead of leaves here
                    safeLeaves.slice(0, 5).map((leave) => (
                        <div key={leave._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-gray-900">{leave.leaveType} Leave</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">"{leave.reason}"</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {getStatusBadge(leave.status)}
                                <span className="text-xs font-bold text-gray-700">{leave.numberOfDays} Day(s)</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}