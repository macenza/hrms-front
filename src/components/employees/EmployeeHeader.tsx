'use client';

import React from 'react';
import { Search, Download, Upload, Plus } from 'lucide-react';

interface EmployeeHeaderProps {
    onAddClick: () => void;
}

export default function EmployeeHeader({ onAddClick }: EmployeeHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Subtitle */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage and monitor all employees in MACENZA HRMS
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
                        className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] w-full md:w-64 transition-all"
                    />
                </div>

                {/* Utility Buttons */}
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    <Upload size={16} />
                    <span className="hidden sm:inline">Import</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                    <Download size={16} />
                    <span className="hidden sm:inline">Export</span>
                </button>

                {/* Primary Action */}
                <button 
                    onClick={onAddClick}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-medium hover:bg-[#3A62D7] transition-colors shadow-sm shadow-blue-500/30"
                >
                    <Plus size={16} />
                    Add Employee
                </button>
            </div>
        </div>
    );
}