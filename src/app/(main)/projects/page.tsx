'use client';

import React, { useState } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import clsx from 'clsx';
import ProjectList from '@/components/projects/ProjectList';

// Types for our project data
export interface Project {
    id: string;
    name: string;
    description: string;
    manager: string;
    dueDate: string;
    progress: number;
    status: 'Completed' | 'In Progress' | 'Not Started';
    team: string[]; // Array of avatar URLs
    tasks: { open: number; inProgress: number; completed: number };
}

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
        tasks: { open: 2, inProgress: 3, completed: 5 }
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
        tasks: { open: 8, inProgress: 2, completed: 1 }
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
        tasks: { open: 0, inProgress: 0, completed: 12 }
    }
];

export default function ProjectsPage() {
    const [view, setView] = useState<'grid' | 'list'>('grid');

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage deliverables and track team progress</p>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* View Toggles */}
                    <div className="hidden sm:flex items-center p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <button 
                            onClick={() => setView('grid')}
                            className={clsx("p-1.5 rounded-md transition-colors", view === 'grid' ? "bg-gray-100 text-[#4F7CF3]" : "text-gray-400 hover:text-gray-900")}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setView('list')}
                            className={clsx("p-1.5 rounded-md transition-colors", view === 'list' ? "bg-gray-100 text-[#4F7CF3]" : "text-gray-400 hover:text-gray-900")}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] transition-colors shadow-sm shadow-blue-500/30">
                        <Plus size={18} strokeWidth={2.5} />
                        New Project
                    </button>
                </div>
            </div>

            {/* Project Display Component */}
            <ProjectList projects={mockProjects} view={view} />
        </div>
    );
}