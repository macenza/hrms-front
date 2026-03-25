'use client';

import React from 'react';
import clsx from 'clsx';
import { Pin, Calendar, User, MoreHorizontal, FileText } from 'lucide-react';

const notices = [
    {
        id: 'NOT-001',
        title: 'Q4 Townhall Meeting & Annual Review',
        content: 'Please join us for the Q4 Townhall where we will discuss our yearly performance, announce the employee of the year, and share the roadmap for Q1 2024. Attendance is mandatory for all full-time employees.',
        category: 'Event',
        author: 'Thomas Anree (HR)',
        date: 'Oct 24, 2023',
        isPinned: true,
        attachment: 'Townhall_Agenda.pdf'
    },
    {
        id: 'NOT-002',
        title: 'Scheduled IT Maintenance - VPN Downtime',
        content: 'The IT department will be upgrading the primary VPN servers this weekend. Expect intermittent connectivity drops between Saturday 10 PM and Sunday 2 AM EST. Please save all work locally during this window.',
        category: 'IT Update',
        author: 'IT Support Team',
        date: 'Oct 22, 2023',
        isPinned: false,
        attachment: null
    },
    {
        id: 'NOT-003',
        title: 'Updates to the Remote Work Policy',
        content: 'Starting next month, the updated remote work policy will take effect. Employees are now eligible for 3 days of remote work per week, subject to manager approval. Please review the attached document for full guidelines.',
        category: 'HR & Policy',
        author: 'Sarah Connor',
        date: 'Oct 18, 2023',
        isPinned: false,
        attachment: 'Remote_Policy_2024.pdf'
    }
];

export default function NoticeFeed() {
    return (
        <div className="space-y-4">
            {notices.map((notice) => (
                <div 
                    key={notice.id} 
                    className={clsx(
                        "p-5 rounded-xl border transition-all hover:shadow-md",
                        notice.isPinned 
                            ? "bg-blue-50/50 border-blue-200" 
                            : "bg-white border-gray-200"
                    )}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                            {notice.isPinned && (
                                <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                                    <Pin size={12} className="fill-current" /> Pinned
                                </span>
                            )}
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold">
                                {notice.category}
                            </span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-700 transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">{notice.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {notice.content}
                    </p>

                    {notice.attachment && (
                        <div className="flex items-center gap-2 mb-4 p-3 bg-white border border-gray-200 rounded-lg w-fit cursor-pointer hover:border-[#4F7CF3] transition-colors">
                            <div className="p-1.5 bg-red-50 text-red-500 rounded">
                                <FileText size={16} />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{notice.attachment}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-4 text-xs font-medium text-gray-500 pt-4 border-t border-gray-200/60">
                        <div className="flex items-center gap-1.5">
                            <User size={14} />
                            {notice.author}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar size={14} />
                            {notice.date}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}