// src/components/recruitment/components/CandidateDetailsModal.tsx
"use client";

import React from "react";
import { 
    Briefcase, X, ChevronDown, MapPin, GraduationCap, Calendar, FileText, 
    Mail, Phone, Building, Coins, Clock, ExternalLink, ChevronRight 
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { cn } from "@/utils/cn";
import { Applicant } from "../types";

interface CandidateDetailsModalProps {
    applicant: Applicant;
    openModalDropdown: boolean;
    setOpenModalDropdown: (open: boolean) => void;
    onUpdateStatus: (status: Applicant['status']) => void;
    onDownloadFile: (data: string | undefined, name: string) => void;
    onClose: () => void;
}

export default function CandidateDetailsModal({
    applicant,
    openModalDropdown,
    setOpenModalDropdown,
    onUpdateStatus,
    onDownloadFile,
    onClose
}: CandidateDetailsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col p-6 md:p-8 animate-in zoom-in-95 max-h-[90vh] shadow-2xl transition-all duration-300" onClick={(e) => e.stopPropagation()}>
                
                {/* Header Block */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20 shrink-0 ring-4 ring-primary/10 dark:ring-primary/20">
                            {applicant.candidateName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{applicant.candidateName}</h3>
                                
                                {/* Dynamic Status Dropdown */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setOpenModalDropdown(!openModalDropdown)}
                                        className={cn(
                                            "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all shadow-sm gap-1.5 active:scale-95",
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
                                        {applicant.status}
                                        <ChevronDown className="w-3 h-3 opacity-60" />
                                    </button>
                                    
                                    {openModalDropdown && (
                                        <div className="absolute left-0 mt-1.5 w-36 bg-white dark:bg-[#12141c] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                            {(['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'] as const).map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => {
                                                        onUpdateStatus(status);
                                                    }}
                                                    className={cn(
                                                        "w-full text-left px-3 py-2 text-xs font-semibold transition-all flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-805 text-gray-700 dark:text-gray-300",
                                                        applicant.status === status && "bg-gray-55 dark:bg-gray-700 text-primary dark:text-white"
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
                                <span>Applied for <strong className="text-gray-750 dark:text-gray-200 font-bold">{applicant.jobTitle}</strong></span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-605 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-xl transition-all self-start sm:self-center">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Scrollable Modal Content */}
                <div className="flex-1 py-6 overflow-y-auto max-h-[70vh] custom-scrollbar text-sm text-gray-700 dark:text-gray-300 pr-1">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Left Two Columns: Professional profile details & documents & Screening questions */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Application details grids */}
                            <div className="bg-gray-50/50 dark:bg-gray-955/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Professional Profile</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800/80 hover:shadow-sm hover:border-primary/20 dark:hover:border-primary/30 transition-all">
                                        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-555 block uppercase tracking-wider">Current Location</span>
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{applicant.currentLocation || "N/A"}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800/80 hover:shadow-sm hover:border-primary/20 dark:hover:border-primary/30 transition-all">
                                        <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                            <GraduationCap className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-555 block uppercase tracking-wider">Qualification</span>
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{applicant.highestQualification || "N/A"}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3.5 p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800/80 hover:shadow-sm hover:border-primary/20 dark:hover:border-primary/30 transition-all">
                                        <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-555 block uppercase tracking-wider">Experience</span>
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                                {applicant.yearsOfExperience === 0 ? "Fresher (0 Years)" : `${applicant.yearsOfExperience} Years`}
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
                                                {applicant.availableStartDate ? new Date(applicant.availableStartDate).toLocaleDateString("en-US", {
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
                                    <div className="bg-white dark:bg-gray-900 border border-gray-105 dark:border-gray-800 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 truncate pr-2">
                                            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-505 shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="truncate">
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Candidate Resume</span>
                                                <span className="text-xs font-bold text-gray-850 dark:text-gray-200 truncate block">{applicant.resumeName}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => onDownloadFile(applicant.resumeData, applicant.resumeName)} 
                                            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-primary/20 transition-all shrink-0 active:scale-95"
                                        >
                                            Download
                                        </button>
                                    </div>
                                    
                                    {/* Cover Letter Card */}
                                    {applicant.coverLetterName ? (
                                        <div className="bg-white dark:bg-gray-900 border border-gray-105 dark:border-gray-800 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 truncate pr-2">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="truncate">
                                                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Cover Letter File</span>
                                                    <span className="text-xs font-bold text-gray-855 dark:text-gray-200 truncate block">{applicant.coverLetterName}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => onDownloadFile(applicant.coverLetterData, applicant.coverLetterName!)} 
                                                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md shadow-primary/20 transition-all shrink-0 active:scale-95"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="border border-dashed border-gray-250 dark:border-gray-800 p-4 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-550 text-xs italic bg-white dark:bg-gray-900">
                                            No cover letter file uploaded
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Screening Questions section (Moved to Last) */}
                            <div className="bg-gray-50/50 dark:bg-gray-955/40 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Screening Questions & Answers</h4>
                                {!applicant.screeningAnswers || applicant.screeningAnswers.length === 0 ? (
                                    <p className="text-xs text-gray-455 dark:text-gray-500 italic p-6 bg-white dark:bg-gray-905 rounded-xl text-center border border-dashed border-gray-205 dark:border-gray-800">
                                        No screening questions were set for this position or answered by candidate.
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {applicant.screeningAnswers.map((ans, idx) => (
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
                                            <a href={`mailto:${applicant.email}`} className="text-xs font-bold text-primary hover:underline truncate block">{applicant.email}</a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0 mt-0.5">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-455 dark:text-gray-500 block">Phone Number</span>
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-250 block">{applicant.phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-455 dark:text-gray-500 block">Applied Date</span>
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                                                {new Date(applicant.appliedDate).toLocaleString("en-US", {
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
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{applicant.currentCompany || "None (Fresher)"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                                            <Coins className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-455 dark:text-gray-550 block">Current CTC</span>
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{applicant.currentCtc || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5">
                                            <Coins className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-455 dark:text-gray-550 block">Expected CTC</span>
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{applicant.expectedCtc || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-455 shrink-0 mt-0.5">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-455 dark:text-gray-550 block">Notice Period</span>
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{applicant.noticePeriod || "None"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Social & Portfolio Links Card */}
                            {(applicant.portfolioUrl || applicant.gitHubProfile || applicant.linkedInProfile) && (
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-550">Profiles & Links</h4>
                                    <div className="flex flex-col gap-2">
                                        {applicant.portfolioUrl && (
                                            <a 
                                                href={applicant.portfolioUrl} 
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
                                        {applicant.gitHubProfile && (
                                            <a 
                                                href={applicant.gitHubProfile} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-center justify-between px-3 py-2 bg-gray-55 dark:bg-gray-800/40 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all border border-gray-200 dark:border-gray-750 active:scale-95"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <FaGithub className="w-3.5 h-3.5" />
                                                    <span>GitHub Profile</span>
                                                </span>
                                                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                            </a>
                                        )}
                                        {applicant.linkedInProfile && (
                                            <a 
                                                href={applicant.linkedInProfile} 
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
                                    "{applicant.notes || "No notes submitted by candidate."}"
                                </div>
                            </div>
                            
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}
