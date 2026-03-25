'use client';

import React from 'react';
import { X, Calendar, AlignLeft } from 'lucide-react';

interface ApplyLeaveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ApplyLeaveModal({ isOpen, onClose }: ApplyLeaveModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Apply for Leave</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Leave Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Leave Type</label>
                        <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-700 bg-white">
                            <option value="">Select leave type...</option>
                            <option value="annual">Annual Leave</option>
                            <option value="sick">Sick Leave</option>
                            <option value="casual">Casual Leave</option>
                            <option value="unpaid">Unpaid Leave</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Calendar size={16} className="text-gray-400" /> Start Date
                            </label>
                            <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-600" />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Calendar size={16} className="text-gray-400" /> End Date
                            </label>
                            <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-600" />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <AlignLeft size={16} className="text-gray-400" /> Reason
                        </label>
                        <textarea 
                            placeholder="Please provide a brief reason for your leave request..." 
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none min-h-[120px] resize-none text-gray-700" 
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button className="px-6 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] shadow-sm transition-colors">
                        Submit Request
                    </button>
                </div>
            </div>
        </div>
    );
}