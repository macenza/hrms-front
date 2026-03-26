'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Download, Edit, Briefcase, ChevronRight,
    Menu, X, MoreVertical
} from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

// Tab Components (Imports remain the same...)
import PersonalInfoTab from '@/components/profile/tabs/PersonalInfoTab';
import EmploymentDetailsTab from '@/components/profile/tabs/EmploymentDetailsTab';
import BankComplianceTab from '@/components/profile/tabs/BankComplianceTab';
import DocumentsTab from '@/components/profile/tabs/DocumentsTab';
import CertificatesTab from '@/components/profile/tabs/CertificatesTab';
import AttendanceTab from '@/components/profile/tabs/AttendanceTab';
import NotesTab from '@/components/profile/tabs/NotesTab';

const profileTabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'employment', label: 'Employment Details' },
    { id: 'bank', label: 'Bank & Compliance' },
    { id: 'documents', label: 'Documents' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'notes', label: 'Notes' },
] as const;

type TabId = typeof profileTabs[number]['id'];

export default function EmployeeProfilePage() {
    const params = useParams();
    const router = useRouter();
    const employeeIdParam = params.id as string;

    const [activeTab, setActiveTab] = useState<TabId>('personal');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Mock data
    const employee = {
        id: employeeIdParam || 'EMP-001',
        name: 'Alice Johnson',
        role: 'Senior UX Designer',
        department: 'Design',
        status: 'Active' as const,
    };

    const currentTabLabel = profileTabs.find(t => t.id === activeTab)?.label;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* 1. Breadcrumb - Hidden on very small screens to save vertical space */}
            <div className="hidden sm:flex items-center text-sm text-gray-500 font-medium">
                <Link href="/employees" className="hover:text-blue-600 transition-colors">Employees</Link>
                <ChevronRight size={16} className="mx-2 text-gray-400" />
                <span className="text-gray-900">{employee.name}</span>
            </div>

            {/* 2. Responsive Header Card */}
            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                {/* Avatar scales down on mobile */}
                                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0 shadow-inner">
                                    AJ
                                </div>
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                                            {employee.name}
                                        </h1>
                                        <Badge variant="success" className="w-fit scale-90 sm:scale-100">
                                            {employee.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                                        {employee.role} · {employee.department}
                                    </p>
                                </div>
                            </div>

                            {/* Mobile Quick Action Dropdown (Optional) or simpler Buttons */}
                            <div className="sm:hidden">
                                <Button variant="ghost" size="sm" className="p-2">
                                    <MoreVertical size={20} className="text-gray-400" />
                                </Button>
                            </div>
                        </div>

                        {/* Header Actions - Stacked on mobile, side-by-side on desktop */}
                        <div className="flex gap-2 sm:gap-3 border-t sm:border-t-0 pt-4 sm:pt-0">
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 h-10">
                                <Download size={16} />
                                <span className="text-xs sm:text-sm">Download</span>
                            </Button>
                            <Button variant="primary" size="sm" className="flex-1 sm:flex-none gap-2 h-10 shadow-blue-500/20">
                                <Edit size={16} />
                                <span className="text-xs sm:text-sm">Edit Profile</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Tab Navigation - Sticky Mobile Selector + Desktop Horizontal List */}
            <Card className="border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                {/* Mobile Tab Trigger */}
                <div className="lg:hidden p-4 border-b border-gray-100 bg-gray-50/50">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-bold text-gray-700"
                    >
                        <div className="flex items-center gap-2">
                            <Menu size={18} className="text-blue-600" />
                            <span>{currentTabLabel}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 rotate-90" />
                    </button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex overflow-x-auto hide-scrollbar border-b border-gray-100 bg-white">
                    {profileTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabId)}
                            className={cn(
                                "whitespace-nowrap px-6 py-4 text-sm font-bold transition-all border-b-2",
                                activeTab === tab.id
                                    ? "border-blue-600 text-blue-600 bg-blue-50/30"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-4 sm:p-8 bg-white">
                    {activeTab === 'personal' && <PersonalInfoTab />}
                    {activeTab === 'employment' && <EmploymentDetailsTab />}
                    {activeTab === 'bank' && <BankComplianceTab />}
                    {activeTab === 'documents' && <DocumentsTab />}
                    {activeTab === 'certificates' && <CertificatesTab />}
                    {activeTab === 'attendance' && <AttendanceTab />}
                    {activeTab === 'notes' && <NotesTab />}
                </div>
            </Card>

            {/* 4. Mobile Navigation Drawer (Overlay) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">Profile Sections</h2>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-2 overflow-y-auto">
                            {profileTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as TabId);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all mb-1",
                                        activeTab === tab.id ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}