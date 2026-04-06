'use client';

import React from 'react';
import { Search, Download, Upload, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmployeeHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAddClick: () => void;
    onExportClick?: () => void;
}

export default function EmployeeHeader({
    searchTerm,
    onSearchChange,
    onAddClick,
    onExportClick,
}: EmployeeHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in duration-300">
            {/* Title & Subtitle */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Employees</h1>
                <p className="text-sm text-gray-500 mt-1.5 font-medium">
                    Manage and monitor all employees in MACENZA HRMS
                </p>
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
                
                {/* Search Input */}
                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by name or ID..."
                        className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                    />
                    {/* Clear Search Button */}
                    {searchTerm && (
                        <button 
                            onClick={() => onSearchChange('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Clear search"
                        >
                            <X size={14} strokeWidth={3} />
                        </button>
                    )}
                </div>

                {/* Utility Buttons */}
                <div className="flex items-center gap-2 border-l border-gray-200 pl-2 ml-1">
                    <Button variant="outline" className="gap-2 h-10 shadow-sm border-gray-200 hover:bg-gray-50 hover:text-gray-900">
                        <Upload size={16} className="text-gray-500" />
                        <span className="hidden sm:inline font-medium">Import</span>
                    </Button>
                    <Button variant="outline" className="gap-2 h-10 shadow-sm border-gray-200 hover:bg-gray-50 hover:text-gray-900 cursor-pointer" onClick={onExportClick}>
                        <Download size={16} className="text-gray-500" />
                        <span className="hidden sm:inline font-medium">Export</span>
                    </Button>
                </div>

                {/* Primary Action */}
                <Button
                    variant="primary"
                    onClick={onAddClick}
                    className="gap-2 h-10 px-4 shadow-sm shadow-blue-500/25 ml-1 font-semibold"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Add Employee
                </Button>
            </div>
        </div>
    );
}