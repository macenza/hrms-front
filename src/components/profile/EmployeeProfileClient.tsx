'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks'; 
import Link from 'next/link';
import { Download, Edit, ChevronRight, Menu, X, MoreVertical, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

import PersonalInfoTab from '@/components/profile/tabs/PersonalInfoTab';
import EmploymentDetailsTab from '@/components/profile/tabs/EmploymentDetailsTab';
import BankComplianceTab from '@/components/profile/tabs/BankComplianceTab';
import DocumentsTab from '@/components/profile/tabs/DocumentsTab';
import CertificatesTab from '@/components/profile/tabs/CertificatesTab';
import AttendanceTab from '@/components/profile/tabs/AttendanceTab';
import NotesTab from '@/components/profile/tabs/NotesTab';

import { 
    useEmployeeProfile, 
    useEmployeeAttendanceLogs, 
    useUploadDocument, 
    useAddNote 
} from '@/hooks/api/useProfile';

const profileTabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'employment', label: 'Employment Details' },
    { id: 'bank', label: 'Bank & Compliance' },
    { id: 'documents', label: 'Documents' },
    { id: 'certificates', label: 'Certificates' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'notes', label: 'Notes', adminOnly: true },
] as const;

type TabId = typeof profileTabs[number]['id'];

interface EmployeeProfileClientProps {
    id?: string;
}

// Universal system avatar color generator
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

const getInitials = (name: string) => name ? name.split(' ').map((part) => part[0]).join('').substring(0, 2).toUpperCase() : '??';

