// src/app/careers/[organizationSlug]/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Briefcase, MapPin, Clock, Search, ChevronRight, Sparkles, Calendar, Banknote } from "lucide-react";
import { cn } from "@/utils/cn";

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
        deadline: "2026-07-15"
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
        status: "Active" as const,
        slug: "backend-engineer",
        applicantsCount: 2,
        createdAt: "2026-06-03T11:30:00.000Z",
        workMode: "Remote" as const,
        salaryRange: "₹10,00,000 - ₹16,00,000 P.A.",
        deadline: "2026-07-20"
    }
];

export default function CareerPortalIndex() {
    const params = useParams();
    const router = useRouter();
    const organizationSlug = (params.organizationSlug as string) || "macenza";

    const [jobs, setJobs] = useState<JobOpening[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("All");

    // Load jobs from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("hrms_jobs");
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as JobOpening[];
                // Only show ACTIVE jobs for the public careers portal
                setJobs(parsed.filter(j => j.status === "Active"));
            } catch (e) {
                console.error("Failed to parse hrms_jobs from localStorage, resetting:", e);
                localStorage.setItem("hrms_jobs", JSON.stringify(DEFAULT_ACTIVE));
                setJobs(DEFAULT_ACTIVE);
            }
        } else {
            localStorage.setItem("hrms_jobs", JSON.stringify(DEFAULT_ACTIVE));
            setJobs(DEFAULT_ACTIVE);
        }
    }, []);

    // Get company title
    const companyTitle = useMemo(() => {
        return organizationSlug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }, [organizationSlug]);

    // Unique departments
    const departments = useMemo(() => {
        const deptSet = new Set(jobs.map(j => j.department));
        return ["All", ...Array.from(deptSet)];
    }, [jobs]);

    // Filter jobs
    const filteredJobs = useMemo(() => {
        return jobs.filter(j => {
            const matchesSearch = j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 j.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDept = selectedDepartment === "All" || j.department === selectedDepartment;
            return matchesSearch && matchesDept;
        });
    }, [jobs, searchQuery, selectedDepartment]);

    return (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-150 transition-colors duration-300">
            {/* Career Header Banner */}
            <div className="relative overflow-hidden bg-primary py-16 px-6 text-center text-white border-b border-primary-hover">
                <div className="absolute inset-0 bg-grid-white/[0.05] pointer-events-none" />
                <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-xl" />
                <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
                
                <div className="relative max-w-3xl mx-auto space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5" /> Join Our Team
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight">{companyTitle} Careers</h1>
                    <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
                        Discover open opportunities and start your journey with us. We are looking for passionate, driven people to solve exciting problems.
                    </p>
                </div>
            </div>

            {/* Filter & Search Bar Section */}
            <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 md:p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by job title or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="flex-grow md:flex-none px-4 py-3 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-700 dark:text-gray-300"
                        >
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept === "All" ? "All Departments" : dept}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Jobs Listing */}
            <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-955 dark:text-white tracking-tight">
                        Open Positions ({filteredJobs.length})
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredJobs.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
                            <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                            <p className="text-base font-semibold text-gray-600 dark:text-gray-400">No active job listings found.</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Check back later or search for other keywords.</p>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <div 
                                key={job.id} 
                                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-6 rounded-2xl shadow-sm dark:shadow-none hover:shadow-md hover:border-primary/30 dark:hover:border-primary/20 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                                onClick={() => router.push(`/careers/${organizationSlug}/${job.slug}`)}
                            >
                                <div className="space-y-2.5">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-md">
                                            {job.department}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-gray-950 dark:text-white tracking-tight group-hover:text-primary transition-colors">
                                        {job.title}
                                    </h3>
                                    
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                            {job.location} {job.workMode ? `(${job.workMode})` : ""}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                            {job.employmentType}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Briefcase className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                            {job.experienceRequired}
                                        </span>
                                        {job.salaryRange && (
                                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-450">
                                                <Banknote className="w-3.5 h-3.5 shrink-0" />
                                                {job.salaryRange}
                                            </span>
                                        )}
                                        {job.deadline && (
                                            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-450">
                                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                Deadline: {new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-1 text-sm font-bold text-primary dark:text-primary group-hover:translate-x-1.5 transition-transform">
                                    View Details & Apply <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-850 py-8 text-center text-xs text-gray-450 dark:text-gray-500 mt-12 bg-white dark:bg-gray-900">
                &copy; {new Date().getFullYear()} {companyTitle}. Powered by HRMS Portal. All rights reserved.
            </div>
        </div>
    );
}
