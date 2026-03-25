'use client';

import React from 'react';
import { X, AlignLeft, IndianRupee, Calendar } from 'lucide-react';

interface ApplyLoanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ApplyLoanModal({ isOpen, onClose }: ApplyLoanModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">New Loan Request</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Employee Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Select Employee</label>
                        <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-700 bg-white">
                            <option value="">Search employee...</option>
                            <option value="EMP001">Alice Johnson (EMP001)</option>
                            <option value="EMP002">Bob Smith (EMP002)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Loan Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Loan Type</label>
                            <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-700 bg-white">
                                <option value="advance">Salary Advance</option>
                                <option value="personal">Personal Loan</option>
                                <option value="medical">Medical Emergency</option>
                            </select>
                        </div>
                        {/* Amount */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <IndianRupee size={16} className="text-gray-400" /> Amount
                            </label>
                            <input 
                                type="number" 
                                placeholder="50000"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-900 font-medium" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Tenure */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Calendar size={16} className="text-gray-400" /> Repayment Tenure
                            </label>
                            <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-700 bg-white">
                                <option value="1">1 Month (Next Payroll)</option>
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                            </select>
                        </div>
                        {/* Start Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Deduction Start</label>
                            <input type="month" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-600" />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <AlignLeft size={16} className="text-gray-400" /> Reason / Notes
                        </label>
                        <textarea 
                            placeholder="Add any specific details regarding this request..." 
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none min-h-[100px] resize-none text-gray-700" 
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