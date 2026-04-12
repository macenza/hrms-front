'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // <-- 1. Import useRouter for redirection
import { Plus, LayoutGrid, List, Search, Loader2, FolderKanban } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Feature Components
import ProjectList, { Project } from '@/components/projects/ProjectList';
import AddProjectModal, { ProjectFormData } from '@/components/projects/AddProjectModal';
import { employeeService } from '@/services/employeeService';

// Services
import { projectService } from '@/services/projectService';

export default function ProjectsPage() {
    const router = useRouter(); // <-- Initialize the router

    // Data & Loading States
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // UI & Filter States
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [managers, setManagers] = useState<{ name: string }[]>([])

    // Fetch Data on Mount
    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const empResponse = await employeeService.getAll(1, 100);
            const managersOnly = empResponse.employees
                .filter((emp: any) => emp.role === 'Manager' || emp.role === 'Admin')
                .map((emp: any) => ({ name: emp.name }));
            setManagers(managersOnly);
            const data = await projectService.getAll();
            // Map backend data to frontend interface
            const mappedProjects = data.map((p: any) => ({
                id: p._id,
                name: p.name,
                description: p.description,
                manager: p.managerName || 'Unassigned',
                dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split('T')[0] : 'No Date',
                progress: p.progress || 0,
                status: p.status,
                team: p.teamAvatars || [],
                tasks: p.tasks || { total: 0, open: 0 }
            }));
            setProjects(mappedProjects);
        } catch (error) {
            console.error("Failed to load projects", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Modal Submit Handler
    const handleAddProject = async (data: ProjectFormData) => {
        try {
            await projectService.create(data);
            setIsModalOpen(false);
            await fetchProjects(); // Instantly refresh the grid with the new project
        } catch (error) {
            alert("Failed to create project.");
            throw error;
        }
    };

    // Smart Client-Side Filtering
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const matchesSearch =
                project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                project.manager.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || project.status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [projects, searchQuery, statusFilter]);

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
                    {/* View Toggles */}
                    <div className="hidden sm:flex items-center p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setView('grid')}
                            className={cn(
                                "p-1.5 h-8 w-8 rounded-md transition-all",
                                view === 'grid' ? "bg-gray-100 text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
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
                                view === 'list' ? "bg-gray-100 text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <List size={18} />
                        </Button>
                    </div>

                    <Button
                        variant="primary"
                        className="gap-2 shadow-sm shadow-blue-500/30 font-bold"
                        onClick={() => setIsModalOpen(true)} // Open the modal
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        New Project
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative w-full sm:max-w-xs group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <Input
                        placeholder="Search projects or managers..."
                        className="pl-10 h-10 border-gray-200 bg-gray-50 focus:bg-white transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 sm:w-44 h-10 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-600/20 transition-all shadow-sm"
                    >
                        <option value="all">All Statuses</option>
                        <option value="in progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on hold">On Hold</option>
                    </select>
                </div>
            </div>

            {/* Main Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                    <p className="text-gray-500 font-medium">Loading projects...</p>
                </div>
            ) : filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-gray-100 border-dashed shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                        <FolderKanban size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No projects found</h3>
                    <p className="text-gray-500 text-sm max-w-sm text-center">
                        {searchQuery || statusFilter !== 'all'
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "There are no active projects right now. Create a new one to get started."}
                    </p>
                </div>
            ) : (
                <ProjectList
                    projects={filteredProjects}
                    view={view}
                    // <-- This is what fixes the redirection!
                    onActionClick={(id) => router.push(`/projects/${id}`)}
                />
            )}

            {/* The Creation Modal */}
            <AddProjectModal
                isOpen={isModalOpen}
                managers={managers} // Pass the fetched managers here
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddProject}
            />
        </div>
    );
}