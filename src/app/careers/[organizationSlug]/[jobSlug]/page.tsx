// src/app/careers/[organizationSlug]/[jobSlug]/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    Briefcase, MapPin, Clock, ArrowLeft, Send, 
    FileText, CheckCircle, Sparkles, AlertCircle, Phone, Mail, User,
    Calendar, Globe, Building, Banknote
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { recruitmentService } from "@/services/recruitmentService";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

interface ScreeningQuestion {
    id?: string;
    _id?: string;
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
    workMode?: 'On-site' | 'Hybrid' | 'Remote';
    salaryRange?: string;
    deadline?: string;
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

const DEFAULT_ACTIVE = [
    {
        id: "job-1",
        title: "Frontend Developer",
        department: "Engineering",
        employmentType: "Full-time",
        openings: 2,
        experienceRequired: "2-4 years",
        location: "Mumbai, India (Hybrid)",
        description: "We are looking for a skilled React/Next.js developer to build sleek, state-of-the-art interactive dashboards and client-facing web applications. You should be expert in Tailwind CSS, TypeScript, and state management systems like Redux.",
        status: "Active" as const,
        slug: "frontend-developer",
        applicantsCount: 3,
        createdAt: "2026-06-01T10:00:00.000Z",
        workMode: "Hybrid" as const,
        salaryRange: "₹8,00,000 - ₹12,00,000 P.A.",
        deadline: "2026-07-15",
        screeningQuestions: [
            { id: "q-1", questionText: "How many years of professional experience do you have with React/Next.js?", isOptional: false },
            { id: "q-2", questionText: "Link to your top React project or GitHub repository.", isOptional: true }
        ]
    }
];

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export default function CareerJobApplicationPage() {
    const params = useParams();
    const router = useRouter();
    const organizationSlug = (params.organizationSlug as string) || "macenza";
    const jobSlug = (params.jobSlug as string) || "";

    const [job, setJob] = useState<JobOpening | null>(null);
    const [loading, setLoading] = useState(true);

    // Form inputs state
    const [candidateName, setCandidateName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Extended required fields
    const [currentLocation, setCurrentLocation] = useState("");
    const [highestQualification, setHighestQualification] = useState("");
    const [yearsOfExperience, setYearsOfExperience] = useState<number | "">("");
    const [availableStartDate, setAvailableStartDate] = useState("");

    // Extended optional fields
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [gitHubProfile, setGitHubProfile] = useState("");
    const [linkedInProfile, setLinkedInProfile] = useState("");
    const [currentCompany, setCurrentCompany] = useState("");
    const [currentCtc, setCurrentCtc] = useState("");
    const [expectedCtc, setExpectedCtc] = useState("");
    const [noticePeriod, setNoticePeriod] = useState("");
    const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

    // Screening Answers state
    const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string>>({});

    const handleCoverLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCoverLetterFile(e.target.files[0]);
        }
    };

    const handleScreeningAnswerChange = (qId: string, value: string) => {
        setScreeningAnswers(prev => ({
            ...prev,
            [qId]: value
        }));
    };

    const formRef = useRef<HTMLDivElement>(null);

