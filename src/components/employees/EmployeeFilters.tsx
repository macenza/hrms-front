'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function EmployeeFilters() {
    return (
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 py-2">
            {/* Department Filter */}
            <div className="relative w-full sm:w-auto">
                <select className="w-full sm:w-48 appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] cursor-pointer text-sm font-medium transition-all">
                    <option value="">All Departments</option>
                    <option value="engineering">Engineering</option>
                    <option value="design">Design</option>
                    <option value="hr">HR</option>
                    <option value="finance">Finance</option>
                    <option value="product">Product</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Role Filter */}
            <div className="relative w-full sm:w-auto">
                <select className="w-full sm:w-48 appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] cursor-pointer text-sm font-medium transition-all">
                    <option value="">All Roles</option>
                    <option value="frontend">Frontend Developer</option>
                    <option value="backend">Backend Developer</option>
                    <option value="ux">UX Designer</option>
                    <option value="qa">QA Engineer</option>
                    <option value="pm">Product Manager</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-auto">
                <select className="w-full sm:w-40 appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] cursor-pointer text-sm font-medium transition-all">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>

            {/* Joining Date Filter */}
            <div className="relative w-full sm:w-auto">
                <input 
                    type="date" 
                    className="w-full sm:w-48 appearance-none bg-white border border-gray-200 text-gray-500 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] cursor-pointer text-sm font-medium transition-all [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
            </div>
        </div>
    );
}