export default function EmployeeProfileClient({ id }: EmployeeProfileClientProps) {
    const params = useParams();
    const router = useRouter();
    const resolvedEmployeeId = id || (params.id as string);
    
    // RBAC Control
    const { user } = useAppSelector((state) => state.auth);
    const currentUserRole = user?.role || 'Employee';
    const isAdminOrHR = ['Admin', 'HR'].includes(currentUserRole);
    
    // Local State
    const [activeTab, setActiveTab] = useState<TabId>('personal');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // React Query Data Layer
    const { data: employee, isLoading: isProfileLoading, refetch: refreshProfile } = useEmployeeProfile(resolvedEmployeeId);
    
    const { data: attendanceData, isLoading: isAttendanceLoading } = useEmployeeAttendanceLogs(
        resolvedEmployeeId, 
        activeTab === 'attendance' // Only fetch attendance if the tab is clicked
    );

    const uploadDocumentMutation = useUploadDocument(resolvedEmployeeId);
    const addNoteMutation = useAddNote(resolvedEmployeeId);

    const handleUploadDocument = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('document', file);
            await uploadDocumentMutation.mutateAsync(formData);
        } catch (error) {
            alert("Failed to upload document. Please try again.");
        }
    };

    const handleAddNote = async (text: string) => {
        try {
            await addNoteMutation.mutateAsync(text);
        } catch (error) {
            alert("Failed to add note. Please try again.");
        }
    };

    const visibleTabs = profileTabs.filter(tab => {
        if ('adminOnly' in tab && tab.adminOnly && !isAdminOrHR) return false;
        return true;
    });

    const currentTabLabel = visibleTabs.find((tab) => tab.id === activeTab)?.label ?? 'Profile Sections';

    if (isProfileLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-500" />
            </div>
        );
    }

    if (!employee) {
        return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Employee not found</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center text-sm font-medium transition-colors">
                <Link href="/employees" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Employees</Link>
                <ChevronRight size={16} className="mx-2 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-900 dark:text-gray-100">{employee.name}</span>
            </div>

            {/* Profile Header Card */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-300">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0 shadow-inner dark:shadow-none transition-colors",
                                    getAvatarColor(employee.name)
                                )}>
                                    {getInitials(employee.name)}
                                </div>
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight transition-colors">
                                            {employee.name}
                                        </h1>
                                        <Badge variant={employee.status === 'Active' ? 'success' : 'error'} className="w-fit scale-90 sm:scale-100">
                                            {employee.status}
                                        </Badge>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 transition-colors">
                                        {employee.role} · {employee.department}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="sm:hidden">
                                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <MoreVertical size={20} className="text-gray-400 dark:text-gray-500" />
                                </Button>
                            </div>
                        </div>
                        
                        {/* Profile Header Actions */}
                        <div className="flex gap-2 sm:gap-3 border-t border-gray-100 dark:border-gray-800 sm:border-t-0 pt-4 sm:pt-0 transition-colors">
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <Download size={16} />
                                <span className="text-xs sm:text-sm">Download Profile</span>
                            </Button>
                            <Button variant="primary" size="sm" className="flex-1 sm:flex-none gap-2 h-10 shadow-sm shadow-blue-500/25 dark:shadow-none">
                                <Edit size={16} />
                                <span className="text-xs sm:text-sm">Edit Profile</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content Tabs Section */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 overflow-hidden min-h-[500px] transition-colors duration-300">
                
                {/* Mobile Tab Dropdown */}
                <div className="lg:hidden p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 transition-colors">
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)} 
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Menu size={18} className="text-blue-600 dark:text-blue-400" />
                            <span>{currentTabLabel}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 dark:text-gray-500 rotate-90" />
                    </button>
                </div>

                {/* Desktop Tab Navigation */}
                <div className="hidden lg:flex overflow-x-auto hide-scrollbar border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors">
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabId)}
                            className={cn(
                                "whitespace-nowrap px-6 py-4 text-sm font-bold transition-all border-b-2",
                                activeTab === tab.id 
                                    ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10" 
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content Body */}
                <div className="p-4 sm:p-8 bg-white dark:bg-gray-900 transition-colors">
                    {activeTab === 'personal' && (
                        <PersonalInfoTab
                            data={{
                                fullName: employee.name,
                                email: employee.email,
                                phone: employee.profile?.phone || '',
                                dob: employee.profile?.dob ? new Date(employee.profile.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
                                rawDob: employee.profile?.dob,
                                address: employee.profile?.address || '',
                                fathersName: employee.profile?.fathersName || '',
                                registrationNo: employee.employeeId || 'N/A'
                            }}
                            onScheduleWish={() => alert(`Scheduled a wish for ${employee.name}!`)}
                        />
                    )}
                    {activeTab === 'bank' && (
                        <BankComplianceTab
                            employeeId={employee.id}
                            currentUserRole={currentUserRole}
                            bankData={employee.profile?.bankDetails}
                            statutoryData={employee.profile?.statutoryDetails}
                            onRefresh={refreshProfile}
                        />
                    )}
                    {activeTab === 'attendance' && (
                        <AttendanceTab
                            stats={attendanceData?.stats}
                            logs={attendanceData?.logs || []}
                            isLoading={isAttendanceLoading}
                        />
                    )}
                    {activeTab === 'employment' && (
                        <EmploymentDetailsTab
                            data={{
                                employeeId: employee.empId,
                                designation: employee.role,
                                department: employee.department,
                                reportingManager: employee.profile?.reportingManager || '',
                                employmentType: employee.profile?.employmentType || '',
                                workLocation: employee.profile?.workLocation || '',
                                skills: employee.profile?.skills || [],
                                dateOfJoining: employee.profile?.joiningDate
                                    ? new Date(employee.profile.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                    : ''
                            }}
                            onAddSkill={() => alert("Add skill functionality coming soon!")}
                        />
                    )}
                    {activeTab === 'certificates' && (
                        <CertificatesTab
                            certificates={employee.profile?.certificates?.map((cert: any) => ({
                                id: cert._id,
                                title: cert.title,
                                description: cert.description,
                                issueDate: new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                                fileUrl: cert.fileUrl
                            })) || []}
                            isLoading={isProfileLoading}
                            onGenerate={() => alert("Generate certificate modal opening...")}
                            onPreview={(id) => alert(`Previewing certificate ${id}`)}
                            onDownload={(id) => alert(`Downloading certificate ${id}`)}
                        />
                    )}
                    {activeTab === 'documents' && (
                        <DocumentsTab
                            documents={employee.profile?.documents?.map((doc: any) => ({
                                id: doc._id,
                                name: doc.name,
                                type: doc.type,
                                sizeInBytes: doc.sizeInBytes,
                                uploadDate: new Date(doc.uploadDate || doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                fileUrl: doc.fileUrl
                            })) || []}
                            isLoading={isProfileLoading}
                            isUploading={uploadDocumentMutation.isPending}
                            onUpload={handleUploadDocument}
                            onActionClick={(id) => console.log(`Open menu for document ${id}`)}
                        />
                    )}
                    {activeTab === 'notes' && (
                        <NotesTab
                            notes={employee.profile?.notes?.map((note: any) => ({
                                id: note._id,
                                text: note.text,
                                authorName: note.authorName,
                                authorRole: note.authorRole,
                                createdAt: new Date(note.createdAt).toLocaleString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })
                            })) || []}
                            isLoading={isProfileLoading}
                            onAddNote={handleAddNote}
                        />
                    )}
                </div>
            </Card>

            {/* Mobile Sliding Menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div 
                        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                    />
                    <div className="absolute right-0 top-0 h-full w-[280px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col transition-colors">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between transition-colors">
                            <h2 className="font-bold text-gray-900 dark:text-gray-100 transition-colors">Profile Sections</h2>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)} 
                                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-2 overflow-y-auto">
                            {visibleTabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id as TabId);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold transition-all mb-1",
                                        activeTab === tab.id 
                                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
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