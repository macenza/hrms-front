'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Layout, ListTodo, Users, Settings } from 'lucide-react';
import clsx from 'clsx';

// Import our new components
import KanbanBoard from '@/components/projects/KanbanBoard';
import TaskListTab from '@/components/projects/tabs/TaskListTab';
import TeamTab from '@/components/projects/tabs/TeamTab';
import ProjectSettingsTab from '@/components/projects/tabs/ProjectSettingsTab';

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    
    const [activeTab, setActiveTab] = useState('board');

    const project = {
        name: 'Website Redesign',
        status: 'In Progress',
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/projects')}
                        className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full transition-colors text-gray-500 shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                            <span className="px-3 py-1 bg-blue-50 text-[#4F7CF3] text-xs font-bold rounded-full">
                                {project.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Project ID: {projectId}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100">
                    {[
                        { id: 'board', label: 'Kanban Board', icon: Layout },
                        { id: 'list', label: 'Task List', icon: ListTodo },
                        { id: 'team', label: 'Team', icon: Users },
                        { id: 'settings', label: 'Settings', icon: Settings }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "border-[#4F7CF3] text-[#4F7CF3]"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                <Icon size={16} /> {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="p-6 bg-[#F8F9FB] min-h-[60vh]">
                    {activeTab === 'board' && <KanbanBoard projectId={projectId} />}
                    {activeTab === 'list' && <TaskListTab />}
                    {activeTab === 'team' && <TeamTab />}
                    {activeTab === 'settings' && <ProjectSettingsTab />}
                </div>
            </div>
        </div>
    );
}