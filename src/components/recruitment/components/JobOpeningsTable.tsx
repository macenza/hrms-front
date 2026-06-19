// src/components/recruitment/components/JobOpeningsTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Search, Eye, Edit2, Play, Trash2, X, Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/utils/cn";
import { JobOpening } from "../types";

interface JobOpeningsTableProps {
    jobs: JobOpening[];
    organizationSlug: string;
    copiedJobId: string | null;
    onCopyUrl: (slug: string, id: string) => void;
    onViewDetails: (job: JobOpening) => void;
    onEdit: (job: JobOpening) => void;
    onLaunch: (id: string) => void;
    onClose: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function JobOpeningsTable({
    jobs,
    organizationSlug,
    copiedJobId,
    onCopyUrl,
    onViewDetails,
    onEdit,
    onLaunch,
    onClose,
    onDelete
}: JobOpeningsTableProps) {
    const [jobSearch, setJobSearch] = useState("");
    const [jobStatusFilter, setJobStatusFilter] = useState("All");

    // Filter Jobs locally
    const filteredJobs = useMemo(() => {
        return jobs.filter(j => {
            const matchesSearch = j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
                                 j.department.toLowerCase().includes(jobSearch.toLowerCase());
            const matchesStatus = jobStatusFilter === "All" || j.status === jobStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [jobs, jobSearch, jobStatusFilter]);

    return (
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
                                                    onClick={() => onCopyUrl(job.slug, job.id)}
                                                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                                                    title="Copy Public Link"
                                                >
                                                    {copiedJobId === job.id ? <Check className="w-4 h-4 text-green-500 animate-in zoom-in" /> : <Copy className="w-4 h-4" />}
                                                    <span>Link</span>
                                                </button>
                                            )}
                                            
                                            <button
                                                onClick={() => onViewDetails(job)}
                                                className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-150 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                title="View Job Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(job)}
                                                className="p-2 text-gray-505 hover:text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                                title="Edit Job"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            
                                            {job.status !== "Active" ? (
                                                <button
                                                    onClick={() => onLaunch(job.id)}
                                                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                                                    title="Launch Job"
                                                >
                                                    <Play className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onClose(job.id)}
                                                    className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                                                    title="Close Job"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                            
                                            <button
                                                onClick={() => onDelete(job.id)}
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
    );
}
