'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks'; 
import Link from 'next/link';
import { Download, Edit, ChevronRight, Menu, X, MoreVertical, Loader2, Camera } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { toast } from 'sonner';

import PersonalInfoTab from '@/components/profile/tabs/PersonalInfoTab';
import EmploymentDetailsTab from '@/components/profile/tabs/EmploymentDetailsTab';
import BankComplianceTab from '@/components/profile/tabs/BankComplianceTab';
import DocumentsTab from '@/components/profile/tabs/DocumentsTab';
import CertificatesTab from '@/components/profile/tabs/CertificatesTab';
import AttendanceTab from '@/components/profile/tabs/AttendanceTab';
import NotesTab from '@/components/profile/tabs/NotesTab';
import EditProfileModal from '@/components/profile/EditProfileModal';
import CropPhotoModal from '@/components/profile/CropPhotoModal';
import { employeeService } from '@/services/employeeService';
import { setCredentials } from '@/store/authSlice';
import { useEffect } from 'react';
import { 
    useEmployeeProfile, 
    useEmployeeAttendanceLogs, 
    useUploadDocument,
    useUploadCertificate,
    useAddNote 
} from '@/hooks/api/useProfile';
import { useDeleteEmployee } from '@/hooks/api/useEmployees';

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
    const { user } = useAppSelector((state) => state.auth);
    
    const role = user?.role?.toLowerCase() || 'employee';
    const isAdminOrHR = role === 'admin' || role === 'hr';
    
    const [activeTab, setActiveTab] = useState<TabId>('personal');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const dispatch = useAppDispatch();
    
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [pendingPhotoSrc, setPendingPhotoSrc] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState(false);
    
    const { data: rawEmployee, isLoading: isProfileLoading, refetch: refreshProfile } = useEmployeeProfile(resolvedEmployeeId);
    
    const employee = rawEmployee?.user || rawEmployee;

    const isCurrentUser = user?._id === employee?._id || user?.id === employee?.id || user?.id === employee?._id;

    useEffect(() => {
        setAvatarError(false);
    }, [employee?.profile?.avatar]);

    useEffect(() => {
        if (employee && isCurrentUser) {
            const updatedUser = {
                ...user,
                name: employee.name,
                role: employee.role,
                profile: employee.profile
            };
            if (JSON.stringify(user?.profile) !== JSON.stringify(employee.profile) || user?.name !== employee.name) {
                localStorage.setItem('user', JSON.stringify(updatedUser));
                dispatch(setCredentials({ user: updatedUser as any }));
            }
        }
    }, [employee, isCurrentUser, dispatch, user]);
    const { data: attendanceData, isLoading: isAttendanceLoading } = useEmployeeAttendanceLogs(
        resolvedEmployeeId, 
        activeTab === 'attendance'
    );

    const uploadDocumentMutation = useUploadDocument(resolvedEmployeeId);
    const uploadCertificateMutation = useUploadCertificate(resolvedEmployeeId);
    const addNoteMutation = useAddNote(resolvedEmployeeId);
    const deleteEmployeeMutation = useDeleteEmployee();

    const handleDeleteEmployee = async () => {
        if (confirm(`WARNING: Are you sure you want to delete the employee "${employee.name}"? This action will archive them into the past employees collection and remove them from current employees.`)) {
            try {
                await deleteEmployeeMutation.mutateAsync(resolvedEmployeeId);
                toast.success('Employee deleted and archived successfully!');
                router.push('/employees');
            } catch (error: any) {
                if (error.response?.data?.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error('Failed to delete employee.');
                }
            }
        }
    };

    const handleUploadDocument = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('document', file);
            await uploadDocumentMutation.mutateAsync(formData);
            toast.success("Document uploaded successfully!");
        } catch (error) {
            toast.error("Failed to upload document. Please try again.");
        }
    };

    const handleUploadCertificate = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('certificate', file);
            const baseTitle = file.name.replace(/\.[^/.]+$/, '');
            formData.append('title', baseTitle);
            formData.append('description', 'Uploaded certificate');
            await uploadCertificateMutation.mutateAsync(formData);
            toast.success("Certificate uploaded successfully!");
        } catch (error: any) {
            if (error.response?.status === 404) {
                toast.error("The certificate upload service is currently unavailable (404). Please contact your administrator.");
            } else {
                toast.error('Failed to upload certificate. Please try again.');
            }
        }
    };

    const handleAddNote = async (text: string) => {
        try {
            await addNoteMutation.mutateAsync(text);
            toast.success("Note added successfully!");
        } catch (error) {
            toast.error("Failed to add note. Please try again.");
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

    // ARCHITECTURAL FIX: Mapped strictly to User.js nested profile schema
    const personal = employee.profile?.personal || {};
    const employment = employee.profile?.employment || {};
    const financial = employee.profile?.financial || {};
    const records = employee.profile?.records || {};

    console.log("🛑 WHAT THE COMPONENT SEES:", employee);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center text-sm font-medium transition-colors">
                <Link href="/employees" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Employees</Link>
                <ChevronRight size={16} className="mx-2 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-900 dark:text-gray-100">{employee.name}</span>
            </div>

            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-300">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative group shrink-0">
                                    {employee.profile?.avatar && !avatarError ? (
                                        <img 
                                            src={employee.profile.avatar.startsWith('http') 
                                                ? employee.profile.avatar 
                                                : `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:4000'}${employee.profile.avatar}?t=${employee.updatedAt ? new Date(employee.updatedAt).getTime() : Date.now()}`
                                            } 
                                            alt={employee.name} 
                                            className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover shadow-inner transition-transform duration-300"
                                            onError={() => {
                                                setAvatarError(true);
                                            }}
                                        />
                                    ) : (
                                        <div className={cn(
                                            "w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold shrink-0 shadow-inner dark:shadow-none transition-colors",
                                            getAvatarColor(employee.name)
                                        )}>
                                            {getInitials(employee.name)}
                                        </div>
                                    )}
                                    
                                    {/* Upload overlay */}
                                    {(isCurrentUser || isAdminOrHR) && (
                                        <label className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 border border-white/20">
                                            <Camera size={18} className="mb-0.5" />
                                            <span className="text-[9px] sm:text-[10px] font-bold text-center px-1">Upload Photo</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                value=""
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = () => {
                                                            setPendingPhotoSrc(reader.result as string);
                                                            setIsCropModalOpen(true);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight transition-colors">
                                            {employee.name}
                                        </h1>
                                        {/* Fallback to isActive boolean if status string isn't provided */}
                                        <Badge variant={employee.isActive ? 'success' : 'error'} className="w-fit scale-90 sm:scale-100">
                                            {employee.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 transition-colors">
                                        {employee.role} · {employment.department || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                                {(isCurrentUser || isAdminOrHR) && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="gap-2 font-bold shadow-sm transition-colors border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    >
                                        <Edit size={16} />
                                        Edit Profile
                                    </Button>
                                )}

                                {isAdminOrHR && !isCurrentUser && !employee.isPast && (
                                    <Button
                                        variant="outline"
                                        onClick={handleDeleteEmployee}
                                        disabled={deleteEmployeeMutation.isPending}
                                        className="border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 gap-2 font-bold shadow-sm transition-colors"
                                    >
                                        {deleteEmployeeMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                                        Delete Employee
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 overflow-hidden min-h-[500px] transition-colors duration-300">
                {/* Mobile Tab Menu Logic... */}
                
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

                <div className="p-4 sm:p-8 bg-white dark:bg-gray-900 transition-colors">
                    {activeTab === 'personal' && (
                        <PersonalInfoTab
                            data={{
                                fullName: employee.name,
                                email: employee.email,
                                phone: personal.phone || '',
                                dob: personal.dob ? new Date(personal.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
                                rawDob: personal.dob,
                                address: personal.address || '',
                                fathersName: personal.fathersName || '',
                                registrationNo: employee.employeeId || 'N/A'
                            }}
                            onScheduleWish={() => toast.success(`Scheduled a wish for ${employee.name}!`)}
                        />
                    )}

                    {activeTab === 'employment' && (
                        <EmploymentDetailsTab
                            data={{
                                employeeId: employee.employeeId,
                                designation: employee.role,
                                department: employment.department || '',
                                reportingManager: typeof employment.reportingManager === 'object' && employment.reportingManager
                                    ? `${employment.reportingManager.name} (${employment.reportingManager.role?.toUpperCase() || ''})`
                                    : (employment.reportingManager || ''),
                                employmentType: employment.employmentType || '',
                                workLocation: employment.workLocation || '',
                                skills: employment.skills || [],
                                dateOfJoining: employment.joiningDate
                                    ? new Date(employment.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                    : ''
                            }}
                            onUpdateSkills={async (newSkills) => {
                                try {
                                    await employeeService.update(resolvedEmployeeId, {
                                        'profile.employment.skills': newSkills
                                    });
                                    toast.success("Skills updated successfully!");
                                    refreshProfile();
                                } catch (error) {
                                    toast.error("Failed to update skills.");
                                    throw error;
                                }
                            }}
                            canEditSkills={isCurrentUser || isAdminOrHR}
                        />
                    )}

                    {activeTab === 'bank' && (
                        <BankComplianceTab
                            employeeId={employee._id || employee.id}
                            currentUserRole={role}
                            bankData={financial.bankDetails}
                            statutoryData={{
                                panNumber: financial.panNumber || '',
                                esicNumber: financial.esicNumber || '',
                                pfNumber: financial.pfNumber || ''
                            }}
                            salaryData={{
                                basicSalary: financial.basicSalary || 0,
                                activeAllowances: financial.activeAllowances || [],
                                activeDeductions: financial.activeDeductions || []
                            }}
                            onRefresh={refreshProfile}
                        />
                    )}

                    {activeTab === 'documents' && (
                        <DocumentsTab
                            documents={records.documents?.map((doc: any) => ({
                                id: doc._id || doc.id,
                                name: doc.name,
                                type: doc.type,
                                sizeInBytes: doc.sizeInBytes,
                                uploadDate: new Date(doc.uploadDate || doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                                fileUrl: doc.fileUrl
                            })) || []}
                            isLoading={isProfileLoading}
                            isUploading={uploadDocumentMutation.isPending}
                            canUploadDocuments={isAdminOrHR}
                            onUpload={isAdminOrHR ? handleUploadDocument : undefined}
                            onActionClick={(id) => console.log(`Open menu for document ${id}`)}
                        />
                    )}

                    {activeTab === 'certificates' && (
                        <CertificatesTab
                            certificates={records.certificates?.map((cert: any) => ({
                                id: cert._id || cert.id,
                                title: cert.title || cert.name || 'Certificate',
                                description: cert.description || cert.type || '',
                                issueDate: cert.issueDate || cert.createdAt
                                    ? new Date(cert.issueDate || cert.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                    : '—',
                                fileUrl: cert.fileUrl || cert.url,
                            })) || []}
                            isLoading={isProfileLoading}
                            canUpload={isAdminOrHR}
                            isUploading={uploadCertificateMutation.isPending}
                            onUpload={isAdminOrHR ? handleUploadCertificate : undefined}
                        />
                    )}

                    {activeTab === 'attendance' && (
                        <AttendanceTab
                            stats={attendanceData?.stats}
                            logs={attendanceData?.logs || []}
                            isLoading={isAttendanceLoading}
                        />
                    )}

                    {activeTab === 'notes' && (
                        <NotesTab
                            notes={records.notes?.map((note: any) => ({
                                id: note._id || note.id,
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

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={refreshProfile}
                employee={employee}
                isAdminOrHR={isAdminOrHR}
            />

            {/* Crop Photo Modal */}
            <CropPhotoModal
                isOpen={isCropModalOpen}
                imageSrc={pendingPhotoSrc}
                onClose={() => {
                    setIsCropModalOpen(false);
                    setPendingPhotoSrc(null);
                }}
                onCropSave={async (croppedFile) => {
                    const formData = new FormData();
                    formData.append('photo', croppedFile);
                    try {
                        await employeeService.uploadPhoto(resolvedEmployeeId, formData);
                        toast.success("Profile photo updated successfully!");
                        setAvatarError(false);
                        refreshProfile();
                    } catch (error) {
                        toast.error("Failed to upload cropped profile photo.");
                        throw error;
                    }
                }}
            />
        </div>
    );
}