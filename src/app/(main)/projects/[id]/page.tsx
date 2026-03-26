'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Layout, ListTodo, Users, Settings, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

// UI Components
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

// Feature Components
import KanbanBoard from '@/components/projects/KanbanBoard';
import TaskListTab from '@/components/projects/tabs/TaskListTab';
import TeamTab from '@/components/projects/tabs/TeamTab';
import ProjectSettingsTab from '@/components/projects/tabs/ProjectSettingsTab';

// Define Tab Configuration
const projectTabs = [
    { id: 'board', label: 'Kanban Board', icon: Layout },
    { id: 'list', label: 'Task List', icon: ListTodo },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
] as const;

type ProjectTabId = typeof projectTabs[number]['id'];

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [activeTab, setActiveTab] = useState<ProjectTabId>('board');

    // In the future: const { data: project } = useProjectDetails(projectId);
    // Mock Data Fallback
    const project = {
        name: 'Website Redesign',
        status: 'In Progress' as const,
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* Standardized Breadcrumb & Header */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center text-sm text-gray-500 font-medium">
                    <Link href="/projects" className="hover:text-blue-600 transition-colors">Projects</Link>
                    <ChevronRight size={16} className="mx-2 text-gray-400" />
                    <span className="text-gray-900">{project.name}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/projects')}
                            className="p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-gray-500 shadow-sm h-10 w-10"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{project.name}</h1>
                                <Badge variant="info">
                                    {project.status}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-0.5 font-medium">Project ID: <span className="font-mono text-xs">{projectId}</span></p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Contextual Action Button based on Tab */}
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            Export Project Data
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tab Container */}
            <Card className="border-gray-200 shadow-sm overflow-hidden min-h-[70vh] flex flex-col">

                {/* Navigation Tabs Row */}
                <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100 bg-white shrink-0">
                    {projectTabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap outline-none",
                                    activeTab === tab.id
                                        ? "border-blue-600 text-blue-600 bg-blue-50/30"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                )}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area with different background for Board vs Forms */}
                <div className={cn(
                    "flex-1 p-4 sm:p-6",
                    activeTab === 'board' ? "bg-gray-50/50" : "bg-white"
                )}>
                    {activeTab === 'board' && <KanbanBoard projectId={projectId} />}
                    {activeTab === 'list' && <TaskListTab />}
                    {activeTab === 'team' && <TeamTab />}
                    {activeTab === 'settings' && <ProjectSettingsTab />}
                </div>

            </Card>
        </div>
    );
}