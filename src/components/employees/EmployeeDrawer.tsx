'use client';

import React, { useEffect } from 'react';
import { X, Mail, Phone, Briefcase, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Data Contract: What the drawer expects from the API/Table
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

// UI Helper Functions (Decoupled from API payload)
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-100 text-blue-700',
        'bg-green-100 text-green-700',
        'bg-purple-100 text-purple-700',
        'bg-orange-100 text-orange-700',
        'bg-pink-100 text-pink-700'
    ];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
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

    // Prevent background scrolling when drawer is open
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

    // Prevent rendering if there's no data
    if (!employee) return null;

    // DRY approach: Grouping details to map over them
    const contactDetails = [
        { label: "Department", value: employee.department, icon: <Briefcase size={18} /> },
        { label: "Email Address", value: employee.email, icon: <Mail size={18} /> },
        { label: "Phone Number", value: employee.phone, icon: <Phone size={18} /> },
        { label: "Joining Date", value: employee.joiningDate, icon: <Calendar size={18} /> },
    ];

    return (
        <>
            {/* Backdrop Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sliding Drawer Panel */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
                role="dialog"
                aria-modal="true"
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Quick Preview</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        aria-label="Close drawer"
                    >
                        <X size={20} />
                    </Button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Profile Header */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold mb-4",
                            getAvatarColor(employee.name)
                        )}>
                            {getInitials(employee.name)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{employee.name}</h3>
                        <p className="text-sm font-medium text-blue-600 mt-1">{employee.role}</p>
                        <div className="mt-3">
                            <Badge variant={getStatusBadgeVariant(employee.status)}>
                                {employee.status}
                            </Badge>
                        </div>
                    </div>

                    {/* Details List */}
                    <div className="space-y-4">
                        {contactDetails.map((detail, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500">
                                    {detail.icon}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">{detail.label}</p>
                                    <p className="text-sm font-semibold text-gray-900">{detail.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Drawer Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <Button
                        variant="primary"
                        onClick={onViewProfile}
                        className="w-full shadow-md shadow-blue-500/20"
                    >
                        View Full Profile
                    </Button>
                </div>
            </div>
        </>
    );
}