// src/components/recruitment/components/ApplicantsTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Search, ChevronDown, FileText, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { Applicant } from "../types";

interface ApplicantsTableProps {
    applicants: Applicant[];
    openDropdownId: string | null;
    onToggleDropdown: (e: React.MouseEvent, id: string) => void;
    onUpdateStatus: (id: string, name: string, status: Applicant['status']) => void;
    onViewApplication: (applicant: Applicant) => void;
    onDeleteApplicant: (id: string, name: string) => void;
}

const getApplicantRowHoverStyles = (status: Applicant['status']) => {
    switch (status) {
        case 'Applied':
            return 'hover:from-blue-50/70 hover:via-blue-50/20 hover:to-transparent dark:hover:from-blue-950/20 dark:hover:via-blue-950/5';
        case 'Shortlisted':
            return 'hover:from-purple-50/70 hover:via-purple-50/20 hover:to-transparent dark:hover:from-purple-950/20 dark:hover:via-purple-950/5';
        case 'Interview':
            return 'hover:from-amber-50/70 hover:via-amber-50/20 hover:to-transparent dark:hover:from-amber-950/20 dark:hover:via-amber-950/5';
        case 'Selected':
            return 'hover:from-emerald-50/70 hover:via-emerald-50/20 hover:to-transparent dark:hover:from-emerald-950/20 dark:hover:via-emerald-950/5';
        case 'Rejected':
            return 'hover:from-rose-50/70 hover:via-rose-50/20 hover:to-transparent dark:hover:from-rose-950/20 dark:hover:via-rose-950/5';
        default:
            return 'hover:from-slate-50/75 hover:via-slate-50/20 hover:to-transparent dark:hover:from-slate-900/20 dark:hover:via-slate-900/5';
    }
};

export default function ApplicantsTable({
    applicants,
    openDropdownId,
    onToggleDropdown,
    onUpdateStatus,
    onViewApplication,
    onDeleteApplicant
}: ApplicantsTableProps) {
    const [applicantSearch, setApplicantSearch] = useState("");
    const [applicantStatusFilter, setApplicantStatusFilter] = useState("All");

    // Filter Applicants locally
    const filteredApplicants = useMemo(() => {
        return applicants.filter(a => {
            const matchesSearch = a.candidateName.toLowerCase().includes(applicantSearch.toLowerCase()) ||
                                 a.jobTitle.toLowerCase().includes(applicantSearch.toLowerCase());
            const matchesStatus = applicantStatusFilter === "All" || a.status === applicantStatusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [applicants, applicantSearch, applicantStatusFilter]);

    return (
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
                            className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
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
                                <tr 
                                    key={applicant.id} 
                                    className={cn(
                                        "hover:bg-gradient-to-r hover:to-transparent cursor-pointer transition-all duration-205 group hover:translate-x-1",
                                        getApplicantRowHoverStyles(applicant.status)
                                    )}
                                >
                                    <td className="p-4 font-bold text-gray-900 dark:text-gray-150 relative">
                                        {/* Left Side Glowing Status Bar Indicator on hover */}
                                        <div className={cn(
                                            "absolute left-0 top-0 bottom-0 w-[4px] transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-center",
                                            applicant.status === "Applied" && "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.7)]",
                                            applicant.status === "Shortlisted" && "bg-purple-500 shadow-[0_0_12px_rgba(139,92,246,0.7)]",
                                            applicant.status === "Interview" && "bg-yellow-500 shadow-[0_0_12px_rgba(245,158,11,0.7)]",
                                            applicant.status === "Selected" && "bg-green-500 shadow-[0_0_12px_rgba(16,185,129,0.7)]",
                                            applicant.status === "Rejected" && "bg-red-500 shadow-[0_0_12px_rgba(244,63,94,0.7)]"
                                        )} />
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
                                            onClick={(e) => onToggleDropdown(e, applicant.id)}
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
                                                }}
                                            >
                                                {(['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'] as const).map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => {
                                                            onUpdateStatus(applicant.id, applicant.candidateName, status);
                                                        }}
                                                        className={cn(
                                                            "w-full text-left px-3 py-2 text-xs font-semibold transition-all flex items-center gap-2 hover:bg-gray-55 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
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
                                                onClick={() => onViewApplication(applicant)}
                                                className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                                            >
                                                <FileText className="w-3.5 h-3.5" /> View Application
                                            </button>
                                            <button
                                                onClick={() => onDeleteApplicant(applicant.id, applicant.candidateName)}
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
    );
}
