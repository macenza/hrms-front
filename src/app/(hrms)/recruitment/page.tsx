'use client';

import React from 'react';
import {
    UserPlus, Briefcase, Calendar, Send, Users, FileSearch, Video,
    BarChart3, Globe, Zap, Rocket, Clock, ArrowRight, Sparkles
} from 'lucide-react';

const stats = [
    { label: 'Active Positions', value: '0', icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Candidates', value: '0', icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Scheduled Interviews', value: '0', icon: Calendar, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Offers Sent', value: '0', icon: Send, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
];

const upcomingFeatures = [
    { title: 'Job Posting Board', description: 'Create and publish job openings to multiple channels.', icon: Globe },
    { title: 'Candidate Pipeline', description: 'Visual Kanban board to track applicants through stages.', icon: FileSearch },
    { title: 'Interview Scheduler', description: 'Seamless scheduling with calendar integration.', icon: Video },
    { title: 'Offer Management', description: 'Generate, send, and track offer letters.', icon: Send },
    { title: 'Hiring Analytics', description: 'Time-to-hire, source effectiveness, and pipeline reports.', icon: BarChart3 },
    { title: 'ATS Integration', description: 'Connect with LinkedIn, Indeed, and Naukri.', icon: Zap },
];

const roadmap = [
    { phase: 'Phase 1', label: 'Job Posting & Applications', status: 'Planned', color: 'border-blue-500' },
    { phase: 'Phase 2', label: 'Candidate Pipeline & Tracking', status: 'Planned', color: 'border-purple-500' },
    { phase: 'Phase 3', label: 'Interview & Offer Management', status: 'Planned', color: 'border-amber-500' },
    { phase: 'Phase 4', label: 'Analytics & ATS Integration', status: 'Planned', color: 'border-emerald-500' },
];

export default function RecruitmentPage() {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2 transition-colors">
                            <UserPlus className="w-6 h-6 text-[#6D5DFD]" />
                            Recruitment
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1 transition-colors">
                            Manage job openings, track candidates, and streamline your hiring process.
                        </p>
                    </div>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Sparkles size={12} /> Coming Soon
                    </span>
                </header>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                                        <Icon size={18} className={stat.color} />
                                    </div>
                                </div>
                                <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{stat.value}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">{stat.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-10 sm:p-12 text-center shadow-sm">
                    <div className="w-20 h-20 bg-[#6D5DFD]/10 dark:bg-[#6D5DFD]/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Rocket className="w-10 h-10 text-[#6D5DFD]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Recruitment Module Coming Soon</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                        We&apos;re building a powerful recruitment suite to help you hire the best talent. 
                        Post jobs, track candidates through your pipeline, schedule interviews, and send offers — all from one place.
                    </p>
                </div>

                {/* Feature Preview Cards */}
                <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-1.5">
                        <Zap size={12} /> Planned Features
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingFeatures.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <div key={feature.title} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md transition-all group">
                                    <div className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl w-fit mb-3 group-hover:bg-[#6D5DFD]/10 transition-colors">
                                        <Icon size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-[#6D5DFD] transition-colors" />
                                    </div>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">{feature.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Roadmap */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-1.5">
                        <Clock size={12} /> Roadmap
                    </h3>
                    <div className="space-y-3">
                        {roadmap.map((item) => (
                            <div key={item.phase} className={`flex items-center gap-4 p-3 border-l-4 ${item.color} bg-gray-50/50 dark:bg-gray-950/50 rounded-r-lg`}>
                                <span className="text-xs font-black text-gray-500 dark:text-gray-400 w-16 shrink-0">{item.phase}</span>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex-1">{item.label}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
