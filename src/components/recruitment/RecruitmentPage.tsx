// src/components/recruitment/RecruitmentPage.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { 
    ArrowLeft, 
    Plus, 
    RefreshCw, 
    LayoutDashboard, 
    Briefcase, 
    Users, 
    UserCheck, 
    Calendar, 
    BarChart3, 
    Award 
} from "lucide-react";
import { toast } from "sonner";
import { 
    useRecruitmentJobs, 
    useCreateJob, 
    useUpdateJob, 
    useDeleteJob, 
    useRecruitmentApplicants, 
    useUpdateApplicantStatus, 
    useDeleteApplicant 
} from "@/hooks/api/useRecruitment";
import dynamic from "next/dynamic";

// Static Modal/Form components (Non-tab views)
import JobOpeningForm from "./components/JobOpeningForm";
import JobDetailsModal from "./components/JobDetailsModal";
import CandidateDetailsModal from "./components/CandidateDetailsModal";

// Types
import { JobOpening, Applicant } from "./types";

const TabSkeleton = () => (
    <div className="h-64 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-pulse rounded-2xl flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
    </div>
);

// Lazy loaded tab components
const OverviewTab = dynamic(() => import("./components/OverviewTab"), {
    ssr: false,
    loading: () => <TabSkeleton />
});

const JobOpeningsTab = dynamic(() => import("./components/JobOpeningsTab"), {
    ssr: false,
    loading: () => <TabSkeleton />
});

const ApplicantsTab = dynamic(() => import("./components/ApplicantsTab"), {
    ssr: false,
    loading: () => <TabSkeleton />
});

const ShortlistedTab = dynamic(() => import("./components/ShortlistedTab"), {
    ssr: false,
    loading: () => <TabSkeleton />
});

const InterviewsTab = dynamic(() => import("./components/InterviewsTab"), {
    ssr: false,
    loading: () => <TabSkeleton />
});

const AnalyticsTab = dynamic(() => import("./components/Placeholders").then(m => m.AnalyticsTab), {
    ssr: false,
    loading: () => <TabSkeleton />
});

const HiringDecisionsTab = dynamic(() => import("./components/Placeholders").then(m => m.HiringDecisionsTab), {
    ssr: false,
    loading: () => <TabSkeleton />
});

