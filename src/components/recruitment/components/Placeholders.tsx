// src/components/recruitment/components/Placeholders.tsx
import React from "react";
import { UserCheck, Calendar, BarChart3, Award, Sparkles } from "lucide-react";

interface PlaceholderProps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

function PremiumPlaceholder({ title, description, icon }: PlaceholderProps) {
    return (
        <div className="w-full flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-6 shrink-0 transition-transform hover:scale-105 duration-300">
                {icon}
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-white border border-white dark:border-gray-900 animate-bounce">
                    <Sparkles className="w-3 h-3" />
                </div>
            </div>
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50 tracking-wider uppercase mb-3 select-none">
                Development in Progress
            </span>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                {title}
            </h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mt-2 leading-relaxed transition-colors font-medium">
                {description}
            </p>
            
            <div className="mt-8 flex gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500/80 animate-ping delay-75" />
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500/60 animate-ping delay-150" />
            </div>
        </div>
    );
}

export function ShortlistedTab() {
    return (
        <PremiumPlaceholder
            title="Shortlisted Candidates"
            description="Process shortlisted applicants, schedule secondary screen evaluations, and record initial feedback from recruiters and HR leaders."
            icon={<UserCheck className="w-8 h-8" />}
        />
    );
}

export function InterviewsTab() {
    return (
        <PremiumPlaceholder
            title="Interviews & Scheduling"
            description="Sync calendars with managers, automate candidate invitations, and track panels, interview stages, and technical feedback in real time."
            icon={<Calendar className="w-8 h-8" />}
        />
    );
}

export function AnalyticsTab() {
    return (
        <PremiumPlaceholder
            title="Recruitment Analytics"
            description="Visualize conversion funnels, calculate average time-to-hire metrics, assess source channel effectiveness, and generate diversity reports."
            icon={<BarChart3 className="w-8 h-8" />}
        />
    );
}

export function HiringDecisionsTab() {
    return (
        <PremiumPlaceholder
            title="Hiring Decisions"
            description="Review aggregate scores, generate standard offer letters, coordinate supervisor approvals, and seamlessly transition candidates to active onboarding."
            icon={<Award className="w-8 h-8" />}
        />
    );
}