    // Load jobs and find matching active job
    useEffect(() => {
        let active = true;
        setLoading(true);
        recruitmentService.getPublicJobBySlug(organizationSlug, jobSlug)
            .then(data => {
                if (active) {
                    setJob(data as unknown as JobOpening);
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error("Failed to load public job detail:", err);
                if (active) {
                    setJob(null);
                    setLoading(false);
                }
            });
        return () => { active = false; };
    }, [organizationSlug, jobSlug]);

    const companyTitle = useMemo(() => {
        return organizationSlug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }, [organizationSlug]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleScrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !candidateName.trim() || 
            !email.trim() || 
            !phone.trim() || 
            !resumeFile || 
            !currentLocation.trim() || 
            !highestQualification.trim() || 
            yearsOfExperience === "" || 
            !availableStartDate
        ) {
            toast.error("Please fill in all required fields and upload your resume.");
            return;
        }

        // Verify required screening questions are answered
        if (job && job.screeningQuestions) {
            for (const q of job.screeningQuestions) {
                const qId = q._id || q.id || "";
                if (!q.isOptional && !screeningAnswers[qId]?.trim()) {
                    toast.error(`Please answer the required question: "${q.questionText}"`);
                    return;
                }
            }
        }

        setSubmitting(true);

        // Convert files to Base64
        let resumeData = "";
        let coverLetterData = "";
        try {
            resumeData = await fileToBase64(resumeFile);
        } catch (err) {
            console.error("Failed to convert resume to Base64:", err);
        }
        if (coverLetterFile) {
            try {
                coverLetterData = await fileToBase64(coverLetterFile);
            } catch (err) {
                console.error("Failed to convert cover letter to Base64:", err);
            }
        }

        if (!job) {
            setSubmitting(false);
            return;
        }

        // Construct screening answers array
        const answersArray = (job.screeningQuestions || []).map(q => {
            const qId = q._id || q.id || "";
            return {
                questionId: qId,
                questionText: q.questionText,
                answer: screeningAnswers[qId] || ""
            };
        });

        // Create applicant record
        const newApplicant: Applicant = {
            id: `app-${Date.now()}`,
            jobId: job.id,
            jobTitle: job.title,
            candidateName,
            email,
            phone,
            appliedDate: new Date().toISOString(),
            status: "Applied",
            resumeName: resumeFile.name,
            resumeData,
            notes: notes.trim() || undefined,
            currentLocation,
            highestQualification,
            yearsOfExperience: Number(yearsOfExperience),
            availableStartDate,
            portfolioUrl: portfolioUrl.trim() || undefined,
            gitHubProfile: gitHubProfile.trim() || undefined,
            linkedInProfile: linkedInProfile.trim() || undefined,
            currentCompany: currentCompany.trim() || undefined,
            currentCtc: currentCtc.trim() || undefined,
            expectedCtc: expectedCtc.trim() || undefined,
            noticePeriod: noticePeriod.trim() || undefined,
            coverLetterName: coverLetterFile ? coverLetterFile.name : undefined,
            coverLetterData: coverLetterFile ? coverLetterData : undefined,
            screeningAnswers: answersArray
        };

        // Submit candidate application payload via API
        try {
            await recruitmentService.submitApplication(organizationSlug, jobSlug, {
                candidateName,
                email,
                phone,
                resumeName: resumeFile.name,
                resumeData,
                notes: notes.trim() || undefined,
                currentLocation,
                highestQualification,
                yearsOfExperience: Number(yearsOfExperience),
                availableStartDate,
                portfolioUrl: portfolioUrl.trim() || undefined,
                gitHubProfile: gitHubProfile.trim() || undefined,
                linkedInProfile: linkedInProfile.trim() || undefined,
                currentCompany: currentCompany.trim() || undefined,
                currentCtc: currentCtc.trim() || undefined,
                expectedCtc: expectedCtc.trim() || undefined,
                noticePeriod: noticePeriod.trim() || undefined,
                coverLetterName: coverLetterFile ? coverLetterFile.name : undefined,
                coverLetterData: coverLetterFile ? coverLetterData : undefined,
                screeningAnswers: answersArray
            });

            setSubmitting(false);
            setSubmitted(true);
            toast.success("Application submitted successfully!");
        } catch (e) {
            console.error("Failed to submit application to API:", e);
            setSubmitting(false);
            toast.error("Failed to submit application. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950 px-6 text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-red-500 animate-bounce" />
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">Position Not Available</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                    This job opening is either closed, in draft state, or does not exist at this URL.
                </p>
                <button
                    onClick={() => router.push(`/careers/${organizationSlug}`)}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-sm"
                >
                    View Other Open Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-150 transition-colors duration-300">
            {/* Header / Nav */}
            <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-900/60 sticky top-0 backdrop-blur-md z-30">
                <button
                    onClick={() => router.push(`/careers/${organizationSlug}`)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to openings
                </button>
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500">{companyTitle} Careers Portal</span>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
                {/* 1. Job Card Details */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-6 md:p-8 rounded-2xl shadow-sm dark:shadow-none space-y-6">
                    <div className="space-y-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-md">
                                {job.department}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-gray-955 dark:text-white tracking-tight leading-tight">
                            {job.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-855 pb-5">
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                {job.location}
                            </span>
                            {job.workMode && (
                                <span className="flex items-center gap-1.5">
                                    <Globe className="w-4 h-4 text-gray-400" />
                                    Work Mode: {job.workMode}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {job.employmentType}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                Experience: {job.experienceRequired}
                            </span>
                            {job.salaryRange && (
                                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-450">
                                    <Banknote className="w-4 h-4 text-emerald-500 shrink-0" />
                                    {job.salaryRange}
                                </span>
                            )}
                            {job.deadline && (
                                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-450">
                                    <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                                    Application Deadline: {new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">About the Role</h3>
                        <p className="text-sm text-gray-650 dark:text-gray-355 leading-relaxed whitespace-pre-line bg-gray-50/50 dark:bg-gray-955/40 p-5 rounded-xl border border-gray-100 dark:border-gray-855">
                            {job.description}
                        </p>
                    </div>
                </div>

                {/* 2. Job Application Form / Success screen */}
                <div ref={formRef} className="scroll-mt-24">
                    {submitted ? (
                        <div className="bg-white dark:bg-gray-900 border border-emerald-100 dark:border-emerald-950/40 p-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl md:text-2xl font-black text-gray-955 dark:text-white">Application Submitted!</h2>
                                <p className="text-sm text-gray-450 dark:text-gray-500 max-w-md mx-auto">
                                    Thank you, <strong>{candidateName}</strong>! Your application for the <strong>{job.title}</strong> role has been securely recorded.
                                </p>
                            </div>
                            <div className="border border-dashed border-gray-200 dark:border-gray-800 p-4 rounded-xl text-left text-xs space-y-2 w-full max-w-md bg-gray-50 dark:bg-gray-950">
                                <p><strong>Email:</strong> {email}</p>
                                <p><strong>Phone:</strong> {phone}</p>
                                <p><strong>Location:</strong> {currentLocation}</p>
                                <p><strong>Experience:</strong> {yearsOfExperience === 0 ? "Fresher (0 Years)" : `${yearsOfExperience} Years`}</p>
                                <p><strong>Resume:</strong> {resumeFile?.name}</p>
                                {coverLetterFile && <p><strong>Cover Letter:</strong> {coverLetterFile.name}</p>}
                            </div>
                            <button
                                onClick={() => router.push(`/careers/${organizationSlug}`)}
                                className="px-5 py-2.5 border border-gray-200 dark:border-gray-850 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Return to Careers
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Submit Your Application</h2>
                                <p className="text-xs text-gray-450 dark:text-gray-500 mt-1">
                                    Fill in your contact information, candidate details, and upload your resume.
                                </p>
                            </div>

                            <form onSubmit={handleSubmitApplication} className="space-y-6">
                                <div className="space-y-6">
                                    {/* Section 1: Contact Details */}
                                    <div className="border-b border-gray-100 dark:border-gray-850 pb-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-955 dark:text-white mb-4">Contact Information</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {/* Full Name */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <User className="w-3.5 h-3.5 text-gray-400" /> Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="John Doe"
                                                    value={candidateName}
                                                    onChange={(e) => setCandidateName(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>

                                            {/* Email */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="john.doe@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="+91 XXXXX XXXXX"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>

                                            {/* Current Location */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-gray-400" /> Current Location *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Mumbai, India"
                                                    value={currentLocation}
                                                    onChange={(e) => setCurrentLocation(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Professional Profile */}
                                    <div className="border-b border-gray-100 dark:border-gray-855 pb-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-955 dark:text-white mb-4">Professional Profile</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {/* Highest Qualification */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <Briefcase className="w-3.5 h-3.5 text-gray-400" /> Highest Qualification *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. B.Tech CS, MCA, MBA"
                                                    value={highestQualification}
                                                    onChange={(e) => setHighestQualification(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>

                                            {/* Years of Experience */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <Briefcase className="w-3.5 h-3.5 text-gray-400" /> Years of Experience *
                                                </label>
                                                <input
                                                    type="number"
                                                    required
                                                    min={0}
                                                    placeholder="0 for Freshers, otherwise input years"
                                                    value={yearsOfExperience}
                                                    onChange={(e) => setYearsOfExperience(e.target.value === "" ? "" : Number(e.target.value))}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>

                                            {/* Available Start Date */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Available Start Date *
                                                </label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={availableStartDate}
                                                    onChange={(e) => setAvailableStartDate(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-55/70 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>

                                            {/* Current Company */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <Building className="w-3.5 h-3.5 text-gray-400" /> Current Company (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Leave blank if fresher"
                                                    value={currentCompany}
                                                    onChange={(e) => setCurrentCompany(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Financial & Notice Period */}
                                    <div className="border-b border-gray-100 dark:border-gray-855 pb-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-955 dark:text-white mb-4">Financials & Notice</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            {/* Current CTC */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <Banknote className="w-3.5 h-3.5 text-gray-400" /> Current CTC (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Leave blank if fresher"
                                                    value={currentCtc}
                                                    onChange={(e) => setCurrentCtc(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-55/70 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>

                                            {/* Expected CTC */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <Banknote className="w-3.5 h-3.5 text-gray-400" /> Expected CTC (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. ₹10,00,000 P.A."
                                                    value={expectedCtc}
                                                    onChange={(e) => setExpectedCtc(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>

                                            {/* Notice Period */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-gray-400" /> Notice Period (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Leave blank if immediate"
                                                    value={noticePeriod}
                                                    onChange={(e) => setNoticePeriod(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 4: Professional Profiles & Links */}
                                    <div className="border-b border-gray-100 dark:border-gray-855 pb-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-955 dark:text-white mb-4">Professional Links</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            {/* Portfolio URL */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <Globe className="w-3.5 h-3.5 text-gray-400" /> Portfolio URL (Optional)
                                                </label>
                                                <input
                                                    type="url"
                                                    placeholder="https://..."
                                                    value={portfolioUrl}
                                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>

                                            {/* GitHub Profile */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <FaGithub className="w-3.5 h-3.5 text-gray-400" /> GitHub Profile (Optional)
                                                </label>
                                                <input
                                                    type="url"
                                                    placeholder="https://github.com/..."
                                                    value={gitHubProfile}
                                                    onChange={(e) => setGitHubProfile(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-55/70 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>

                                            {/* LinkedIn Profile */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <FaLinkedin className="w-3.5 h-3.5 text-gray-400" /> LinkedIn Profile (Optional)
                                                </label>
                                                <input
                                                    type="url"
                                                    placeholder="https://linkedin.com/in/..."
                                                    value={linkedInProfile}
                                                    onChange={(e) => setLinkedInProfile(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 5: Documents */}
                                    <div className="border-b border-gray-100 dark:border-gray-855 pb-4">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-955 dark:text-white mb-4">Documents Upload</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {/* Resume Upload */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5 text-gray-400" /> Resume / CV *
                                                </label>
                                                
                                                <div className="relative w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer overflow-hidden p-3 flex items-center justify-between">
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={handleFileChange}
                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full font-bold"
                                                        required={!resumeFile}
                                                    />
                                                    <span className="text-xs text-gray-550 dark:text-gray-400 truncate pr-3 select-none">
                                                        {resumeFile ? resumeFile.name : "Choose PDF/Word file..."}
                                                    </span>
                                                    <span className="px-2.5 py-1 text-[10px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-bold shrink-0">
                                                        Browse
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Cover Letter Upload */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5 text-gray-400" /> Cover Letter File (Optional)
                                                </label>
                                                
                                                <div className="relative w-full border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer overflow-hidden p-3 flex items-center justify-between">
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={handleCoverLetterChange}
                                                        className="absolute inset-0 opacity-0 cursor-pointer w-full font-bold"
                                                    />
                                                    <span className="text-xs text-gray-550 dark:text-gray-400 truncate pr-3 select-none">
                                                        {coverLetterFile ? coverLetterFile.name : "Choose PDF/Word file..."}
                                                    </span>
                                                    <span className="px-2.5 py-1 text-[10px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-bold shrink-0">
                                                        Browse
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 6: Screening Questions */}
                                    {job.screeningQuestions && job.screeningQuestions.length > 0 && (
                                        <div className="border-b border-gray-100 dark:border-gray-855 pb-4">
                                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-955 dark:text-white mb-4">Screening Questions</h3>
                                            <div className="space-y-4">
                                                {job.screeningQuestions.map((q, index) => {
                                                    const qId = q._id || q.id || "";
                                                    return (
                                                        <div key={qId} className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                                                                {index + 1}. {q.questionText} {q.isOptional ? <span className="text-gray-400 font-semibold italic">(Optional)</span> : <span className="text-red-500">*</span>}
                                                            </label>
                                                            <textarea
                                                                required={!q.isOptional}
                                                                rows={3}
                                                                placeholder="Enter your answer here..."
                                                                value={screeningAnswers[qId] || ""}
                                                                onChange={(e) => handleScreeningAnswerChange(qId, e.target.value)}
                                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200 resize-y"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Section 7: Notes/Comments */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Notes / Comments (Optional)</label>
                                        <textarea
                                            placeholder="Write an additional message or notes to the hiring team..."
                                            rows={4}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-855 dark:text-gray-200 resize-y"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-855 pt-5 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:bg-gray-300 dark:disabled:bg-gray-855 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                                <span>Submitting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                <span>Submit Application</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
