'use client';

import React from 'react';
import { Briefcase, MapPin, User, Calendar, Hash, Tag, Plus } from 'lucide-react';

export default function EmploymentDetailsTab() {
    const skills = ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'HTML/CSS', 'Agile'];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Employment Information */}
            <div className="lg:col-span-2 bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Briefcase size={20} className="text-[#4F7CF3]" />
                    Employment Information
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Employee ID</p>
                        <p className="font-medium text-gray-900 flex items-center gap-2"><Hash size={16} className="text-gray-400"/> EMP-001</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Designation</p>
                        <p className="font-medium text-gray-900 flex items-center gap-2"><Tag size={16} className="text-gray-400"/> Senior UX Designer</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reporting Manager</p>
                        <p className="font-medium text-gray-900 flex items-center gap-2"><User size={16} className="text-gray-400"/> Sarah Connor</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date of Joining</p>
                        <p className="font-medium text-gray-900 flex items-center gap-2"><Calendar size={16} className="text-gray-400"/> Jan 12, 2023</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Department</p>
                        <p className="font-medium text-gray-900">Design</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Employment Type</p>
                        <p className="font-medium text-gray-900">Permanent</p>
                    </div>
                    <div className="sm:col-span-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Work Location</p>
                        <p className="font-medium text-gray-900 flex items-center gap-2"><MapPin size={16} className="text-red-400"/> HQ - San Francisco</p>
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Skills</h2>
                    <button className="text-[#4F7CF3] hover:bg-blue-50 p-1 rounded transition-colors">
                        <Plus size={20} />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-sm">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}