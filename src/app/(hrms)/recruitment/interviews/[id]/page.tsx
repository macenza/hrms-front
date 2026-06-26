// src/app/(hrms)/recruitment/interviews/[id]/page.tsx
"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useInterviewById } from "@/hooks/api/useInterview";
import { 
    ArrowLeft, 
    Calendar, 
    Clock, 
    User, 
    Briefcase, 
    MapPin, 
    FileText, 
    Phone, 
    Mail, 
    Award, 
    ClipboardList, 
    CheckCircle2, 
    XCircle,
    ChevronRight,
    AlertCircle,
    UserCheck,
    CalendarCheck,
    ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/cn";
import { InterviewRound } from "@/components/recruitment/types";
import { toast } from "sonner";

export default function InterviewDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    // 1. Strict RBAC Enforcement
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || "employee";
    const isAdminOrHR = role === "admin" || role === "hr";

    useEffect(() => {
        if (isAuthenticated && !isAdminOrHR) {
            console.warn("Unauthorized access attempt. Redirecting to personal profile.");
            router.replace("/profile");
        }
    }, [isAuthenticated, isAdminOrHR, router]);

    // 2. Fetch Single Session Data
    const { data: interview, isLoading, error } = useInterviewById(id);

    // Prevent screen flash on redirect
    if (!isAuthenticated || !isAdminOrHR) return null;

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (error || !interview) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] flex flex-col items-center justify-center text-center p-6">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4 animate-pulse" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Interview Not Found</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                    The requested interview session record does not exist or you do not have permission to view it.
                </p>
                <Link 
                    href="/recruitment"
                    className="mt-6 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all"
                >
                    Back to Recruitment
                </Link>
            </div>
        );
    }

    const applicant = interview.applicantId as any;
    const job = interview.jobId as any;

    const getInterviewType = (round: InterviewRound) => {
        if (!round || !round.notes) return "Video Call";
        const match = round.notes.match(/\[Interview Type:\s*([^\]]+)\]/);
        return match ? match[1] : "Video Call";
    };

    const getCleanNotes = (notes?: string) => {
        if (!notes) return "";
        return notes.replace(/\[Interview Type:\s*[^\]]+\]/, "").trim();
    };

    const getStatusStyle = (status: string) => {
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

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Back Button */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.back()}
                        className="p-2.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Interview Evaluation Summary
                        </h1>
                        <div className="flex items-center gap-1.5 text-xs text-gray-450 dark:text-gray-500 mt-0.5">
                            <Link href="/recruitment" className="hover:underline">Recruitment Hub</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span>Interviews</span>
                            <ChevronRight className="w-3 h-3" />
                            <span>{applicant?.candidateName || "Candidate Details"}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Columns: Details & History */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section 1 & 2: Candidate & Job Details Combined Card */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800/80 pb-4">
                                <div className="space-y-1.5">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                                        <UserCheck className="w-3.5 h-3.5" /> Candidate Information
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {applicant?.candidateName || "Deleted Applicant"}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1.5">
                                            <Mail className="w-4 h-4 text-gray-450" />
                                            {applicant?.email || "—"}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Phone className="w-4 h-4 text-gray-450" />
                                            {applicant?.phone || "—"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1.5 shrink-0">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                                        <Briefcase className="w-3.5 h-3.5" /> Applied Position
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {job?.title || "Deleted Role"}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                            {job?.department || "Unassigned"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                            {job?.location || "N/A"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 7: General Recruitment Notes */}
                            {interview.notes && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">
                                        Interview Session Notes
                                    </h4>
                                    <div className="bg-gray-50 dark:bg-gray-855 rounded-xl p-4 border border-gray-150 dark:border-gray-800 text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic">
                                        "{interview.notes}"
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 4 & 5: Interview Rounds Timeline and Evaluations */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none space-y-6">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                                <CalendarCheck className="w-5 h-5 text-primary" /> Scheduled Rounds & Evaluator Feedback
                            </h3>

                            {interview.rounds && interview.rounds.length > 0 ? (
                                <div className="relative border-l border-gray-200 dark:border-gray-800/80 ml-3 pl-6 space-y-6">
                                    {interview.rounds.map((round) => {
                                        const interviewerName = round.interviewerIds && round.interviewerIds.length > 0
                                            ? round.interviewerIds.map(i => i.name).join(", ")
                                            : "Unassigned";
                                        const type = getInterviewType(round);
                                        const cleanNotes = getCleanNotes(round.notes);

                                        return (
                                            <div key={round.id || (round as any)._id} className="relative">
                                                {/* Left Node Connector */}
                                                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 bg-primary flex items-center justify-center shadow-sm">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                                </div>

                                                <div className="bg-gray-50/50 dark:bg-gray-855/30 border border-gray-100 dark:border-gray-800/80 rounded-xl p-4 space-y-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800/60 pb-2">
                                                        <div>
                                                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                                                                Round {round.roundNumber}
                                                            </span>
                                                            <h4 className="font-bold text-gray-805 dark:text-gray-200">
                                                                {round.roundType} Round
                                                            </h4>
                                                        </div>

                                                        <span className={cn(
                                                            "px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize",
                                                            round.status === "Completed" || round.status === "Evaluation-Completed"
                                                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400"
                                                                : round.status === "Failed"
                                                                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400"
                                                                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
                                                        )}>
                                                            {round.status.replace("-", " ")}
                                                        </span>
                                                    </div>

                                                    {/* Round Metadata Grid */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-450 font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span>
                                                                {new Date(round.scheduledTime).toLocaleString("en-US", {
                                                                    weekday: "short",
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span>{round.durationMinutes} Minutes Duration</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-gray-400" />
                                                            <span>Interviewer: {interviewerName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="w-4 h-4 text-gray-400" />
                                                            <span>Type: {type}</span>
                                                        </div>
                                                    </div>

                                                    {cleanNotes && (
                                                        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-3 text-xs text-gray-650 dark:text-gray-300 italic">
                                                            Round Notes: {cleanNotes}
                                                        </div>
                                                    )}

                                                     {round.candidateToken && (
                                                         <div className="bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/20 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                                                             <div className="min-w-0 flex-1 space-y-0.5">
                                                                 <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Candidate Secure Portal Link</span>
                                                                 <span className="font-mono text-gray-500 dark:text-gray-400 truncate block">
                                                                     {`${window.location.origin}/interview/${round.candidateToken}`}
                                                                 </span>
                                                             </div>
                                                             <button
                                                                 onClick={() => {
                                                                     navigator.clipboard.writeText(`${window.location.origin}/interview/${round.candidateToken}`);
                                                                     toast.success("Candidate portal link copied to clipboard!");
                                                                 }}
                                                                 className="px-3 py-1.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-800 font-bold rounded-lg shadow-sm transition-colors shrink-0"
                                                             >
                                                                 Copy Link
                                                             </button>
                                                         </div>
                                                     )}

                                                    {/* Evaluations Detail */}
                                                    {round.evaluations && round.evaluations.length > 0 && (
                                                        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                                                            <h5 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">
                                                                Evaluation Feedback Logs
                                                            </h5>
                                                            {round.evaluations.map((evalItem) => (
                                                                <div key={evalItem.id || (evalItem as any)._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 space-y-3">
                                                                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-2">
                                                                        <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                                                                            {evalItem.isAiEvaluated ? "🤖 Automated AI Audit" : "👨‍💼 Evaluator Review"}
                                                                        </span>
                                                                        <span className="font-bold text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20">
                                                                            Score: {evalItem.score}/100
                                                                        </span>
                                                                    </div>

                                                                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                                                        "{evalItem.detailedFeedback}"
                                                                    </p>

                                                                    {evalItem.strengths && evalItem.strengths.length > 0 && (
                                                                        <div className="text-xs space-y-1">
                                                                            <div className="font-bold text-green-600 dark:text-green-400">Strengths:</div>
                                                                            <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400 space-y-0.5">
                                                                                {evalItem.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                                                                            </ul>
                                                                        </div>
                                                                    )}

                                                                    {evalItem.weaknesses && evalItem.weaknesses.length > 0 && (
                                                                        <div className="text-xs space-y-1">
                                                                            <div className="font-bold text-red-500 dark:text-red-400">Areas of Improvement:</div>
                                                                            <ul className="list-disc pl-5 text-gray-500 dark:text-gray-400 space-y-0.5">
                                                                                {evalItem.weaknesses.map((weak, idx) => <li key={idx}>{weak}</li>)}
                                                                            </ul>
                                                                        </div>
                                                                    )}
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
                                <div className="text-center p-8 text-gray-400 bg-gray-50 dark:bg-gray-855 border border-gray-150 dark:border-gray-800 rounded-xl font-medium">
                                    No evaluation rounds scheduled yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right 1 Column: Overview, Score Card, Timeline Summary */}
                    <div className="space-y-6">
                        {/* Section 3: Interview Status & Recommendation Card */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">
                                Interview Session Overview
                            </h3>

                            {/* Status and Score Display */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-gray-500">Session Status:</span>
                                    <span className={cn(
                                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border gap-1.5",
                                        getStatusStyle(interview.status)
                                    )}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                        {interview.status === "Evaluation-Pending" ? "Evaluation Pending" : interview.status}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/80">
                                    <span className="text-sm font-semibold text-gray-500">Overall Score:</span>
                                    <span className="text-lg font-black text-gray-950 dark:text-white">
                                        {interview.overallScore ? `${interview.overallScore}/100` : "—"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/80">
                                    <span className="text-sm font-semibold text-gray-500">Recommendation:</span>
                                    <span className={cn(
                                        "px-2.5 py-0.5 rounded text-xs font-black border capitalize",
                                        interview.recommendation === "Hire"
                                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400"
                                            : interview.recommendation === "Reject"
                                                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400"
                                                : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400"
                                    )}>
                                        {interview.recommendation}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Timeline progression */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none space-y-4">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase tracking-wider">
                                Session Logs Timeline
                            </h3>

                            <div className="space-y-4 text-xs">
                                <div className="flex items-start gap-3">
                                    <div className="p-1.5 rounded-lg bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 shrink-0">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-905 dark:text-gray-200">Session Created</div>
                                        <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-0.5">
                                            {interview.createdAt ? new Date(interview.createdAt).toLocaleString("en-US") : "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 shrink-0">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-905 dark:text-gray-200">Last Modified</div>
                                        <p className="text-[10px] text-gray-455 dark:text-gray-500 mt-0.5">
                                            {interview.updatedAt ? new Date(interview.updatedAt).toLocaleString("en-US") : "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Access disclaimer */}
                        <div className="bg-red-50/30 dark:bg-red-955/5 border border-red-200/50 dark:border-red-900/10 rounded-2xl p-4 flex gap-3">
                            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <span className="text-xs font-bold text-red-800 dark:text-red-400">Strict HR/Admin Mode</span>
                                <p className="text-[11px] text-gray-450 dark:text-gray-500 mt-1 leading-relaxed">
                                    Access is restricted based on HRMS session policy. Direct link public access or third-party evaluations are disabled.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
