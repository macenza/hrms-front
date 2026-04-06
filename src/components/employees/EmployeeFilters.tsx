'use client';

import React from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface EmployeeFilterState {
    department: string;
    role: string;
    status: string;
    joiningDate: string;
}

interface EmployeeFiltersProps {
    filters: EmployeeFilterState;
    onFilterChange: (key: keyof EmployeeFilterState, value: string) => void;
}

interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    placeholder: string;
    className?: string;
}

const FilterSelect = ({ value, onChange, options, placeholder, className }: FilterSelectProps) => (
    <div className={cn("relative w-full sm:w-auto group", className)}>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "w-full sm:w-44 h-9 appearance-none border border-gray-200 text-gray-700 pl-3 pr-9 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer text-sm font-medium transition-all shadow-sm",
                value ? "bg-blue-50/50 border-blue-200 text-blue-800" : "bg-white hover:bg-gray-50"
            )}
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        <ChevronDown 
            className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors",
                value ? "text-blue-500" : "text-gray-400 group-hover:text-gray-600"
            )} 
            size={16} 
        />
    </div>
);

export default function EmployeeFilters({ filters, onFilterChange }: EmployeeFiltersProps) {
    const departments = [
        { label: 'Engineering', value: 'Engineering' },
        { label: 'Design', value: 'Design' },
        { label: 'HR', value: 'HR' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Product', value: 'Product' },
    ];
    
    const roles = [
        { label: 'Frontend Developer', value: 'Frontend Developer' },
        { label: 'Backend Developer', value: 'Backend Developer' },
        { label: 'UX Designer', value: 'UX Designer' },
        { label: 'QA Engineer', value: 'QA Engineer' },
        { label: 'Product Manager', value: 'Product Manager' },
    ];
    
    const statuses = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
    ];

    // Check if any filter is currently active
    const hasFilters = Object.values(filters).some(val => val !== '');

    const clearAllFilters = () => {
        onFilterChange('department', '');
        onFilterChange('role', '');
        onFilterChange('status', '');
        onFilterChange('joiningDate', '');
    };

    return (
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2.5 py-1 animate-in fade-in duration-300">
            <FilterSelect
                value={filters.department}
                onChange={(val) => onFilterChange('department', val)}
                options={departments}
                placeholder="All Departments"
            />
            
            <FilterSelect
                value={filters.role}
                onChange={(val) => onFilterChange('role', val)}
                options={roles}
                placeholder="All Roles"
            />
            
            <FilterSelect
                value={filters.status}
                onChange={(val) => onFilterChange('status', val)}
                options={statuses}
                placeholder="All Status"
                className="sm:w-36" 
            />
            
            <div className="relative w-full sm:w-auto">
                <input
                    type="date"
                    value={filters.joiningDate}
                    onChange={(e) => onFilterChange('joiningDate', e.target.value)}
                    className={cn(
                        "w-full sm:w-44 h-9 appearance-none border border-gray-200 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer text-sm font-medium transition-all shadow-sm [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
                        filters.joiningDate ? "bg-blue-50/50 border-blue-200 text-blue-800" : "bg-white text-gray-600 hover:bg-gray-50"
                    )}
                />
            </div>

            {/* Dynamic Clear Button */}
            {hasFilters && (
                <button 
                    onClick={clearAllFilters}
                    className="flex items-center gap-1.5 h-9 px-3 ml-1 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors animate-in zoom-in-95"
                >
                    <RotateCcw size={14} />
                    Clear
                </button>
            )}
        </div>
    );
}