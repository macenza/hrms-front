// src/components/employees/EmployeeDrawer.tsx
'use client';

import React, { useEffect } from 'react';
import { X, Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave';

export interface EmployeeDrawerData {
    id: string;
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    joiningDate: string;
    status: EmployeeStatus;
}

interface EmployeeDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    employee: EmployeeDrawerData | null;
    onViewProfile: () => void;
}

// UI Helpers
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

// Optimized to match the exact hash logic and colors of the EmployeeTable for visual consistency
const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    const colors = [
        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
        'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
        'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

const getStatusBadgeVariant = (status: EmployeeStatus) => {
    switch (status) {
        case 'Active': return 'success';
        case 'On Leave': return 'warning';
        case 'Inactive': return 'error';
        default: return 'default';
    }
};

export default function EmployeeDrawer({ isOpen, onClose, employee, onViewProfile }: EmployeeDrawerProps) {
    
    // Performance & Accessibility: Lock background scrolling only when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // Parent component uses a 300ms timeout before setting employee to null.
    // This allows the drawer to slide out gracefully without crashing or losing data mid-animation.
    if (!employee) return null;

    const contactDetails = [
        { label: "Department", value: employee.department, icon: <Briefcase size={18} /> },
        { label: "Email Address", value: employee.email, icon: <Mail size={18} /> },
        { label: "Phone Number", value: employee.phone, icon: <Phone size={18} /> },
        { label: "Joining Date", value: employee.joiningDate, icon: <Calendar size={18} /> },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
                aria-hidden="true"
            />
            
            {/* Drawer Panel */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-900 border-l border-transparent dark:border-gray-800 shadow-2xl dark:shadow-none z-50 flex flex-col transition-all duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 transition-colors">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Quick Preview</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full p-0 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close drawer"
                    >
                        <X size={20} />
                    </Button>
                </div>
                
                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                    
                    {/* Profile Summary */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-sm dark:shadow-none ring-4 ring-white dark:ring-gray-900",
                            getAvatarColor(employee.name)
                        )}>
                            {getInitials(employee.name)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors">{employee.name}</h3>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1 transition-colors">{employee.role}</p>
                        <div className="mt-3">
                            <Badge variant={getStatusBadgeVariant(employee.status)}>
                                {employee.status}
                            </Badge>
                        </div>
                    </div>
                    
                    {/* Details List */}
                    <div className="space-y-4">
                        {contactDetails.map((detail, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-all group">
                                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-none text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {detail.icon}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors">{detail.label}</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">{detail.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 transition-colors">
                    <Button
                        variant="primary"
                        onClick={onViewProfile}
                        className="w-full shadow-md shadow-blue-500/20 dark:shadow-none font-semibold"
                    >
                        View Full Profile
                    </Button>
                </div>
            </div>
        </>
    );
}