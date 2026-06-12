// src/app/(hrms)/recruitment/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { 
    Briefcase, Users, Calendar, Award, Plus, Search, 
    Eye, Edit2, Play, Trash2, X, FileText, CheckCircle, 
    ArrowLeft, ChevronRight, Copy, Check, ExternalLink, RefreshCw,
    ChevronDown, Mail, Phone, MapPin, User, GraduationCap, Coins, Clock, Building
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { 
    useRecruitmentJobs, 
    useCreateJob, 
    useUpdateJob, 
    useDeleteJob, 
    useRecruitmentApplicants, 
    useUpdateApplicantStatus, 
    useDeleteApplicant 
} from "@/hooks/api/useRecruitment";

// Interfaces
interface ScreeningQuestion {
    id: string;
    questionText: string;
    isOptional: boolean;
}

interface ScreeningAnswer {
    questionId: string;
    questionText: string;
    answer: string;
}

interface JobOpening {
    id: string;
    title: string;
    department: string;
    employmentType: string;
    openings: number;
    experienceRequired: string;
    location: string;
    description: string;
    status: 'Draft' | 'Active' | 'Closed';
    slug: string;
    applicantsCount: number;
    createdAt: string;
    workMode: 'On-site' | 'Hybrid' | 'Remote';
    salaryRange: string;
    deadline: string;
    screeningQuestions?: ScreeningQuestion[];
}

interface Applicant {
    id: string;
    jobId: string;
    jobTitle: string;
    candidateName: string;
    email: string;
    phone: string;
    appliedDate: string;
    status: 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
    resumeName: string;
    resumeData?: string;
    notes?: string;
    currentLocation: string;
    highestQualification: string;
    yearsOfExperience: number;
    availableStartDate: string;
    portfolioUrl?: string;
    gitHubProfile?: string;
    linkedInProfile?: string;
    currentCompany?: string;
    currentCtc?: string;
    expectedCtc?: string;
    noticePeriod?: string;
    coverLetterName?: string;
    coverLetterData?: string;
    screeningAnswers?: ScreeningAnswer[];
}

// Initial mock data to seed localStorage
const INITIAL_JOBS: JobOpening[] = [
    {
        id: "job-1",
        title: "Frontend Developer",
        department: "Engineering",
        employmentType: "Full-time",
        openings: 2,
        experienceRequired: "2-4 years",
        location: "Mumbai, India (Hybrid)",
        description: "We are looking for a skilled React/Next.js developer to build sleek, state-of-the-art interactive dashboards and client-facing web applications. You should be expert in Tailwind CSS, TypeScript, and state management systems like Redux.",
        status: "Active",
        slug: "frontend-developer",
        applicantsCount: 3,
        createdAt: "2026-06-01T10:00:00.000Z",
        workMode: "Hybrid",
        salaryRange: "₹8,00,000 - ₹12,00,000 P.A.",
        deadline: "2026-07-15",
        screeningQuestions: [
            { id: "q-1", questionText: "How many years of professional experience do you have with React/Next.js?", isOptional: false },
            { id: "q-2", questionText: "Link to your top React project or GitHub repository.", isOptional: true }
        ]
    },
    {
        id: "job-2",
        title: "Backend Engineer",
        department: "Engineering",
        employmentType: "Full-time",
        openings: 1,
        experienceRequired: "3-5 years",
        location: "Remote (India)",
        description: "Join our core platform team to develop robust backend services and APIs using Node.js, Express, and MongoDB. Experience in database optimization, multi-tenant architectures, and microservices is highly required.",
        status: "Active",
        slug: "backend-engineer",
        applicantsCount: 2,
        createdAt: "2026-06-03T11:30:00.000Z",
        workMode: "Remote",
        salaryRange: "₹10,00,000 - ₹16,00,000 P.A.",
        deadline: "2026-07-20",
        screeningQuestions: [
            { id: "q-3", questionText: "Have you ever optimized MongoDB queries at scale? Explain briefly.", isOptional: false }
        ]
    },
    {
        id: "job-3",
        title: "Product Designer",
        department: "Design",
        employmentType: "Contract",
        openings: 1,
        experienceRequired: "2+ years",
        location: "Delhi, India (Onsite)",
        description: "Looking for a creative UI/UX designer to craft modern, user-centric interfaces. Must be proficient in Figma, high-fidelity prototyping, design systems, and conducting user interviews.",
        status: "Draft",
        slug: "product-designer",
        applicantsCount: 0,
        createdAt: "2026-06-08T09:00:00.000Z",
        workMode: "On-site",
        salaryRange: "₹6,00,000 - ₹9,00,000 P.A.",
        deadline: "2026-07-10",
        screeningQuestions: []
    },
    {
        id: "job-4",
        title: "HR Specialist",
        department: "Human Resources",
        employmentType: "Full-time",
        openings: 1,
        experienceRequired: "1-3 years",
        location: "Mumbai, India (Onsite)",
        description: "Seeking an enthusiastic HR Specialist to manage end-to-end recruitment pipelines, onboarding workflows, and support employee relations initiatives across the workspace.",
        status: "Closed",
        slug: "hr-specialist",
        applicantsCount: 1,
        createdAt: "2026-05-15T08:15:00.000Z",
        workMode: "On-site",
        salaryRange: "₹5,00,000 - ₹7,00,000 P.A.",
        deadline: "2026-06-05",
        screeningQuestions: []
    }
];

