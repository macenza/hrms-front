// src/components/recruitment/components/RecruitmentStats.tsx
"use client";

import React from "react";
import { Briefcase, Users, Calendar, Award } from "lucide-react";

interface RecruitmentStatsProps {
    stats: {
        openPositions: number;
        totalApplicants: number;
        interviews: number;
        positionsFilled: number;
    };
}

export default function RecruitmentStats({ stats }: RecruitmentStatsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Open Positions Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300 flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Briefcase className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Open Positions</p>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.openPositions}</h4>
                </div>
            </div>

            {/* Total Applicants Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300 flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Applicants</p>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.totalApplicants}</h4>
                </div>
            </div>

            {/* Interviews Scheduled Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300 flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-600 dark:text-yellow-455 shrink-0">
                    <Calendar className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Interviews Scheduled</p>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.interviews}</h4>
                </div>
            </div>

            {/* Positions Filled Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300 flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-450 shrink-0">
                    <Award className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Positions Filled</p>
                    <h4 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.positionsFilled}</h4>
                </div>
            </div>
        </div>
    );
}
