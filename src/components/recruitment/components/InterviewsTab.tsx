// src/components/recruitment/components/InterviewsTab.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
    Search, 
    Calendar, 
    Clock, 
    User, 
    Eye, 
    Edit, 
    CheckCircle2, 
    XCircle, 
    Play, 
    ChevronLeft, 
    ChevronRight,
    FileText,
    MapPin,
    Briefcase,
    X,
    Filter,
    RotateCcw,
    AlertCircle,
    Copy
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Interview, InterviewRound, JobOpening } from "../types";
import { 
    useInterviews, 
    useUpdateInterview, 
    useUpdateInterviewRound 
} from "@/hooks/api/useInterview";
import { toast } from "sonner";

interface InterviewsTabProps {
    jobs: JobOpening[];
}

export default function InterviewsTab({ jobs }: InterviewsTabProps) {
    const router = useRouter();
    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [jobFilter, setJobFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [interviewerFilter, setInterviewerFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal States
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [reschedulingRound, setReschedulingRound] = useState<{
        interviewId: string;
        round: InterviewRound;
    } | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState("");
    const [rescheduleTime, setRescheduleTime] = useState("");
    const [rescheduleDuration, setRescheduleDuration] = useState("45");
    const [rescheduleInterviewer, setRescheduleInterviewer] = useState("");
    const [viewingEvaluationRound, setViewingEvaluationRound] = useState<InterviewRound | null>(null);

    // Queries & Mutations
    const { data: responseData, isLoading, refetch } = useInterviews({ limit: 1000 });
    const interviews = responseData?.data || [];

    const updateInterviewMutation = useUpdateInterview();
    const updateRoundMutation = useUpdateInterviewRound();

    // Helper functions for round parsing
    const getInterviewType = (round: InterviewRound) => {
        if (!round || !round.notes) return "Video Call";
        const match = round.notes.match(/\[Interview Type:\s*([^\]]+)\]/);
        return match ? match[1] : "Video Call";
    };

    const getCleanNotes = (notes?: string) => {
        if (!notes) return "";
        return notes.replace(/\[Interview Type:\s*[^\]]+\]/, "").trim();
    };

    // Filter Logic
    const filteredInterviews = useMemo(() => {
        return interviews.filter(item => {
            const applicant = item.applicantId as any;
            const job = item.jobId as any;

            // 1. Search (Candidate Name or Email)
            const name = applicant?.candidateName || "";
            const email = applicant?.email || "";
            const matchesSearch = 
                name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                email.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            // 2. Status
            if (statusFilter && item.status !== statusFilter) return false;

            // 3. Job Position
            if (jobFilter && (job?._id !== jobFilter && job?.id !== jobFilter)) return false;

            // Latest Round Specific Filters
            const latestRound = item.rounds && item.rounds.length > 0 
                ? item.rounds[item.rounds.length - 1] 
                : null;

            // 4. Interview Type (Video Call, In-Person, Phone Call)
            if (typeFilter && latestRound) {
                const type = getInterviewType(latestRound);
                if (type !== typeFilter) return false;
            } else if (typeFilter && !latestRound) {
                return false;
            }

            // 5. Interviewer Name
            if (interviewerFilter && latestRound) {
                const interviewerName = latestRound.interviewerIds && latestRound.interviewerIds.length > 0
                    ? latestRound.interviewerIds.map(i => i.name).join(", ")
                    : "";
                if (!interviewerName.toLowerCase().includes(interviewerFilter.toLowerCase())) return false;
            } else if (interviewerFilter && !latestRound) {
                return false;
            }

            // 6. Date Range
            if (latestRound && latestRound.scheduledTime) {
                const scheduledDate = new Date(latestRound.scheduledTime);
                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (scheduledDate < start) return false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (scheduledDate > end) return false;
                }
            } else if ((startDate || endDate) && !latestRound) {
                return false;
            }

            return true;
        });
    }, [interviews, searchQuery, statusFilter, jobFilter, typeFilter, interviewerFilter, startDate, endDate]);

    // Client-side Pagination
    const ITEMS_PER_PAGE = 8;
    const totalPages = Math.ceil(filteredInterviews.length / ITEMS_PER_PAGE);
    const paginatedInterviews = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredInterviews.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredInterviews, currentPage]);

    // Reset Filters
    const handleResetFilters = () => {
        setSearchQuery("");
        setStatusFilter("");
        setJobFilter("");
        setTypeFilter("");
        setInterviewerFilter("");
        setStartDate("");
        setEndDate("");
        setCurrentPage(1);
        toast.info("Filters cleared.");
    };

    // Actions
    const handleStartInterview = (interviewId: string, roundId: string, candidateName: string) => {
        toast.promise(
            Promise.all([
                updateInterviewMutation.mutateAsync({
                    id: interviewId,
                    payload: { status: "In-Progress" }
                }),
                updateRoundMutation.mutateAsync({
                    interviewId,
                    roundId,
                    payload: { status: "In-Progress" }
                })
            ]),
            {
                loading: "Starting interview session...",
                success: `Interview session with ${candidateName} has started!`,
                error: "Failed to start interview session."
            }
        );
    };

    const handleCancelInterview = (interviewId: string, candidateName: string) => {
        if (confirm(`Are you sure you want to cancel the interview for ${candidateName}?`)) {
            updateInterviewMutation.mutate({
                id: interviewId,
                payload: { status: "Cancelled" }
            }, {
                onSuccess: () => {
                    toast.success(`Interview for ${candidateName} has been cancelled.`);
                },
                onError: () => {
                    toast.error("Failed to cancel interview.");
                }
            });
        }
    };

    const handleCopyLink = (round: InterviewRound | null) => {
        const token = round?.candidateToken;
        if (!token) {
            toast.error("No token generated for this round yet.");
            return;
        }
        const url = `${window.location.origin}/interview/${token}`;
        navigator.clipboard.writeText(url);
        toast.success("Candidate interview portal link copied to clipboard!");
    };

    const handleOpenReschedule = (interviewId: string, round: InterviewRound) => {
        setReschedulingRound({ interviewId, round });
        
        // Parse current round date/time
        if (round.scheduledTime) {
            const dt = new Date(round.scheduledTime);
            const dateStr = dt.toISOString().split("T")[0];
            const timeStr = dt.toTimeString().split(" ")[0].substring(0, 5);
            setRescheduleDate(dateStr);
            setRescheduleTime(timeStr);
        } else {
            setRescheduleDate("");
            setRescheduleTime("");
        }
        setRescheduleDuration(round.durationMinutes ? String(round.durationMinutes) : "45");
        
        const currentInterviewer = round.interviewerIds && round.interviewerIds.length > 0
            ? round.interviewerIds[0].name
            : "";
        setRescheduleInterviewer(currentInterviewer);
    };

    const handleSaveReschedule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reschedulingRound) return;

        if (!rescheduleDate || !rescheduleTime) {
            toast.error("Please provide both Date and Time.");
            return;
        }

        const scheduledDateTime = new Date(`${rescheduleDate}T${rescheduleTime}`);
        if (isNaN(scheduledDateTime.getTime())) {
            toast.error("Please enter a valid scheduled date and time.");
            return;
        }

        if (scheduledDateTime <= new Date()) {
            toast.error("Rescheduled date and time must be in the future.");
            return;
        }

        if (!rescheduleInterviewer.trim()) {
            toast.error("Interviewer name is required.");
            return;
        }

        updateRoundMutation.mutate({
            interviewId: reschedulingRound.interviewId,
            roundId: reschedulingRound.round.id || (reschedulingRound.round as any)._id,
            payload: {
                scheduledTime: scheduledDateTime.toISOString(),
                durationMinutes: parseInt(rescheduleDuration, 10),
                interviewerName: rescheduleInterviewer.trim()
            }
        }, {
            onSuccess: () => {
                toast.success("Interview round rescheduled successfully.");
                setReschedulingRound(null);
            },
            onError: (err: any) => {
                console.error(err);
                toast.error("Failed to reschedule interview round.");
            }
        });
    };

    const getStatusStyle = (status: Interview['status']) => {
        switch (status) {
            case "Scheduled":
                return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
            case "In-Progress":
                return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
            case "Completed":
                return "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20";
            case "Cancelled":
                return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20";
            case "Evaluation-Pending":
                return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20";
        }
    };

    if (isLoading) {
        return (
            <div className="h-64 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Panel */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" /> Filter Interviews
                    </h3>
                    <button 
                        onClick={handleResetFilters}
                        className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-semibold"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Search query */}
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search candidate name, email..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                        />
                    </div>

                    {/* Job opening filter */}
                    <select
                        value={jobFilter}
                        onChange={(e) => { setJobFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 rounded-xl bg-gray-55 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                    >
                        <option value="">All Job Positions</option>
                        {jobs.map((job) => (
                            <option key={job.id} value={job.id}>{job.title}</option>
                        ))}
                    </select>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 rounded-xl bg-gray-55 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                    >
                        <option value="">All Statuses</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In-Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Evaluation-Pending">Evaluation Pending</option>
                    </select>

                    {/* Interview type filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 rounded-xl bg-gray-55 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                    >
                        <option value="">All Interview Types</option>
                        <option value="Video Call">Video Call</option>
                        <option value="In-Person">In-Person</option>
                        <option value="Phone Call">Phone Call</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100 dark:border-gray-800/60">
                    {/* Interviewer filter */}
                    <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Filter by Interviewer..."
                            value={interviewerFilter}
                            onChange={(e) => { setInterviewerFilter(e.target.value); setCurrentPage(1); }}
                            className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                        />
                    </div>

                    {/* Start Date */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-405 dark:text-gray-500 font-bold uppercase tracking-wider min-w-[70px]">
                            From Date
                        </span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                            className="px-3 py-2 rounded-xl bg-gray-55 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                        />
                    </div>

                    {/* End Date */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-405 dark:text-gray-500 font-bold uppercase tracking-wider min-w-[70px]">
                            To Date
                        </span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                            className="px-3 py-2 rounded-xl bg-gray-55 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                        />
                    </div>
                </div>
            </div>

            {/* Interviews Table / Card Board */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                            Interview Panel
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            Showing {filteredInterviews.length} total scheduled evaluations.
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto border border-gray-100 dark:border-gray-800/80 rounded-xl">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-550 text-[10px] font-bold uppercase tracking-wider">
                                <th className="p-4">Candidate Name</th>
                                <th className="p-4">Job Position</th>
                                <th className="p-4">Interview Type</th>
                                <th className="p-4">Round Type</th>
                                <th className="p-4">Scheduled Date</th>
                                <th className="p-4">Duration</th>
                                <th className="p-4">Interviewer</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                            {paginatedInterviews.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center p-12 text-gray-400 dark:text-gray-505 font-medium">
                                        No interviews found matching the search criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedInterviews.map((interview) => {
                                    const applicant = interview.applicantId as any;
                                    const job = interview.jobId as any;
                                    const latestRound = interview.rounds && interview.rounds.length > 0 
                                        ? interview.rounds[interview.rounds.length - 1] 
                                        : null;

                                    const intType = latestRound ? getInterviewType(latestRound) : "Video Call";
                                    const intRoundType = latestRound ? latestRound.roundType : "Technical";
                                    const interviewerName = latestRound && latestRound.interviewerIds && latestRound.interviewerIds.length > 0
                                        ? latestRound.interviewerIds.map(i => i.name).join(", ")
                                        : "Unassigned";
                                    
                                    const rawId = interview.id || (interview as any)._id;

                                    return (
                                        <tr key={rawId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                            {/* Candidate Name */}
                                            <td className="p-4 font-bold text-gray-900 dark:text-gray-150">
                                                <div>{applicant?.candidateName || "Deleted Candidate"}</div>
                                                <span className="text-xs text-gray-450 dark:text-gray-500 font-normal block mt-0.5">
                                                    {applicant?.email}
                                                </span>
                                            </td>

                                            {/* Job Position */}
                                            <td className="p-4 font-semibold text-gray-655 dark:text-gray-300">
                                                {job?.title || "Deleted Job"}
                                            </td>

                                            {/* Interview Type */}
                                            <td className="p-4 font-medium text-gray-650 dark:text-gray-355">
                                                {intType}
                                            </td>

                                            {/* Round Type */}
                                            <td className="p-4">
                                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                    {intRoundType}
                                                </span>
                                            </td>

                                            {/* Scheduled Date */}
                                            <td className="p-4 font-medium text-gray-500 dark:text-gray-450">
                                                {latestRound?.scheduledTime ? (
                                                    new Date(latestRound.scheduledTime).toLocaleString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })
                                                ) : "Not scheduled"}
                                            </td>

                                            {/* Duration */}
                                            <td className="p-4 font-medium text-gray-500 dark:text-gray-450">
                                                {latestRound?.durationMinutes ? `${latestRound.durationMinutes} mins` : "—"}
                                            </td>

                                            {/* Interviewer */}
                                            <td className="p-4 font-semibold text-gray-650 dark:text-gray-355">
                                                {interviewerName}
                                            </td>

                                            {/* Status */}
                                            <td className="p-4">
                                                <span className={cn(
                                                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border gap-1.5",
                                                    getStatusStyle(interview.status)
                                                )}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    {interview.status === "Evaluation-Pending" ? "Evaluation Pending" : interview.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* View Detail Modal */}
                                                    <button
                                                        onClick={() => router.push(`/recruitment/interviews/${rawId}`)}
                                                        className="p-2 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-105 dark:hover:bg-gray-800 rounded-lg transition-all"
                                                        title="View Interview Timeline"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {/* Copy Candidate Link (only if scheduled or in progress) */}
                                                    {(interview.status === "Scheduled" || interview.status === "In-Progress") && latestRound && (
                                                        <button
                                                            onClick={() => handleCopyLink(latestRound)}
                                                            className="p-2 border border-gray-200 dark:border-gray-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-955/20 rounded-lg transition-all"
                                                            title="Copy Candidate Portal Link"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* View Evaluation (if completed or pending evaluation) */}
                                                    {latestRound && latestRound.evaluations && latestRound.evaluations.length > 0 && (
                                                        <button
                                                            onClick={() => setViewingEvaluationRound(latestRound)}
                                                            className="p-2 border border-gray-200 dark:border-gray-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-955/20 rounded-lg transition-all"
                                                            title="View Candidate Feedback"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* Start Interview (only if scheduled) */}
                                                    {interview.status === "Scheduled" && latestRound && (
                                                        <button
                                                            onClick={() => handleStartInterview(rawId, latestRound.id || (latestRound as any)._id, applicant?.candidateName)}
                                                            className="p-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20 rounded-lg transition-all"
                                                            title="Start Interview"
                                                        >
                                                            <Play className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* Reschedule Round (if scheduled or in progress) */}
                                                    {(interview.status === "Scheduled" || interview.status === "In-Progress") && latestRound && (
                                                        <button
                                                            onClick={() => handleOpenReschedule(rawId, latestRound)}
                                                            className="p-2 border border-gray-200 dark:border-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-955/20 rounded-lg transition-all"
                                                            title="Reschedule Interview"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    {/* Cancel Interview (if scheduled or in progress) */}
                                                    {(interview.status === "Scheduled" || interview.status === "In-Progress") && (
                                                        <button
                                                            onClick={() => handleCancelInterview(rawId, applicant?.candidateName)}
                                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-955/20 border border-transparent hover:border-red-200 dark:hover:border-red-550/20 rounded-lg transition-all"
                                                            title="Cancel Interview"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs text-gray-500">
                            Page {currentPage} of {totalPages}
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-555 dark:text-gray-400 hover:bg-gray-55 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: totalPages }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={cn(
                                        "px-3 py-1 text-xs font-bold rounded-lg border transition-colors",
                                        currentPage === idx + 1
                                            ? "bg-primary text-white border-primary"
                                            : "border-gray-200 dark:border-gray-800 text-gray-555 dark:text-gray-400 hover:bg-gray-55 dark:hover:bg-gray-800"
                                    )}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-555 dark:text-gray-400 hover:bg-gray-55 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: View Details */}
            {selectedInterview && (() => {
                const applicant = selectedInterview.applicantId as any;
                const job = selectedInterview.jobId as any;
                return (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-150 dark:border-gray-800 shrink-0">
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                                        Interview Session Details
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Candidate: {applicant?.candidateName || "Deleted Candidate"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedInterview(null)}
                                    className="p-1.5 hover:bg-gray-105 dark:hover:bg-gray-800 rounded-lg text-gray-400 dark:text-gray-505 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
                                {/* Basic Info Card */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-855 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <Briefcase className="w-4 h-4 text-primary" />
                                            <span className="font-semibold">{job?.title || "Deleted Job"}</span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Department: {job?.department || "N/A"}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <span className="font-semibold">{job?.location || "N/A"}</span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Status: <span className="capitalize">{selectedInterview.status.replace("-", " ")}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rounds Timeline */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                                        Evaluation History & Rounds
                                    </h4>

                                    {selectedInterview.rounds && selectedInterview.rounds.length > 0 ? (
                                        <div className="relative border-l border-gray-200 dark:border-gray-850 ml-3 pl-6 space-y-6">
                                            {selectedInterview.rounds.map((round) => {
                                                const interviewerName = round.interviewerIds && round.interviewerIds.length > 0
                                                    ? round.interviewerIds.map(i => i.name).join(", ")
                                                    : "Unassigned";
                                                const type = getInterviewType(round);
                                                const cleanNotes = getCleanNotes(round.notes);

                                                return (
                                                    <div key={round.id || (round as any)._id} className="relative">
                                                        {/* Node Dot */}
                                                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 bg-primary flex items-center justify-center shadow-sm">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                                        </div>

                                                        {/* Round card */}
                                                        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 dark:border-gray-855 pb-2 mb-2">
                                                                <div className="font-bold text-gray-800 dark:text-gray-200">
                                                                    Round {round.roundNumber}: {round.roundType}
                                                                </div>
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded text-[10px] font-bold border capitalize",
                                                                    round.status === "Completed" || round.status === "Evaluation-Completed"
                                                                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10"
                                                                        : round.status === "Failed"
                                                                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10"
                                                                            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10"
                                                                )}>
                                                                    {round.status.replace("-", " ")}
                                                                </span>
                                                            </div>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                                    <span>
                                                                        {new Date(round.scheduledTime).toLocaleString("en-US", {
                                                                            weekday: "short",
                                                                            month: "short",
                                                                            day: "numeric",
                                                                            hour: "2-digit",
                                                                            minute: "2-digit"
                                                                        })}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                                    <span>{round.durationMinutes} minutes duration</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                                                    <span>Interviewer: {interviewerName}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                                                                    <span>Type: {type}</span>
                                                                </div>
                                                            </div>

                                                            {cleanNotes && (
                                                                <div className="mt-3 bg-gray-50 dark:bg-gray-855 rounded-lg p-2.5 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 italic">
                                                                    Notes: {cleanNotes}
                                                                </div>
                                                            )}

                                                            {/* Evaluations list */}
                                                            {round.evaluations && round.evaluations.length > 0 && (
                                                                <div className="mt-3 border-t border-gray-105 dark:border-gray-855 pt-3 space-y-2">
                                                                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                                        Evaluations Summary
                                                                    </div>
                                                                    {round.evaluations.map((evalItem) => (
                                                                        <div key={evalItem.id || (evalItem as any)._id} className="text-xs bg-purple-50/40 dark:bg-purple-955/10 border border-purple-100/50 dark:border-purple-900/20 rounded-lg p-2.5 text-gray-700 dark:text-gray-300">
                                                                            <div className="flex items-center justify-between mb-1.5">
                                                                                <span className="font-semibold text-purple-700 dark:text-purple-400">
                                                                                    {evalItem.isAiEvaluated ? "Automated AI Assistant" : "Human Interviewer Evaluation"}
                                                                                </span>
                                                                                <span className="font-bold text-xs">
                                                                                    Score: {evalItem.score}/100
                                                                                </span>
                                                                            </div>
                                                                            <div className="leading-relaxed">
                                                                                {evalItem.detailedFeedback}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 text-gray-400 bg-gray-50 dark:bg-gray-855 border border-gray-105 dark:border-gray-800 rounded-xl">
                                            No evaluation rounds recorded yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-gray-150 dark:border-gray-800 shrink-0">
                                <button
                                    onClick={() => setSelectedInterview(null)}
                                    className="w-full py-3 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Close details
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Modal: Reschedule */}
            {reschedulingRound && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-150 dark:border-gray-800">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                                    Reschedule Interview
                                </h3>
                                <p className="text-xs text-gray-550 dark:text-gray-400 mt-0.5">
                                    Rescheduling: Round {reschedulingRound.round.roundNumber} ({reschedulingRound.round.roundType})
                                </p>
                            </div>
                            <button
                                onClick={() => setReschedulingRound(null)}
                                className="p-1.5 hover:bg-gray-105 dark:hover:bg-gray-800 rounded-lg text-gray-400 dark:text-gray-550 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSaveReschedule} className="space-y-4 mt-4 text-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1.5">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={rescheduleDate}
                                        onChange={(e) => setRescheduleDate(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1.5">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={rescheduleTime}
                                        onChange={(e) => setRescheduleTime(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1.5">
                                    Duration
                                </label>
                                <select
                                    value={rescheduleDuration}
                                    onChange={(e) => setRescheduleDuration(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                >
                                    <option value="30">30 Minutes</option>
                                    <option value="45">45 Minutes</option>
                                    <option value="60">60 Minutes</option>
                                    <option value="90">90 Minutes</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider mb-1.5">
                                    Interviewer Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Sarah Jenkins"
                                    value={rescheduleInterviewer}
                                    onChange={(e) => setRescheduleInterviewer(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-855 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-gray-200"
                                />
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-150 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setReschedulingRound(null)}
                                    disabled={updateRoundMutation.isPending}
                                    className="flex-1 py-3 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateRoundMutation.isPending}
                                    className="flex-1 py-3 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                                >
                                    {updateRoundMutation.isPending ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Reschedule"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: View Evaluations */}
            {viewingEvaluationRound && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-150 dark:border-gray-800 shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                                    Round evaluations
                                </h3>
                                <p className="text-xs text-gray-550 dark:text-gray-400 mt-0.5">
                                    Round {viewingEvaluationRound.roundNumber} ({viewingEvaluationRound.roundType}) Feedback Log
                                </p>
                            </div>
                            <button
                                onClick={() => setViewingEvaluationRound(null)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-805 rounded-lg text-gray-400 dark:text-gray-555 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-sm">
                            {viewingEvaluationRound.evaluations && viewingEvaluationRound.evaluations.length > 0 ? (
                                viewingEvaluationRound.evaluations.map((evalItem) => (
                                    <div key={evalItem.id || (evalItem as any)._id} className="border border-gray-100 dark:border-gray-800 rounded-2xl p-4 bg-gray-55 dark:bg-gray-855 space-y-3">
                                        <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-850 pb-2">
                                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                                {evalItem.isAiEvaluated ? "🤖 AI Evaluation Audit" : "👨‍💼 Human Evaluator Feedback"}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10">
                                                Score: {evalItem.score}/100
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="font-bold text-xs text-gray-400 dark:text-gray-550 uppercase tracking-wider">
                                                Detailed Comments
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                                "{evalItem.detailedFeedback}"
                                            </p>
                                        </div>

                                        {evalItem.strengths && evalItem.strengths.length > 0 && (
                                            <div className="space-y-1.5">
                                                <div className="font-bold text-xs text-green-600 dark:text-green-400 uppercase tracking-wider">
                                                    Strengths
                                                </div>
                                                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-450 space-y-1">
                                                    {evalItem.strengths.map((str, idx) => (
                                                        <li key={idx}>{str}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {evalItem.weaknesses && evalItem.weaknesses.length > 0 && (
                                            <div className="space-y-1.5">
                                                <div className="font-bold text-xs text-red-500 dark:text-red-400 uppercase tracking-wider">
                                                    Areas of Improvement
                                                </div>
                                                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-450 space-y-1">
                                                    {evalItem.weaknesses.map((weak, idx) => (
                                                        <li key={idx}>{weak}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-55 dark:bg-gray-855 rounded-2xl border border-gray-105 dark:border-gray-800">
                                    <AlertCircle className="w-8 h-8 text-gray-400 mb-2" />
                                    <div className="text-gray-550 dark:text-gray-400 font-medium">
                                        No evaluations uploaded for this round yet.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-150 dark:border-gray-800 shrink-0">
                            <button
                                onClick={() => setViewingEvaluationRound(null)}
                                className="w-full py-3 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Close Evaluations
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
