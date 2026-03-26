'use client';

import React, { useState } from 'react';
import { Plus, LayoutGrid, List, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Feature Components
import ProjectList, { Project } from '@/components/projects/ProjectList';

// Mock Data Fallback (Aligned with ProjectList interface)
const mockProjects: Project[] = [
    {
        id: 'PRJ-001',
        name: 'Website Redesign',
        description: 'Revamp the corporate website with new branding and improved accessibility.',
        manager: 'Alice Johnson',
        dueDate: '2023-12-15',
        progress: 75,
        status: 'In Progress',
        team: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2', 'https://i.pravatar.cc/150?u=3'],
        tasks: { total: 10, open: 2 }
    },
    {
        id: 'PRJ-002',
        name: 'Mobile App Launch',
        description: 'Launch the new mobile app for iOS and Android platforms.',
        manager: 'Bob Smith',
        dueDate: '2024-01-20',
        progress: 30,
        status: 'In Progress',
        team: ['https://i.pravatar.cc/150?u=4', 'https://i.pravatar.cc/150?u=5'],
        tasks: { total: 11, open: 8 }
    },
    {
        id: 'PRJ-003',
        name: 'Q4 Marketing Campaign',
        description: 'Execute the holiday season marketing strategy across all social channels.',
        manager: 'Sarah Lee',
        dueDate: '2023-11-30',
        progress: 100,
        status: 'Completed',
        team: ['https://i.pravatar.cc/150?u=6'],
        tasks: { total: 12, open: 0 }
    }
];

export default function ProjectsPage() {
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    // Filter Logic (Ready for API search)
    const filteredProjects = mockProjects.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.manager.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Projects</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        Manage deliverables and track team progress
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggles using Standardized Button Ghost Variant */}
                    <div className="hidden sm:flex items-center p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('grid')}
                            className={cn(
                                "p-1.5 h-8 w-8 rounded-md transition-all",
                                view === 'grid' ? "bg-gray-100 text-blue-600" : "text-gray-400"
                            )}
                        >
                            <LayoutGrid size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('list')}
                            className={cn(
                                "p-1.5 h-8 w-8 rounded-md transition-all",
                                view === 'list' ? "bg-gray-100 text-blue-600" : "text-gray-400"
                            )}
                        >
                            <List size={18} />
                        </Button>
                    </div>

                    <Button
                        variant="primary"
                        className="gap-2 shadow-sm shadow-blue-500/30 font-bold"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        New Project
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search projects or managers..."
                        className="pl-10 h-10 border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select className="flex-1 sm:w-40 h-10 px-3 rounded-md border border-gray-200 text-sm font-medium text-gray-600 bg-white outline-none focus:ring-2 focus:ring-blue-600/20">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="hold">On Hold</option>
                    </select>
                </div>
            </div>

            {/* Main Content */}
            <ProjectList
                projects={filteredProjects}
                view={view}
                onActionClick={(id) => console.log('Action for project:', id)}
            />
        </div>
    );
}