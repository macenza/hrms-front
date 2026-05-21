'use client';

import React from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/store/hooks';

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
    <div className={cn("relative w-full sm:w-44 group", className)}>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "w-full h-9 appearance-none border border-gray-200 text-gray-700 pl-3 pr-9 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer text-sm font-medium transition-all shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100 dark:focus:ring-blue-500",
                value ? "bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" : "bg-white hover:bg-gray-50 dark:bg-gray-950 dark:hover:bg-gray-900"
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
                value ? "text-blue-500" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
            )} 
            size={16} 
        />
    </div>
);

export default function EmployeeFilters({ filters, onFilterChange }: EmployeeFiltersProps) {
    const { user } = useAppSelector((state) => state.auth);
    const isAdmin = user?.role?.toLowerCase() === 'admin';

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

    if (isAdmin) {
        statuses.push({ label: 'Past Employees', value: 'Past' });
    }

    // Check if any filter is currently active
    const hasFilters = Object.values(filters).some(val => val !== '');

    const clearAllFilters = () => {
        onFilterChange('department', '');
        onFilterChange('role', '');
        onFilterChange('status', '');
        onFilterChange('joiningDate', '');
    };

    return (
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4 py-1 animate-in fade-in duration-300">
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
            />

            {/* Dynamic Clear Button */}
            {hasFilters && (
                <button 
                    onClick={clearAllFilters}
                    className="flex items-center gap-1.5 h-9 px-4 ml-1.5 sm:ml-2 text-sm font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors animate-in zoom-in-95 shrink-0"
                >
                    <RotateCcw size={14} />
                    Clear
                </button>
            )}
        </div>
    );
}