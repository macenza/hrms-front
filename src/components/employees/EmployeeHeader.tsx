// src/components/employees/EmployeeHeader.tsx
'use client';

import React from 'react';
import { Search, Download, Upload, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmployeeHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAddClick: () => void;
    onExportClick?: () => void;
    onImportClick?: () => void;
}

export default function EmployeeHeader({
    searchTerm,
    onSearchChange,
    onAddClick,
    onExportClick,
    onImportClick,
}: EmployeeHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in duration-300">
            {/* Title & Subtitle */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                    Employees
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium transition-colors">
                    Manage and monitor all employees in MACENZA HRMS
                </p>
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
                
                {/* Search Input */}
                <div className="relative w-full md:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by name or ID..."
                        className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-gray-950 transition-all shadow-sm dark:shadow-none"
                    />
                    {/* Clear Search Button */}
                    {searchTerm && (
                        <button 
                            onClick={() => onSearchChange('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            aria-label="Clear search"
                        >
                            <X size={14} strokeWidth={3} />
                        </button>
                    )}
                </div>

                {/* Utility Buttons */}
                <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-800 pl-2 ml-1 transition-colors">
                    <Button variant="outline" onClick={onImportClick} className="gap-2 h-10 shadow-sm dark:shadow-none border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        <Upload size={16} className="text-gray-500 dark:text-gray-400" />
                        <span className="hidden sm:inline font-medium">Import</span>
                    </Button>
                    <Button variant="outline" onClick={onExportClick} className="gap-2 h-10 shadow-sm dark:shadow-none border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer transition-colors">
                        <Download size={16} className="text-gray-500 dark:text-gray-400" />
                        <span className="hidden sm:inline font-medium">Export</span>
                    </Button>
                </div>

                {/* Primary Action */}
                <button
                    onClick={onAddClick}
                    className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600 gap-2 h-10 px-4 shadow-sm shadow-blue-500/25 dark:shadow-none ml-1"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Add Employee
                </button>
            </div>
        </div>
    );
}