// src/components/recruitment/components/ShortlistedTab.tsx
"use client";

import React, { useState, useMemo } from "react";
import { 
    Search, 
    Calendar, 
    ArrowRight, 
    XCircle, 
    Eye, 
    Clock, 
    User, 
    BookOpen,
    X
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Applicant } from "../types";
import { toast } from "sonner";
import { useScheduleInterview } from "@/hooks/api/useInterview";

interface ShortlistedTabProps {
    applicants: Applicant[];
    onUpdateStatus: (id: string, name: string, status: Applicant['status']) => void;
    onViewApplication: (applicant: Applicant) => void;
}

export default function ShortlistedTab({
    applicants,
    onUpdateStatus,
    onViewApplication
}: ShortlistedTabProps) {
    const [searchQuery, setSearchQuery] = useState("");
    
    // Scheduler Modal State
    const [schedulingApplicant, setSchedulingApplicant] = useState<Applicant | null>(null);
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [roundType, setRoundType] = useState("Technical");
    const [interviewer, setInterviewer] = useState("");
    const [duration, setDuration] = useState("45");
    const [interviewType, setInterviewType] = useState("Video Call");
    const [notes, setNotes] = useState("");

    const scheduleInterviewMutation = useScheduleInterview();

    // Filter to only display 'Shortlisted' candidates
    const shortlistedCandidates = useMemo(() => {
        return applicants.filter(a => {
            const isShortlisted = a.status === "Shortlisted";
            const matchesSearch = 
                a.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.email.toLowerCase().includes(searchQuery.toLowerCase());
            return isShortlisted && matchesSearch;
        });
    }, [applicants, searchQuery]);

    // Handle open scheduling modal
    const handleOpenSchedule = (applicant: Applicant) => {
        setSchedulingApplicant(applicant);
        setScheduleDate("");
        setScheduleTime("");
        setRoundType("Technical");
        setInterviewer("");
        setDuration("45");
        setInterviewType("Video Call");
        setNotes("");
    };

    // Handle submit schedule
    const handleSubmitSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!schedulingApplicant) return;

        if (!scheduleDate || !scheduleTime) {
            toast.error("Date and time are required.");
            return;
        }

        const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        if (isNaN(scheduledDateTime.getTime())) {
            toast.error("Please enter a valid scheduled date and time.");
            return;
        }

        if (scheduledDateTime <= new Date()) {
            toast.error("Scheduled date and time must be in the future.");
            return;
        }

        if (!duration) {
            toast.error("Duration is required.");
            return;
        }

        if (!interviewer.trim()) {
            toast.error("Interviewer is required.");
            return;
        }

        const durationMinutes = parseInt(duration, 10);
        const formattedNotes = `[Interview Type: ${interviewType}]${notes.trim() ? ` ${notes.trim()}` : ""}`;

        const targetJobId = typeof schedulingApplicant.jobId === 'object' && schedulingApplicant.jobId
            ? (schedulingApplicant.jobId as any)._id || (schedulingApplicant.jobId as any).id
            : schedulingApplicant.jobId;

        const targetApplicantId = schedulingApplicant.id || (schedulingApplicant as any)._id;

        scheduleInterviewMutation.mutate({
            jobId: targetJobId,
            applicantId: targetApplicantId,
            roundData: {
                roundType,
                scheduledTime: scheduledDateTime.toISOString(),
                durationMinutes,
                interviewerName: interviewer.trim(),
                notes: formattedNotes
            }
        }, {
            onSuccess: () => {
                toast.success(
                    `Successfully scheduled ${roundType} round for ${schedulingApplicant.candidateName} with ${interviewer}.`
                );
                setSchedulingApplicant(null);
            },
            onError: (error: any) => {
                console.error("Failed to schedule interview:", error);
                const errMsg = error?.response?.data?.message || error?.message || "Failed to schedule interview.";
                toast.error(errMsg);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
                {/* Table Header and Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                            Shortlisted Candidates
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            Verify shortlisted applicants, schedule rounds, or move them along the hiring stages.
                        </p>
                    </div>

                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search shortlisted..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                        />
                    </div>
                </div>

                {/* Candidates Table */}
                <div className="overflow-x-auto border border-gray-100 dark:border-gray-800/80 rounded-xl">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                <th className="p-4">Candidate Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Applied Position</th>
                                <th className="p-4">Experience</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Applied Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {shortlistedCandidates.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center p-12 text-gray-400 dark:text-gray-500 font-medium">
                                        No shortlisted candidates found.
                                    </td>
                                </tr>
                            ) : (
                                shortlistedCandidates.map((applicant) => {
                                    const applicantId = applicant.id || (applicant as any)._id;
                                    return (
                                        <tr key={applicantId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                            <td className="p-4 font-bold text-gray-900 dark:text-gray-150">
                                                <div>{applicant.candidateName}</div>
                                                <span className="text-xs text-gray-450 dark:text-gray-500 font-normal block mt-0.5">
                                                    {applicant.phone}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium text-gray-600 dark:text-gray-300">
                                                {applicant.email}
                                            </td>
                                            <td className="p-4 font-semibold text-gray-650 dark:text-gray-300">
                                                {applicant.jobTitle}
                                            </td>
                                            <td className="p-4 font-semibold text-gray-600 dark:text-gray-350">
                                                {applicant.yearsOfExperience} {applicant.yearsOfExperience === 1 ? "year" : "years"}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                                    Shortlisted
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium text-gray-500 dark:text-gray-450">
                                                {new Date(applicant.appliedDate).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric"
                                                })}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Action: View Candidate */}
                                                    <button
                                                        onClick={() => onViewApplication(applicant)}
                                                        className="p-2 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                                                        title="View Candidate Profile"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {/* Action: Schedule Interview */}
                                                    <button
                                                        onClick={() => handleOpenSchedule(applicant)}
                                                        className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                                        title="Schedule Interview"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" /> Schedule
                                                    </button>

                                                    {/* Action: Move To Interview */}
                                                    <button
                                                        onClick={() => onUpdateStatus(applicantId, applicant.candidateName, "Interview")}
                                                        className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                                                        title="Move to Interview Stage"
                                                    >
                                                        <ArrowRight className="w-3.5 h-3.5" /> Move
                                                    </button>

                                                    {/* Action: Reject Candidate */}
                                                    <button
                                                        onClick={() => onUpdateStatus(applicantId, applicant.candidateName, "Rejected")}
                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-955/20 border border-transparent hover:border-red-200 dark:hover:border-red-550/20 rounded-lg transition-all"
                                                        title="Reject Candidate"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Scheduling Dialog Modal */}
            {schedulingApplicant && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-800">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                                    Schedule Interview
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Candidate: {schedulingApplicant.candidateName}
                                </p>
                            </div>
                            <button
                                onClick={() => setSchedulingApplicant(null)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 dark:text-gray-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmitSchedule} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider mb-1.5">
                                        Interview Type
                                    </label>
                                    <select
                                        value={interviewType}
                                        onChange={(e) => setInterviewType(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-55 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                    >
                                        <option value="Video Call">Video Call</option>
                                        <option value="In-Person">In-Person</option>
                                        <option value="Phone Call">Phone Call</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1.5">
                                        Duration
                                    </label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                    >
                                        <option value="30">30 Minutes</option>
                                        <option value="45">45 Minutes</option>
                                        <option value="60">60 Minutes</option>
                                        <option value="90">90 Minutes</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider mb-1.5">
                                    Round Type
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["Technical", "HR", "System-Coding", "System-MCQ", "AI-Video-Screening", "Behavioral"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setRoundType(type)}
                                            className={cn(
                                                "py-2 px-1 text-[11px] font-semibold rounded-xl border text-center transition-all truncate",
                                                roundType === type
                                                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                                                    : "bg-gray-50 dark:bg-gray-855 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            {type === "AI-Video-Screening" ? "AI Screening" : type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider mb-1.5">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={scheduleDate}
                                        onChange={(e) => setScheduleDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-555 uppercase tracking-wider mb-1.5">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={scheduleTime}
                                        onChange={(e) => setScheduleTime(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1.5">
                                    Interviewer
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Sarah Jenkins"
                                    value={interviewer}
                                    onChange={(e) => setInterviewer(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1.5">
                                    Notes
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add preparation notes or instructions..."
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-150 dark:border-gray-800">
                                <button
                                    type="button"
                                    disabled={scheduleInterviewMutation.isPending}
                                    onClick={() => setSchedulingApplicant(null)}
                                    className="flex-1 py-3 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={scheduleInterviewMutation.isPending}
                                    className="flex-1 py-3 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                >
                                    {scheduleInterviewMutation.isPending ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                            Scheduling...
                                        </>
                                    ) : (
                                        "Schedule & Move"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
