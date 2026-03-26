'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

// 1. Define the state contract for the parent component
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

// 2. DRY Helper Component to standardize dropdown styling
interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    placeholder: string;
    className?: string;
}

const FilterSelect = ({ value, onChange, options, placeholder, className }: FilterSelectProps) => (
    <div className={cn("relative w-full sm:w-auto", className)}>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full sm:w-48 h-10 appearance-none bg-white border border-gray-300 text-gray-700 pl-3 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent cursor-pointer text-sm font-medium transition-all"
        >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
    </div>
);

export default function EmployeeFilters({ filters, onFilterChange }: EmployeeFiltersProps) {

    // 3. Extracted options arrays (these could even be passed as props later if fetched from an API)
    const departments = [
        { label: 'Engineering', value: 'engineering' },
        { label: 'Design', value: 'design' },
        { label: 'HR', value: 'hr' },
        { label: 'Finance', value: 'finance' },
        { label: 'Product', value: 'product' },
    ];

    const roles = [
        { label: 'Frontend Developer', value: 'frontend' },
        { label: 'Backend Developer', value: 'backend' },
        { label: 'UX Designer', value: 'ux' },
        { label: 'QA Engineer', value: 'qa' },
        { label: 'Product Manager', value: 'pm' },
    ];

    const statuses = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
    ];

    return (
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 py-2 animate-in fade-in duration-300">

            {/* Department Filter */}
            <FilterSelect
                value={filters.department}
                onChange={(val) => onFilterChange('department', val)}
                options={departments}
                placeholder="All Departments"
            />

            {/* Role Filter */}
            <FilterSelect
                value={filters.role}
                onChange={(val) => onFilterChange('role', val)}
                options={roles}
                placeholder="All Roles"
            />

            {/* Status Filter */}
            <FilterSelect
                value={filters.status}
                onChange={(val) => onFilterChange('status', val)}
                options={statuses}
                placeholder="All Status"
                className="sm:w-40" // Slightly smaller for status
            />

            {/* Joining Date Filter */}
            <div className="relative w-full sm:w-auto">
                <input
                    type="date"
                    value={filters.joiningDate}
                    onChange={(e) => onFilterChange('joiningDate', e.target.value)}
                    className="w-full sm:w-48 h-10 appearance-none bg-white border border-gray-300 text-gray-600 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent cursor-pointer text-sm font-medium transition-all [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
            </div>

        </div>
    );
}