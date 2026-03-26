'use client';

import React from 'react';
import { Search, Download, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// 1. Updated Props to handle search state externally
interface EmployeeHeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAddClick: () => void;
}

export default function EmployeeHeader({
    searchTerm,
    onSearchChange,
    onAddClick
}: EmployeeHeaderProps) {

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in duration-300">

            {/* Title & Subtitle */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage and monitor all employees in MACENZA HRMS
                </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">

                {/* Search Input (Now Controlled) */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by name or ID..."
                        className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                </div>

                {/* Utility Buttons */}
                <Button variant="outline" className="gap-2">
                    <Upload size={16} />
                    <span className="hidden sm:inline">Import</span>
                </Button>

                <Button variant="outline" className="gap-2">
                    <Download size={16} />
                    <span className="hidden sm:inline">Export</span>
                </Button>

                {/* Primary Action */}
                <Button
                    variant="primary"
                    onClick={onAddClick}
                    className="gap-2 shadow-sm shadow-blue-500/30"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Employee
                </Button>
            </div>

        </div>
    );
}