const INITIAL_APPLICANTS: Applicant[] = [
    {
        id: "app-1",
        jobId: "job-1",
        jobTitle: "Frontend Developer",
        candidateName: "Jane Doe",
        email: "jane.doe@example.com",
        phone: "+91 98765 43210",
        appliedDate: "2026-06-02T14:20:00.000Z",
        status: "Shortlisted",
        resumeName: "jane_doe_resume.pdf",
        notes: "Highly qualified candidate. Excellent styling skills and strong portfolio with live Next.js examples.",
        currentLocation: "Mumbai, India",
        highestQualification: "B.Tech in Computer Science",
        yearsOfExperience: 3,
        availableStartDate: "2026-07-01",
        portfolioUrl: "https://janedoe.dev",
        gitHubProfile: "https://github.com/janedoe",
        linkedInProfile: "https://linkedin.com/in/janedoe",
        currentCompany: "Accenture Technologies",
        currentCtc: "₹6,50,000 P.A.",
        expectedCtc: "₹9,80,000 P.A.",
        noticePeriod: "30 Days",
        coverLetterName: "jane_doe_cover_letter.pdf",
        screeningAnswers: [
            { questionId: "q-1", questionText: "How many years of professional experience do you have with React/Next.js?", answer: "3 years of professional experience building corporate dashboards." },
            { questionId: "q-2", questionText: "Link to your top React project or GitHub repository.", answer: "https://github.com/janedoe/nextjs-premium-dashboard" }
        ]
    },
    {
        id: "app-2",
        jobId: "job-1",
        jobTitle: "Frontend Developer",
        candidateName: "Aarav Sharma",
        email: "aarav.sharma@example.com",
        phone: "+91 99988 77766",
        appliedDate: "2026-06-04T09:10:00.000Z",
        status: "Applied",
        resumeName: "aarav_sharma_cv.pdf",
        notes: "Fresh graduate but has completed a solid 6-month internship with React projects.",
        currentLocation: "Pune, India",
        highestQualification: "B.E. in Information Technology",
        yearsOfExperience: 0,
        availableStartDate: "2026-06-15",
        portfolioUrl: "",
        gitHubProfile: "https://github.com/aaravsharma",
        linkedInProfile: "https://linkedin.com/in/aaravsharma",
        currentCompany: "",
        currentCtc: "",
        expectedCtc: "₹5,00,000 P.A.",
        noticePeriod: "",
        coverLetterName: "",
        screeningAnswers: [
            { questionId: "q-1", questionText: "How many years of professional experience do you have with React/Next.js?", answer: "0 years professionally, but have completed multiple academic and internship projects." },
            { questionId: "q-2", questionText: "Link to your top React project or GitHub repository.", answer: "https://github.com/aaravsharma/internship-react-app" }
        ]
    },
    {
        id: "app-3",
        jobId: "job-2",
        jobTitle: "Backend Engineer",
        candidateName: "John Smith",
        email: "john.smith@example.com",
        phone: "+91 98888 11122",
        appliedDate: "2026-06-05T16:45:00.000Z",
        status: "Interview",
        resumeName: "john_smith_backend.pdf",
        notes: "First technical round scheduled for tomorrow at 2:00 PM. Good MongoDB aggregation knowledge.",
        currentLocation: "Bengaluru, India",
        highestQualification: "Master of Computer Applications (MCA)",
        yearsOfExperience: 4,
        availableStartDate: "2026-07-15",
        portfolioUrl: "",
        gitHubProfile: "https://github.com/johnsmith",
        linkedInProfile: "https://linkedin.com/in/johnsmith",
        currentCompany: "TCS",
        currentCtc: "₹7,20,000 P.A.",
        expectedCtc: "₹11,00,000 P.A.",
        noticePeriod: "60 Days",
        coverLetterName: "john_smith_cover_letter.pdf",
        screeningAnswers: [
            { questionId: "q-3", questionText: "Have you ever optimized MongoDB queries at scale? Explain briefly.", answer: "Yes. In my current company, I rewrote aggregate pipelines to utilize compound indices, which reduced server CPU load by 40%." }
        ]
    },
    {
        id: "app-4",
        jobId: "job-2",
        jobTitle: "Backend Engineer",
        candidateName: "Sarah Chen",
        email: "sarah.chen@example.com",
        phone: "+91 97777 44433",
        appliedDate: "2026-06-06T12:00:00.000Z",
        status: "Rejected",
        resumeName: "sarah_chen_resume.pdf",
        notes: "Does not possess Node/Express experience. Skillset is mostly Python/Django.",
        currentLocation: "Delhi NCR, India",
        highestQualification: "B.Tech in CS",
        yearsOfExperience: 2,
        availableStartDate: "2026-07-01",
        portfolioUrl: "",
        gitHubProfile: "https://github.com/sarahchen",
        linkedInProfile: "https://linkedin.com/in/sarahchen",
        currentCompany: "Wipro",
        currentCtc: "₹5,50,000 P.A.",
        expectedCtc: "₹8,00,000 P.A.",
        noticePeriod: "30 Days",
        coverLetterName: "",
        screeningAnswers: [
            { questionId: "q-3", questionText: "Have you ever optimized MongoDB queries at scale? Explain briefly.", answer: "I have optimized queries in Django with PostgreSQL, but my MongoDB experience is limited to personal projects." }
        ]
    },
    {
        id: "app-5",
        jobId: "job-4",
        jobTitle: "HR Specialist",
        candidateName: "Vikram Malhotra",
        email: "vikram.m@example.com",
        phone: "+91 96666 22211",
        appliedDate: "2026-05-18T10:30:00.000Z",
        status: "Selected",
        resumeName: "vikram_malhotra_hr.pdf",
        notes: "Offer letter sent and accepted. Onboarding set for July 1st.",
        currentLocation: "Mumbai, India",
        highestQualification: "MBA in HR Management",
        yearsOfExperience: 2,
        availableStartDate: "2026-07-01",
        portfolioUrl: "",
        gitHubProfile: "",
        linkedInProfile: "https://linkedin.com/in/vikram-m",
        currentCompany: "Infosys",
        currentCtc: "₹4,80,000 P.A.",
        expectedCtc: "₹6,00,000 P.A.",
        noticePeriod: "30 Days",
        coverLetterName: "vikram_cover_letter.pdf",
        screeningAnswers: []
    },
    {
        id: "app-6",
        jobId: "job-1",
        jobTitle: "Frontend Developer",
        candidateName: "Ananya Iyer",
        email: "ananya.iyer@example.com",
        phone: "+91 95555 33344",
        appliedDate: "2026-06-07T15:00:00.000Z",
        status: "Applied",
        resumeName: "ananya_iyer_dev.pdf",
        notes: "Transitioning from Angular to React. Good understanding of frontend architecture.",
        currentLocation: "Chennai, India",
        highestQualification: "B.Tech in IT",
        yearsOfExperience: 1,
        availableStartDate: "2026-07-01",
        portfolioUrl: "https://ananyaiyer.github.io",
        gitHubProfile: "https://github.com/ananyaiyer",
        linkedInProfile: "https://linkedin.com/in/ananyaiyer",
        currentCompany: "Cognizant",
        currentCtc: "₹4,20,000 P.A.",
        expectedCtc: "₹6,50,000 P.A.",
        noticePeriod: "30 Days",
        coverLetterName: "",
        screeningAnswers: [
            { questionId: "q-1", questionText: "How many years of professional experience do you have with React/Next.js?", answer: "About 6 months React, and 1 year Angular experience." },
            { questionId: "q-2", questionText: "Link to your top React project or GitHub repository.", answer: "https://github.com/ananyaiyer/react-portfolio" }
        ]
    }
];

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
    const [isEditing, setIsEditing] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    // Dynamic Database Data Mapping
    const jobs = (dbJobs || []) as unknown as JobOpening[];
    const applicants = (dbApplicants || []) as unknown as Applicant[];

    // Filter states
    const [jobSearch, setJobSearch] = useState("");
    const [applicantSearch, setApplicantSearch] = useState("");
    const [jobStatusFilter, setJobStatusFilter] = useState("All");
    const [applicantStatusFilter, setApplicantStatusFilter] = useState("All");

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

    // Form inputs state
    const [formTitle, setFormTitle] = useState("");
    const [formDepartment, setFormDepartment] = useState("Engineering");
    const [formEmploymentType, setFormEmploymentType] = useState("Full-time");
    const [formOpenings, setFormOpenings] = useState(1);
    const [formExperience, setFormExperience] = useState("2+ years");
    const [formLocation, setFormLocation] = useState("Mumbai, India (Hybrid)");
    const [formDescription, setFormDescription] = useState("");
    const [formWorkMode, setFormWorkMode] = useState<'On-site' | 'Hybrid' | 'Remote'>("Hybrid");
    const [formSalaryRange, setFormSalaryRange] = useState("");
    const [formDeadline, setFormDeadline] = useState("");
    const [formQuestions, setFormQuestions] = useState<ScreeningQuestion[]>([]);

    const handleAddQuestion = () => {
        const newQuestion: ScreeningQuestion = {
            id: `q-${Date.now()}`,
            questionText: "",
            isOptional: false
        };
        setFormQuestions(prev => [...prev, newQuestion]);
    };

    const handleQuestionTextChange = (id: string, text: string) => {
        setFormQuestions(prev => prev.map(q => q.id === id ? { ...q, questionText: text } : q));
    };

    const handleQuestionOptionalToggle = (id: string) => {
        setFormQuestions(prev => prev.map(q => q.id === id ? { ...q, isOptional: !q.isOptional } : q));
    };

    const handleDeleteQuestion = (id: string) => {
        setFormQuestions(prev => prev.filter(q => q.id !== id));
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
        setFormTitle("");
        setFormDepartment("Engineering");
        setFormEmploymentType("Full-time");
        setFormOpenings(1);
        setFormExperience("2+ years");
        setFormLocation("Mumbai, India (Hybrid)");
        setFormDescription("");
        setFormWorkMode("Hybrid");
        setFormSalaryRange("");
        setFormDeadline("");
        setFormQuestions([]);
        setActiveTab("form");
    };

    // Open Form for editing
    const handleOpenEditForm = (job: JobOpening) => {
        setIsEditing(true);
        setSelectedJobId(job.id);
        setFormTitle(job.title);
        setFormDepartment(job.department);
        setFormEmploymentType(job.employmentType);
        setFormOpenings(job.openings);
        setFormExperience(job.experienceRequired);
        setFormLocation(job.location);
        setFormDescription(job.description);
        setFormWorkMode(job.workMode || "Hybrid");
        setFormSalaryRange(job.salaryRange || "");
        setFormDeadline(job.deadline || "");
        setFormQuestions(job.screeningQuestions || []);
        setActiveTab("form");
    };

    // Handle Save Job (Form Submit)
    const handleSaveJob = async (statusType: 'Draft' | 'Active') => {
        if (!formTitle.trim()) {
            toast.error("Please provide a Job Title.");
            return;
        }

        const jobSlug = formTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        const jobData = {
            title: formTitle,
            department: formDepartment,
            employmentType: formEmploymentType,
            openings: formOpenings,
            experienceRequired: formExperience,
            location: formLocation,
            description: formDescription,
            status: statusType,
            slug: jobSlug,
            workMode: formWorkMode,
            salaryRange: formSalaryRange,
            deadline: formDeadline,
            screeningQuestions: formQuestions.map(q => ({
                questionText: q.questionText,
                isOptional: q.isOptional
            }))
        };

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

    // Filter Jobs
    const filteredJobs = useMemo(() => {
        return jobs.filter(j => {
            const matchesSearch = j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
                                 j.department.toLowerCase().includes(jobSearch.toLowerCase());
            const matchesStatus = jobStatusFilter === "All" || j.status === jobStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [jobs, jobSearch, jobStatusFilter]);

    // Filter Applicants
    const filteredApplicants = useMemo(() => {
        return applicants.filter(a => {
            const matchesSearch = a.candidateName.toLowerCase().includes(applicantSearch.toLowerCase()) ||
                                 a.jobTitle.toLowerCase().includes(applicantSearch.toLowerCase());
            const matchesStatus = applicantStatusFilter === "All" || a.status === applicantStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [applicants, applicantSearch, applicantStatusFilter]);

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
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium transition-colors">
                            Manage open roles, public career listings, and process candidate applications.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleRefresh}
                            className="p-2.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center shadow-sm"
                            title="Reload Data"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>

                        {activeTab === "dashboard" ? (
                            <button
                                onClick={handleOpenCreateForm}
                                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-md shadow-primary/20"
                            >
                                <Plus className="w-5 h-5" /> Create Job Opening
                            </button>
                        ) : (
                            <button
                                onClick={() => setActiveTab("dashboard")}
                                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold transition-colors shadow-sm"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                            </button>
                        )}
                    </div>
                </div>

            {activeTab === "dashboard" ? (
                <>
                    {/* 1. TOP CARDS STATS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Open Positions Card */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                <Briefcase className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Open Positions</p>
                                <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.openPositions}</h4>
                            </div>
                        </div>

                        {/* Total Applicants Card */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Applicants</p>
                                <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.totalApplicants}</h4>
                            </div>
                        </div>

                        {/* Interviews Scheduled Card */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-455 shrink-0">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Interviews Scheduled</p>
                                <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.interviews}</h4>
                            </div>
                        </div>

                        {/* Positions Filled Card */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-450 shrink-0">
                                <Award className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Positions Filled</p>
                                <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.positionsFilled}</h4>
                            </div>
                        </div>
                    </div>

                    {/* 2. JOB OPENINGS TABLE */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Active Job Openings</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">List of open and drafted roles within the organization.</p>
                            </div>

                            {/* Search & Filter */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search jobs..."
                                        value={jobSearch}
                                        onChange={(e) => setJobSearch(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                    />
                                </div>
                                <select
                                    value={jobStatusFilter}
                                    onChange={(e) => setJobStatusFilter(e.target.value)}
                                    className="px-3 py-2 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-700 dark:text-gray-300"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Active">Active</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-gray-100 dark:border-gray-800/80 rounded-xl">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                        <th className="p-4">Job Title</th>
                                        <th className="p-4">Department</th>
                                        <th className="p-4 text-center">No. of Openings</th>
                                        <th className="p-4 text-center">Applicants</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                    {filteredJobs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center p-8 text-gray-400 dark:text-gray-500 font-medium">
                                                No job openings found matching the filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredJobs.map((job) => (
                                            <tr key={job.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="p-4 font-bold text-gray-900 dark:text-gray-150">
                                                    <div>
                                                        <span>{job.title}</span>
                                                        <span className="ml-2 inline-flex items-center text-[10px] font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400">
                                                            {job.employmentType}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-400 dark:text-gray-500 font-normal block mt-0.5">
                                                        {job.location}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-medium text-gray-500 dark:text-gray-450">{job.department}</td>
                                                <td className="p-4 text-center font-bold text-gray-700 dark:text-gray-300">{job.openings}</td>
                                                <td className="p-4 text-center font-bold text-gray-700 dark:text-gray-300">{job.applicantsCount}</td>
                                                <td className="p-4">
                                                    <span className={cn(
                                                        "inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                                                        job.status === "Active" && "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
                                                        job.status === "Draft" && "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
                                                        job.status === "Closed" && "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                                                    )}>
                                                        <span className={cn(
                                                            "w-1.5 h-1.5 rounded-full mr-1.5",
                                                            job.status === "Active" && "bg-green-500",
                                                            job.status === "Draft" && "bg-gray-500",
                                                            job.status === "Closed" && "bg-red-500"
                                                        )} />
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {job.status === "Active" && (
                                                            <button
                                                                onClick={() => handleCopyUrl(job.slug, job.id)}
                                                                className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                                                title="Copy Public Link"
                                                            >
                                                                {copiedJobId === job.id ? <Check className="w-4 h-4 text-green-500 animate-in zoom-in" /> : <Copy className="w-4 h-4" />}
                                                                <span>Link</span>
                                                            </button>
                                                        )}
                                                        
                                                        <button
                                                            onClick={() => setViewingJob(job)}
                                                            className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-150 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                            title="View Job Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEditForm(job)}
                                                            className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                            title="Edit Job"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        
                                                        {job.status !== "Active" ? (
                                                            <button
                                                                onClick={() => handleLaunchJob(job.id)}
                                                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                                                                title="Launch Job"
                                                            >
                                                                <Play className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCloseJob(job.id)}
                                                                className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                                                                title="Close Job"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        
                                                        <button
                                                            onClick={() => handleDeleteJob(job.id)}
                                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title="Delete Job"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => {
                                    const baseUrl = window.location.origin;
                                    const url = `${baseUrl}/careers/${organizationSlug}`;
                                    window.open(url, "_blank");
                                }}
                                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-md shadow-primary/20"
                            >
                                <ExternalLink className="w-4 h-4" /> Launch Careers Page
                            </button>
                        </div>
                    </div>

                    {/* 3. RECENT APPLICANTS SECTION */}
                    <div id="applicants-table" className="scroll-mt-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Recent Applicants</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Applicants processing pipelines and resume reviews.</p>
                            </div>

                            {/* Search & Filter */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search candidate..."
                                        value={applicantSearch}
                                        onChange={(e) => setApplicantSearch(e.target.value)}
                                        className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                    />
                                </div>
                                <select
                                    value={applicantStatusFilter}
                                    onChange={(e) => setApplicantStatusFilter(e.target.value)}
                                    className="px-3 py-2 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-700 dark:text-gray-300"
                                >
                                    <option value="All">All Candidates</option>
                                    <option value="Applied">Applied</option>
                                    <option value="Shortlisted">Shortlisted</option>
                                    <option value="Interview">Interview</option>
                                    <option value="Selected">Selected</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-visible border border-gray-100 dark:border-gray-800/80 rounded-xl">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                        <th className="p-4">Candidate Name</th>
                                        <th className="p-4">Applied For</th>
                                        <th className="p-4">Applied Date</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                    {filteredApplicants.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center p-8 text-gray-400 dark:text-gray-500 font-medium">
                                                No applicant records found matching the filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredApplicants.map((applicant) => (
                                            <tr key={applicant.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="p-4 font-bold text-gray-900 dark:text-gray-150">
                                                    <div>{applicant.candidateName}</div>
                                                    <span className="text-xs text-gray-450 dark:text-gray-500 font-normal block mt-0.5">
                                                        {applicant.email} • {applicant.phone}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-semibold text-gray-650 dark:text-gray-300">{applicant.jobTitle}</td>
                                                <td className="p-4 font-medium text-gray-500 dark:text-gray-450">
                                                    {new Date(applicant.appliedDate).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric"
                                                    })}
                                                </td>
                                                <td className="p-4 relative status-dropdown-container">
                                                    <button
                                                        onClick={(e) => toggleDropdown(e, applicant.id)}
                                                        className={cn(
                                                            "inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40 gap-1.5",
                                                            applicant.status === "Applied" && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
                                                            applicant.status === "Shortlisted" && "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
                                                            applicant.status === "Interview" && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-455 dark:border-yellow-500/20",
                                                            applicant.status === "Selected" && "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
                                                            applicant.status === "Rejected" && "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                                                        )}
                                                    >
                                                        <span className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            applicant.status === "Applied" && "bg-blue-500",
                                                            applicant.status === "Shortlisted" && "bg-purple-500",
                                                            applicant.status === "Interview" && "bg-yellow-500",
                                                            applicant.status === "Selected" && "bg-green-500",
                                                            applicant.status === "Rejected" && "bg-red-500"
                                                        )} />
                                                        <span>{applicant.status}</span>
                                                        <ChevronDown className="w-3 h-3 opacity-60" />
                                                    </button>
                                                    
                                                    {openDropdownId === applicant.id && (
                                                        <div 
                                                            className="absolute left-4 mt-1 w-36 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.nativeEvent.stopImmediatePropagation();
                                                            }}
                                                        >
                                                            {(['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'] as const).map((status) => (
                                                                <button
                                                                    key={status}
                                                                    onClick={() => {
                                                                        handleUpdateApplicantStatusDirect(applicant.id, applicant.candidateName, status);
                                                                        setOpenDropdownId(null);
                                                                    }}
                                                                    className={cn(
                                                                        "w-full text-left px-3 py-2 text-xs font-semibold transition-all flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
                                                                        applicant.status === status && "bg-gray-50 dark:bg-gray-850 text-primary dark:text-white"
                                                                    )}
                                                                >
                                                                    <span className={cn(
                                                                        "w-1.5 h-1.5 rounded-full",
                                                                        status === "Applied" && "bg-blue-500",
                                                                        status === "Shortlisted" && "bg-purple-500",
                                                                        status === "Interview" && "bg-yellow-500",
                                                                        status === "Selected" && "bg-green-500",
                                                                        status === "Rejected" && "bg-red-500"
                                                                    )} />
                                                                    <span>{status}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2.5">
                                                        <button
                                                            onClick={() => setSelectedApplicant(applicant)}
                                                            className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                                                        >
                                                            <FileText className="w-3.5 h-3.5" /> View Application
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteApplicant(applicant.id, applicant.candidateName)}
                                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-955/20 rounded-lg transition-colors"
                                                            title="Delete Record"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* 4. CREATE / EDIT JOB OPENING FORM */
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none space-y-6 max-w-4xl mx-auto">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                            {isEditing ? "Edit Job Opening" : "Create New Job Opening"}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Provide the details for the role. Launching the job generates a public application form URL.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Job Title */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Job Title *</label>
                            <input
                                type="text"
                                placeholder="e.g. Frontend Developer"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                            />
                        </div>

                        {/* Department */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Department</label>
                            <select
                                value={formDepartment}
                                onChange={(e) => setFormDepartment(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                            >
                                <option value="Engineering">Engineering</option>
                                <option value="Design">Design</option>
                                <option value="Human Resources">Human Resources</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Finance">Finance</option>
                                <option value="Sales">Sales</option>
                            </select>
                        </div>

                        {/* Employment Type */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Employment Type</label>
                            <select
                                value={formEmploymentType}
                                onChange={(e) => setFormEmploymentType(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>

                        {/* Openings Count */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Number of Openings</label>
                            <input
                                type="number"
                                min={1}
                                value={formOpenings}
                                onChange={(e) => setFormOpenings(Number(e.target.value))}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                            />
                        </div>

                        {/* Experience Required */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Experience Required</label>
                            <input
                                type="text"
                                placeholder="e.g. 2+ years, Entry level, 5-8 years"
                                value={formExperience}
                                onChange={(e) => setFormExperience(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                            />
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Location</label>
                            <input
                                type="text"
                                placeholder="e.g. Mumbai, India (Hybrid) or Remote"
                                value={formLocation}
                                onChange={(e) => setFormLocation(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                            />
                        </div>

                        {/* Work Mode */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Work Mode</label>
                            <select
                                value={formWorkMode}
                                onChange={(e) => setFormWorkMode(e.target.value as 'On-site' | 'Hybrid' | 'Remote')}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-850 dark:text-gray-200"
                            >
                                <option value="On-site">On-site</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Remote">Remote</option>
                            </select>
                        </div>

                        {/* Salary Range */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Compensation / Salary Range</label>
                            <input
                                type="text"
                                placeholder="e.g. ₹8,00,000 - ₹12,00,000 P.A."
                                value={formSalaryRange}
                                onChange={(e) => setFormSalaryRange(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-850 dark:text-gray-200"
                            />
                        </div>

                        {/* Application Deadline */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Application Deadline</label>
                            <input
                                type="date"
                                value={formDeadline}
                                onChange={(e) => setFormDeadline(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-850 dark:text-gray-200"
                            />
                        </div>

                        {/* Description */}
                        <div className="col-span-1 md:col-span-2 space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Job Description</label>
                            <textarea
                                placeholder="Detail the duties, responsibilities, role expectations, and candidate requirements..."
                                rows={6}
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200 resize-y"
                            />
                        </div>

                        {/* Screening Questions Section */}
                        <div className="col-span-1 md:col-span-2 border-t border-gray-200 dark:border-gray-800 pt-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-950 dark:text-white">Screening Questions</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add custom questions for candidates to answer when applying.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Question
                                </button>
                            </div>

                            {formQuestions.length === 0 ? (
                                <p className="text-xs text-gray-400 dark:text-gray-500 italic p-3 bg-gray-50 dark:bg-gray-950/40 rounded-xl text-center border border-dashed border-gray-200 dark:border-gray-850">
                                    No screening questions added yet. Candidates will only submit the standard application form.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {formQuestions.map((q, idx) => (
                                        <div key={q.id} className="flex items-start gap-4 p-4 bg-gray-50/50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-850 rounded-xl">
                                            <span className="text-xs font-bold text-gray-400 mt-2.5">Q{idx + 1}</span>
                                            
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. What is your notice period?"
                                                    value={q.questionText}
                                                    onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                                />
                                                
                                                <label className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={q.isOptional}
                                                        onChange={() => handleQuestionOptionalToggle(q.id)}
                                                        className="rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-700 w-3.5 h-3.5 bg-white dark:bg-gray-900"
                                                    />
                                                    <span>Optional Question</span>
                                                </label>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteQuestion(q.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors mt-1"
                                                title="Delete Question"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-800 pt-5 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab("dashboard")}
                            className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 font-bold transition-colors text-sm text-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSaveJob("Draft")}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 rounded-xl font-bold transition-colors text-sm"
                        >
                            Save Draft
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSaveJob("Active")}
                            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all text-sm shadow-md shadow-primary/20"
                        >
                            Launch Job
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL 1: VIEW JOB DETAILS */}
            {viewingJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setViewingJob(null)}>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col p-6 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">{viewingJob.title}</h3>
                            <button onClick={() => setViewingJob(null)} className="p-1.5 text-gray-400 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 py-4 overflow-y-auto space-y-4 max-h-[60vh] custom-scrollbar text-sm text-gray-700 dark:text-gray-300">
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-950 p-4 rounded-xl">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Department</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingJob.department}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Location</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingJob.location}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Employment Type</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingJob.employmentType}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Experience Required</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{viewingJob.experienceRequired}</span>
                                </div>
                            </div>
                            
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">Description</span>
                                <p className="leading-relaxed whitespace-pre-line text-gray-600 dark:text-gray-355 bg-gray-50/50 dark:bg-gray-950/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                    {viewingJob.description || "No description provided."}
                                </p>
                            </div>
                            
                            {viewingJob.status === "Active" && (
                                <div className="border-t border-dashed border-gray-200 dark:border-gray-850 pt-4 flex items-center justify-between">
                                    <span className="text-xs text-gray-450 dark:text-gray-400 font-semibold">Copy and share career URL:</span>
                                    <button
                                        onClick={() => handleCopyUrl(viewingJob.slug, viewingJob.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-black transition-colors"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        Copy Link
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedApplicant && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedApplicant(null)}>
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col p-6 md:p-8 animate-in zoom-in-95 max-h-[90vh] shadow-2xl transition-all duration-300" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Header Block */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20 shrink-0 ring-4 ring-primary/10 dark:ring-primary/20">
                                    {selectedApplicant.candidateName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{selectedApplicant.candidateName}</h3>
                                        
                                        {/* Dynamic Status Dropdown */}
                                        <div className="relative">
                                            <button 
                                                onClick={() => setOpenModalDropdown(!openModalDropdown)}
                                                className={cn(
                                                    "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all shadow-sm gap-1.5 active:scale-95",
                                                    selectedApplicant.status === "Applied" && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
                                                    selectedApplicant.status === "Shortlisted" && "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
                                                    selectedApplicant.status === "Interview" && "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-455 dark:border-yellow-500/20",
                                                    selectedApplicant.status === "Selected" && "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
                                                    selectedApplicant.status === "Rejected" && "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                                                )}
                                            >
                                                <span className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    selectedApplicant.status === "Applied" && "bg-blue-500",
                                                    selectedApplicant.status === "Shortlisted" && "bg-purple-500",
                                                    selectedApplicant.status === "Interview" && "bg-yellow-500",
                                                    selectedApplicant.status === "Selected" && "bg-green-500",
                                                    selectedApplicant.status === "Rejected" && "bg-red-500"
                                                )} />
                                                {selectedApplicant.status}
                                                <ChevronDown className="w-3 h-3 opacity-60" />
                                            </button>
                                            
                                            {openModalDropdown && (
                                                <div className="absolute left-0 mt-1.5 w-36 bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                                    {(['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'] as const).map((status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleUpdateStatusInModal(status)}
                                                            className={cn(
                                                                "w-full text-left px-3 py-2 text-xs font-semibold transition-all flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-805 text-gray-700 dark:text-gray-300",
                                                                selectedApplicant.status === status && "bg-gray-55 dark:bg-gray-700 text-primary dark:text-white"
                                                            )}
                                                        >
                                                            <span className={cn(
                                                                "w-1.5 h-1.5 rounded-full",
                                                                status === "Applied" && "bg-blue-500",
                                                                status === "Shortlisted" && "bg-purple-500",
                                                                status === "Interview" && "bg-yellow-500",
                                                                status === "Selected" && "bg-green-500",
                                                                status === "Rejected" && "bg-red-500"
                                                            )} />
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                        <span>Applied for <strong className="text-gray-750 dark:text-gray-200 font-bold">{selectedApplicant.jobTitle}</strong></span>
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedApplicant(null)} className="p-2 text-gray-400 hover:text-gray-605 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-xl transition-all self-start sm:self-center">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Scrollable Modal Content */}
                        <div className="flex-1 py-6 overflow-y-auto max-h-[70vh] custom-scrollbar text-sm text-gray-700 dark:text-gray-300 pr-1">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Left Two Columns: Professional profile details & documents & Screening questions */}
                                <div className="lg:col-span-2 space-y-6">
                                    
                                    {/* Application details grids */}
                                    <div className="bg-gray-50/50 dark:bg-gray-950/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Professional Profile</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800/80 hover:shadow-sm hover:border-primary/20 dark:hover:border-primary/30 transition-all">
                                                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 block uppercase tracking-wider">Current Location</span>
                                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{selectedApplicant.currentLocation || "N/A"}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800/80 hover:shadow-sm hover:border-primary/20 dark:hover:border-primary/30 transition-all">
                                                <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                                    <GraduationCap className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-555 block uppercase tracking-wider">Qualification</span>
                                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{selectedApplicant.highestQualification || "N/A"}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800/80 hover:shadow-sm hover:border-primary/20 dark:hover:border-primary/30 transition-all">
                                                <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                                                    <Briefcase className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-555 block uppercase tracking-wider">Experience</span>
                                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                        {selectedApplicant.yearsOfExperience === 0 ? "Fresher (0 Years)" : `${selectedApplicant.yearsOfExperience} Years`}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800/80 hover:shadow-sm hover:border-primary/20 dark:hover:border-primary/30 transition-all">
                                                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-555 block uppercase tracking-wider">Available Start Date</span>
                                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                        {selectedApplicant.availableStartDate ? new Date(selectedApplicant.availableStartDate).toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric"
                                                        }) : "N/A"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Uploaded Documents */}
                                    <div className="bg-gray-50/50 dark:bg-gray-955/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Candidate Documents</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Resume Card */}
                                            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3 truncate pr-2">
                                                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-505 shrink-0">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="truncate">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Candidate Resume</span>
                                                        <span className="text-xs font-bold text-gray-850 dark:text-gray-200 truncate block">{selectedApplicant.resumeName}</span>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDownloadFile(selectedApplicant.resumeData, selectedApplicant.resumeName)} 
                                                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-primary/20 transition-all shrink-0 active:scale-95"
                                                >
                                                    Download
                                                </button>
                                            </div>
                                            
                                            {/* Cover Letter Card */}
                                            {selectedApplicant.coverLetterName ? (
                                                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex items-center gap-3 truncate pr-2">
                                                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                                            <FileText className="w-5 h-5" />
                                                        </div>
                                                        <div className="truncate">
                                                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Cover Letter File</span>
                                                            <span className="text-xs font-bold text-gray-850 dark:text-gray-200 truncate block">{selectedApplicant.coverLetterName}</span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDownloadFile(selectedApplicant.coverLetterData, selectedApplicant.coverLetterName!)} 
                                                        className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-primary/20 transition-all shrink-0 active:scale-95"
                                                    >
                                                        Download
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="border border-dashed border-gray-200 dark:border-gray-800 p-4 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs italic bg-white dark:bg-gray-900">
                                                    No cover letter file uploaded
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Screening Questions section (Moved to Last) */}
                                    <div className="bg-gray-50/50 dark:bg-gray-955/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Screening Questions & Answers</h4>
                                        {!selectedApplicant.screeningAnswers || selectedApplicant.screeningAnswers.length === 0 ? (
                                            <p className="text-xs text-gray-455 dark:text-gray-500 italic p-6 bg-white dark:bg-gray-905 rounded-xl text-center border border-dashed border-gray-205 dark:border-gray-800">
                                                No screening questions were set for this position or answered by candidate.
                                            </p>
                                        ) : (
                                            <div className="space-y-4">
                                                {selectedApplicant.screeningAnswers.map((ans, idx) => (
                                                    <div key={ans.questionId || idx} className="p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl space-y-3 shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                                            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-primary/10 text-primary rounded-lg uppercase tracking-wider">Question {idx + 1}</span>
                                                            {!ans.answer && <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide">Unanswered</span>}
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-snug">{ans.questionText}</p>
                                                        <div className="bg-gray-55 dark:bg-gray-950 p-4 rounded-xl border border-gray-100 dark:border-gray-800/80 shadow-inner mt-2">
                                                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1.5">Candidate's Response:</span>
                                                            <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed font-semibold">
                                                                {ans.answer || <span className="italic text-gray-450">Not answered by candidate.</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                </div>
                                
                                {/* Right Column: Contact info, Financials, Social links, Notes */}
                                <div className="space-y-6">
                                    
                                    {/* Contact Details Card */}
                                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Contact Information</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <div className="truncate">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-455 dark:text-gray-500 block">Email Address</span>
                                                    <a href={`mailto:${selectedApplicant.email}`} className="text-xs font-bold text-primary hover:underline truncate block">{selectedApplicant.email}</a>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0 mt-0.5">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-455 dark:text-gray-500 block">Phone Number</span>
                                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-250 block">{selectedApplicant.phone}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-455 dark:text-gray-500 block">Applied Date</span>
                                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                                                        {new Date(selectedApplicant.appliedDate).toLocaleString("en-US", {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit"
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Financials & Employment Card */}
                                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-4">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Employment & CTC</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 mt-0.5">
                                                    <Building className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-455 dark:text-gray-500 block">Current Company</span>
                                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{selectedApplicant.currentCompany || "None (Fresher)"}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                                                    <Coins className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-455 dark:text-gray-500 block">Current CTC</span>
                                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{selectedApplicant.currentCtc || "N/A"}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5">
                                                    <Coins className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-455 dark:text-gray-550 block">Expected CTC</span>
                                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{selectedApplicant.expectedCtc || "N/A"}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-455 shrink-0 mt-0.5">
                                                    <Clock className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-455 dark:text-gray-500 block">Notice Period</span>
                                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{selectedApplicant.noticePeriod || "None"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Social & Portfolio Links Card */}
                                    {(selectedApplicant.portfolioUrl || selectedApplicant.gitHubProfile || selectedApplicant.linkedInProfile) && (
                                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-3">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Profiles & Links</h4>
                                            <div className="flex flex-col gap-2">
                                                {selectedApplicant.portfolioUrl && (
                                                    <a 
                                                        href={selectedApplicant.portfolioUrl} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="flex items-center justify-between px-3 py-2 bg-blue-50/50 dark:bg-blue-500/5 hover:bg-blue-100/50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold transition-all border border-blue-100/50 dark:border-blue-500/10 active:scale-95"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                            <span>Personal Portfolio</span>
                                                        </span>
                                                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                                    </a>
                                                )}
                                                {selectedApplicant.gitHubProfile && (
                                                    <a 
                                                        href={selectedApplicant.gitHubProfile} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all border border-gray-200 dark:border-gray-750 active:scale-95"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <FaGithub className="w-3.5 h-3.5" />
                                                            <span>GitHub Profile</span>
                                                        </span>
                                                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                                    </a>
                                                )}
                                                {selectedApplicant.linkedInProfile && (
                                                    <a 
                                                        href={selectedApplicant.linkedInProfile} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="flex items-center justify-between px-3 py-2 bg-indigo-50/50 dark:bg-indigo-500/5 hover:bg-indigo-100/50 dark:hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all border border-indigo-100/50 dark:border-indigo-500/10 active:scale-95"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <FaLinkedin className="w-3.5 h-3.5" />
                                                            <span>LinkedIn Profile</span>
                                                        </span>
                                                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Candidate Notes / Comments */}
                                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-3">
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Notes & Messages</h4>
                                        <div className="p-3.5 bg-indigo-50/40 dark:bg-indigo-950/10 rounded-xl border border-indigo-100/40 dark:border-indigo-900/40 text-xs italic text-gray-700 dark:text-gray-300 leading-relaxed font-semibold shadow-inner border-l-4 border-l-primary">
                                            "{selectedApplicant.notes || "No notes submitted by candidate."}"
                                        </div>
                                    </div>
                                    
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* End of max-w-7xl wrapper */}
            </div>
        </div>
    );
}