export default function RecruitmentPage() {
    const { company } = useAppSelector((state) => state.settings);
    
    const { data: dbJobs = [], isLoading: loadingJobs, refetch: refetchJobs } = useRecruitmentJobs();
    const { data: dbApplicants = [], isLoading: loadingApplicants, refetch: refetchApplicants } = useRecruitmentApplicants();

    const createJobMutation = useCreateJob();
    const updateJobMutation = useUpdateJob();
    const deleteJobMutation = useDeleteJob();
    const updateApplicantStatusMutation = useUpdateApplicantStatus();
    const deleteApplicantMutation = useDeleteApplicant();
    
    // Org slug generator
    const organizationSlug = useMemo(() => {
        if (company?.companyName) {
            return company.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        }
        return "macenza";
    }, [company]);

    // State Variables
    const [activeTab, setActiveTab] = useState<"dashboard" | "form">("dashboard");
    const [currentTab, setCurrentTab] = useState<
        "overview" | "jobs" | "applicants" | "shortlisted" | "interviews" | "analytics" | "decisions"
    >("overview");
    const [isEditing, setIsEditing] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    // Dynamic Database Data Mapping
    const jobs = useMemo(() => (dbJobs || []) as unknown as JobOpening[], [dbJobs]);
    const applicants = useMemo(() => (dbApplicants || []) as unknown as Applicant[], [dbApplicants]);

    // Modal states
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [viewingJob, setViewingJob] = useState<JobOpening | null>(null);
    const [openModalDropdown, setOpenModalDropdown] = useState(false);

    const handleUpdateStatusInModal = (status: Applicant['status']) => {
        if (!selectedApplicant) return;
        handleUpdateApplicantStatusDirect(selectedApplicant.id, selectedApplicant.candidateName, status);
        setSelectedApplicant(prev => prev ? { ...prev, status } : null);
        setOpenModalDropdown(false);
    };

    const handleDownloadFile = (base64OrPath: string | undefined, fileName: string) => {
        if (!base64OrPath) {
            toast.error("File content not found.");
            return;
        }
        try {
            const link = document.createElement("a");
            
            let downloadUrl = base64OrPath;
            if (!base64OrPath.startsWith("data:")) {
                // If it is a relative path (e.g. /uploads/...), prepend the backend api origin
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
                const originUrl = apiUrl.replace(/\/api$/, '');
                const cleanPath = base64OrPath.startsWith('/') ? base64OrPath : '/' + base64OrPath;
                downloadUrl = originUrl + cleanPath;
            }
            
            link.href = downloadUrl;
            link.download = fileName;
            link.target = "_blank"; // Open in new tab if needed
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(`Downloading ${fileName}...`);
        } catch (e) {
            console.error("Failed to download file:", e);
            toast.error("Failed to download file.");
        }
    };

    // Clipboard indicator
    const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

    // Dropdown states
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleOutsideClick = () => {
            setOpenDropdownId(null);
        };
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, []);

    const toggleDropdown = (e: React.MouseEvent, applicantId: string) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        setOpenDropdownId(prev => prev === applicantId ? null : applicantId);
    };

    // Loading Check
    const isPageLoading = loadingJobs || loadingApplicants;

    // Scroll to applicants table if hash present
    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash === '#applicants-table') {
            setActiveTab("dashboard");
            setCurrentTab("applicants");
            const element = document.getElementById('applicants-table');
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 200);
            }
        }
    }, [applicants]);

    // Reload lists (to pull applicant updates)
    const handleRefresh = () => {
        refetchJobs();
        refetchApplicants();
        toast.success("Recruitment data updated.");
    };

    // Calculate Dynamic Stats
    const stats = useMemo(() => {
        const openPositions = jobs.filter(j => j.status === "Active").length;
        const totalApplicants = applicants.length;
        const interviews = applicants.filter(a => a.status === "Interview").length;
        const positionsFilled = applicants.filter(a => a.status === "Selected").length;

        return {
            openPositions,
            totalApplicants,
            interviews,
            positionsFilled
        };
    }, [jobs, applicants]);

    // Handle Copy Career URL
    const handleCopyUrl = (jobSlug: string, jobId: string) => {
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/careers/${organizationSlug}/${jobSlug}`;
        navigator.clipboard.writeText(url);
        setCopiedJobId(jobId);
        toast.success("Public Career URL copied!");
        setTimeout(() => setCopiedJobId(null), 2000);
    };

    // Handle Launch Job (make active)
    const handleLaunchJob = async (id: string) => {
        try {
            await updateJobMutation.mutateAsync({ id, jobData: { status: "Active" } });
            toast.success("Job is now active and publicly visible!");
        } catch (e) {
            toast.error("Failed to launch job.");
        }
    };

    // Handle Close Job
    const handleCloseJob = async (id: string) => {
        try {
            await updateJobMutation.mutateAsync({ id, jobData: { status: "Closed" } });
            toast.info("Job status changed to Closed.");
        } catch (e) {
            toast.error("Failed to close job.");
        }
    };

    // Handle Delete Job
    const handleDeleteJob = async (id: string) => {
        if (confirm("Are you sure you want to delete this job opening? This will not delete historical applications.")) {
            try {
                await deleteJobMutation.mutateAsync(id);
                toast.success("Job opening deleted successfully.");
            } catch (e) {
                toast.error("Failed to delete job.");
            }
        }
    };

    // Open Form for creating
    const handleOpenCreateForm = () => {
        setIsEditing(false);
        setSelectedJobId(null);
        setActiveTab("form");
    };

    // Open Form for editing
    const handleOpenEditForm = (job: JobOpening) => {
        setIsEditing(true);
        setSelectedJobId(job.id);
        setActiveTab("form");
    };

    const jobToEdit = useMemo(() => {
        if (isEditing && selectedJobId) {
            return jobs.find(j => j.id === selectedJobId) || null;
        }
        return null;
    }, [isEditing, selectedJobId, jobs]);

    // Handle Save Job (Form Submit)
    const handleSaveJob = async (
        statusType: 'Draft' | 'Active', 
        jobData: Omit<JobOpening, 'id' | 'applicantsCount' | 'createdAt'>
    ) => {
        try {
            if (isEditing && selectedJobId) {
                await updateJobMutation.mutateAsync({ id: selectedJobId, jobData });
                toast.success("Job opening updated successfully.");
            } else {
                await createJobMutation.mutateAsync(jobData);
                toast.success(statusType === "Active" ? "Job launched publicly!" : "Draft job saved successfully.");
            }
            setActiveTab("dashboard");
        } catch (e) {
            toast.error("Failed to save job opening.");
        }
    };

    // Update Applicant Status Direct
    const handleUpdateApplicantStatusDirect = (applicantId: string, candidateName: string, status: Applicant['status']) => {
        // Show success toast immediately for instant feedback
        toast.success(`Updated ${candidateName}'s status to ${status}`);
        
        updateApplicantStatusMutation.mutate(
            { id: applicantId, status },
            {
                onError: (error) => {
                    console.error("Failed to update applicant status:", error);
                    toast.error(`Failed to update ${candidateName}'s status.`);
                }
            }
        );
    };

    // Delete Applicant record
    const handleDeleteApplicant = async (id: string, candidateName: string) => {
        if (confirm(`Remove applicant "${candidateName}" record?`)) {
            try {
                await deleteApplicantMutation.mutateAsync(id);
                toast.success("Applicant record removed.");
            } catch (e) {
                toast.error("Failed to delete applicant record.");
            }
        }
    };

    if (isPageLoading) {
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                            Recruitment Hub
                        </h1>
                        <p className="text-sm text-gray-505 dark:text-gray-400 mt-1.5 font-medium transition-colors">
                            Manage open roles, public career listings, and process candidate applications.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleRefresh}
                            className="p-2.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-55 dark:hover:bg-gray-800 transition-colors flex items-center justify-center shadow-sm"
                            title="Reload Data"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>

                        {activeTab === "dashboard" ? (
                            (currentTab === "overview" || currentTab === "jobs") && (
                                <button
                                    onClick={handleOpenCreateForm}
                                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-md shadow-primary/20 animate-in fade-in zoom-in duration-200"
                                >
                                    <Plus className="w-5 h-5" /> Create Job Opening
                                </button>
                            )
                        ) : (
                            <button
                                onClick={() => setActiveTab("dashboard")}
                                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 hover:bg-gray-55 dark:hover:bg-gray-800 font-bold transition-colors shadow-sm"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                            </button>
                        )}
                    </div>
                </div>

                {/* Navigation Tabs Bar */}
                {activeTab === "dashboard" && (
                    <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-none gap-2 select-none -mx-6 px-6 lg:mx-0 lg:px-0">
                        {[
                            { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
                            { id: "jobs", label: "Job Openings", icon: <Briefcase className="w-4 h-4" /> },
                            { id: "applicants", label: "Applicants", icon: <Users className="w-4 h-4" /> },
                            { id: "shortlisted", label: "Shortlisted", icon: <UserCheck className="w-4 h-4" /> },
                            { id: "interviews", label: "Interviews", icon: <Calendar className="w-4 h-4" /> },
                            { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
                            { id: "decisions", label: "Hiring Decisions", icon: <Award className="w-4 h-4" /> },
                        ].map((tab) => {
                            const isActive = currentTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setCurrentTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-sm whitespace-nowrap transition-all duration-300 relative outline-none
                                        ${isActive 
                                            ? "border-primary text-primary" 
                                            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-250"
                                        }
                                    `}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {activeTab === "dashboard" ? (
                    <div className="w-full min-h-[300px]">
                        {currentTab === "overview" && (
                            <OverviewTab
                                stats={stats}
                                jobs={jobs}
                                organizationSlug={organizationSlug}
                                copiedJobId={copiedJobId}
                                onCopyUrl={handleCopyUrl}
                                onViewJobDetails={setViewingJob}
                                onEditJob={handleOpenEditForm}
                                onLaunchJob={handleLaunchJob}
                                onCloseJob={handleCloseJob}
                                onDeleteJob={handleDeleteJob}
                                applicants={applicants}
                                openDropdownId={openDropdownId}
                                onToggleDropdown={toggleDropdown}
                                onUpdateApplicantStatus={handleUpdateApplicantStatusDirect}
                                onViewApplicant={setSelectedApplicant}
                                onDeleteApplicant={handleDeleteApplicant}
                            />
                        )}
                        {currentTab === "jobs" && (
                            <JobOpeningsTab
                                jobs={jobs}
                                organizationSlug={organizationSlug}
                                copiedJobId={copiedJobId}
                                onCopyUrl={handleCopyUrl}
                                onViewJobDetails={setViewingJob}
                                onEditJob={handleOpenEditForm}
                                onLaunchJob={handleLaunchJob}
                                onCloseJob={handleCloseJob}
                                onDeleteJob={handleDeleteJob}
                            />
                        )}
                        {currentTab === "applicants" && (
                            <ApplicantsTab
                                applicants={applicants}
                                openDropdownId={openDropdownId}
                                onToggleDropdown={toggleDropdown}
                                onUpdateStatus={handleUpdateApplicantStatusDirect}
                                onViewApplication={setSelectedApplicant}
                                onDeleteApplicant={handleDeleteApplicant}
                            />
                        )}
                        {currentTab === "shortlisted" && (
                            <ShortlistedTab 
                                applicants={applicants}
                                onUpdateStatus={handleUpdateApplicantStatusDirect}
                                onViewApplication={setSelectedApplicant}
                            />
                        )}
                        {currentTab === "interviews" && <InterviewsTab jobs={jobs} />}
                        {currentTab === "analytics" && <AnalyticsTab />}
                        {currentTab === "decisions" && <HiringDecisionsTab />}
                    </div>
                ) : (
                    <JobOpeningForm 
                        jobToEdit={jobToEdit}
                        onSave={handleSaveJob}
                        onCancel={() => setActiveTab("dashboard")}
                    />
                )}

                {/* Modals */}
                {viewingJob && (
                    <JobDetailsModal 
                        job={viewingJob}
                        onClose={() => setViewingJob(null)}
                        onCopyUrl={handleCopyUrl}
                    />
                )}

                {selectedApplicant && (
                    <CandidateDetailsModal 
                        applicant={selectedApplicant}
                        openModalDropdown={openModalDropdown}
                        setOpenModalDropdown={setOpenModalDropdown}
                        onUpdateStatus={handleUpdateStatusInModal}
                        onDownloadFile={handleDownloadFile}
                        onClose={() => setSelectedApplicant(null)}
                    />
                )}
            </div>
        </div>
    );
}
