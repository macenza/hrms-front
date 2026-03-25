'use client';

import React from 'react';
import { X, Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import clsx from 'clsx';
import type { Employee } from './EmployeeTable'; // Importing the type we made earlier

interface EmployeeDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    employee: Employee | null;
    onViewProfile: () => void;
}

export default function EmployeeDrawer({ isOpen, onClose, employee, onViewProfile }: EmployeeDrawerProps) {
    // Prevent rendering errors if no employee is selected yet
    if (!employee && isOpen) return null;

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <>
            {/* Backdrop Overlay */}
            <div 
                className={clsx(
                    "fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sliding Drawer Panel */}
            <div 
                className={clsx(
                    "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Quick Preview</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Drawer Content */}
                {employee && (
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Profile Header */}
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold mb-4 ${employee.avatarColor}`}>
                                {getInitials(employee.name)}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{employee.name}</h3>
                            <p className="text-sm font-medium text-[#4F7CF3] mt-1">{employee.role}</p>
                            <span className={clsx(
                                "mt-3 px-3 py-1 rounded-full text-xs font-medium",
                                employee.status === 'Active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                                {employee.status}
                            </span>
                        </div>

                        {/* Details List */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500"><Briefcase size={18} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Department</p>
                                    <p className="text-sm font-semibold text-gray-900">{employee.department}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500"><Mail size={18} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Email Address</p>
                                    <p className="text-sm font-semibold text-gray-900">{employee.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500"><Phone size={18} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                                    <p className="text-sm font-semibold text-gray-900">{employee.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500"><Calendar size={18} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Joining Date</p>
                                    <p className="text-sm font-semibold text-gray-900">{employee.joiningDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Drawer Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button 
                        onClick={onViewProfile}
                        className="w-full py-3 bg-[#4F7CF3] text-white rounded-xl text-sm font-bold hover:bg-[#3A62D7] transition-colors shadow-md shadow-blue-500/20"
                    >
                        View Full Profile
                    </button>
                </div>
            </div>
        </>
    );
}