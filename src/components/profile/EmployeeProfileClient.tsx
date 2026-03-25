'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Download, Edit, Briefcase, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import PersonalInfoTab from '@/components/profile/tabs/PersonalInfoTab';
import BankComplianceTab from '@/components/profile/tabs/BankComplianceTab';
import EmploymentDetailsTab from '@/components/profile/tabs/EmploymentDetailsTab';
import DocumentsTab from '@/components/profile/tabs/DocumentsTab';
import CertificatesTab from '@/components/profile/tabs/CertificatesTab';
import AttendanceTab from '@/components/profile/tabs/AttendanceTab';
import NotesTab from '@/components/profile/tabs/NotesTab';

// The tabs exactly as they appear in your MACENZA design
const profileTabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'employment', label: 'Employment Details' },
    { id: 'bank', label: 'Bank & Compliance' },
    { id: 'documents', label: 'Documents' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'notes', label: 'Notes' },
];

export default function EmployeeProfilePage() {
    // Automatically grabs the [id] from the URL (e.g., 'EMP001')
    const params = useParams();
    const employeeId = params.id as string;

    // Manage which tab is currently active
    const [activeTab, setActiveTab] = useState('personal');

    // Mock data for the header - you will replace this with a real API fetch later
    const employee = {
        name: 'Alice Johnson',
        role: 'UX Designer',
        department: 'Design',
        status: 'Active',
        avatarColor: 'bg-blue-100 text-blue-600',
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center text-sm text-gray-500 font-medium">
                <Link href="/employees" className="hover:text-[#4F7CF3] transition-colors">Employees</Link>
                <ChevronRight size={16} className="mx-2" />
                <span className="text-gray-900">{employee.name}</span>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${employee.avatarColor}`}>
                        {getInitials(employee.name)}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
                            <span className={clsx(
                                "px-3 py-1 rounded-full text-xs font-bold",
                                employee.status === 'Active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            )}>
                                {employee.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-1.5">
                                <Briefcase size={16} />
                                {employee.role} · {employee.department}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 text-xs">
                                ID: {employeeId}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Download size={16} />
                        <span className="hidden sm:inline">Download Profile</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-medium hover:bg-[#3A62D7] transition-colors shadow-sm shadow-blue-500/30">
                        <Edit size={16} />
                        <span className="hidden sm:inline">Edit Profile</span>
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100">
                    {profileTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "whitespace-nowrap px-6 py-4 text-sm font-semibold transition-colors border-b-2",
                                activeTab === tab.id
                                    ? "border-[#4F7CF3] text-[#4F7CF3]"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content Area */}
                <div className="p-6">
                    {activeTab === 'personal' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Details</h2>
                            {/* You will plug your PersonalInfo.tsx component here */}
                            <p className="text-gray-500">Personal information form goes here...</p>
                        </div>
                    )}

                    {activeTab === 'employment' && (
                        <div className="animate-in fade-in duration-300">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Employment Information</h2>
                            {/* You will plug your EmploymentDetails.tsx component here */}
                            <p className="text-gray-500">Employment details go here...</p>
                        </div>
                    )}

                    {/* Add remaining conditional renders for the other tabs as you build them */}
                    <div className="p-6">
                        {activeTab === 'personal' && <PersonalInfoTab />}
                        {activeTab === 'employment' && <EmploymentDetailsTab />}
                        {activeTab === 'bank' && <BankComplianceTab />}
                        {activeTab === 'documents' && <DocumentsTab />}
                        {activeTab === 'certificates' && <CertificatesTab />}
                        {activeTab === 'attendance' && <AttendanceTab />}
                        {activeTab === 'notes' && <NotesTab />}
                    </div>
                </div>
            </div>
        </div>
    );
}