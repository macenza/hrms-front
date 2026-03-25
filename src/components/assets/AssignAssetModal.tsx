'use client';

import React from 'react';
import { X, User, Laptop, Calendar, AlignLeft } from 'lucide-react';

interface AssignAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AssignAssetModal({ isOpen, onClose }: AssignAssetModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Assign Asset</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Employee Selection */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <User size={16} className="text-gray-400" /> Employee
                        </label>
                        <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-700 bg-white">
                            <option value="">Search employee...</option>
                            <option value="EMP001">Alice Johnson (EMP001)</option>
                            <option value="EMP002">Bob Smith (EMP002)</option>
                        </select>
                    </div>

                    {/* Asset Selection */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Laptop size={16} className="text-gray-400" /> Available Asset
                        </label>
                        <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-700 bg-white">
                            <option value="">Select available asset...</option>
                            <option value="AST-1088">iPhone 13 Pro (AST-1088)</option>
                            <option value="AST-1090">Logitech MX Master 3 (AST-1090)</option>
                        </select>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Calendar size={16} className="text-gray-400" /> Assignment Date
                        </label>
                        <input 
                            type="date" 
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-600" 
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <AlignLeft size={16} className="text-gray-400" /> Condition Notes
                        </label>
                        <textarea 
                            placeholder="Add any notes about the asset's condition before handover..." 
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
                        Assign Asset
                    </button>
                </div>
            </div>
        </div>
    );
}