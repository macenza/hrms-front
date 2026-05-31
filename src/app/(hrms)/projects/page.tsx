'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LayoutGrid, List, Search, Loader2, FolderKanban } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ProjectList, { Project } from '@/components/projects/ProjectList';
import AddProjectModal, { ProjectFormData } from '@/components/projects/AddProjectModal';
import { useAppSelector } from '@/store/hooks';
import { useProjectsData, useProjectManagers, useCreateProject } from '@/hooks/api/useProjects';
import { toast } from 'sonner';

const ProjectsSkeleton = ({ view }: { view: 'grid' | 'list' }) => (
    <div className={cn(
        "animate-pulse",
        view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"
    )}>
        {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm dark:shadow-none transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
                </div>
                <div className="space-y-2 mb-6">
                    <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-full" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-4/5" />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(j => <div key={j} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-white dark:border-gray-900" />)}
                    </div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
            </div>
        ))}
    </div>
);

export default function ProjectsPage() {
    const router = useRouter(); 
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    
    const role = user?.role?.toLowerCase() || 'employee';
    const canCreateProject = ['admin', 'hr', 'manager'].includes(role);
    
    const { data: projects = [], isLoading: isProjectsLoading } = useProjectsData();
    const { data: managers = [], isLoading: isManagersLoading } = useProjectManagers(isAuthenticated && canCreateProject);
    const createProjectMutation = useCreateProject();
    
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.replace('/hrms-login');
        }
    }, [isAuthenticated, router]);

    const handleAddProject = async (data: ProjectFormData) => {
        try {
            await createProjectMutation.mutateAsync(data);
            setIsModalOpen(false);
            toast.success('Project created successfully!');
        } catch (error) {
            toast.error("Failed to create project. Please try again.");
        }
    };

    const filteredProjects = useMemo(() => {
        return projects.filter((project: Project) => {
            const projName = project.name || '';
            const projManager = project.managerName || (typeof project.manager === 'string' ? project.manager : project.manager?.name) || '';
            
            const matchesSearch =
                projName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                projManager.toLowerCase().includes(searchQuery.toLowerCase());
            
            // THE FIX: Database uses 'Active', UI filter uses 'in progress'. Treat them as equal.
            const rawStatus = (project.status || 'Active').toLowerCase();
            const normalizedStatus = rawStatus === 'active' ? 'in progress' : rawStatus;
            const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter.toLowerCase();
            
            return matchesSearch && matchesStatus;
        });
    }, [projects, searchQuery, statusFilter]);

    // THE FIX: Map the raw backend Mongoose _id to the UI's expected id property
    const mappedManagers = managers;

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* --- HEADER CONTROLS --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Projects</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Manage deliverables and track team progress
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm dark:shadow-none transition-colors">
                            <Button variant="ghost" size="sm" onClick={() => setView('grid')} className={cn("p-1.5 h-8 w-8 rounded-md transition-all", view === 'grid' ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-none" : "text-gray-400 hover:text-gray-600")}>
                                <LayoutGrid size={18} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setView('list')} className={cn("p-1.5 h-8 w-8 rounded-md transition-all", view === 'list' ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-none" : "text-gray-400 hover:text-gray-600")}>
                                <List size={18} />
                            </Button>
                        </div>
                        {canCreateProject && (
                            <Button
                                variant="primary"
                                className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none font-bold"
                                onClick={() => setIsModalOpen(true)} 
                                disabled={isManagersLoading}
                            >
                                {isManagersLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
                                New Project
                            </Button>
                        )}
                    </div>
                </div>

                {/* --- FILTERS --- */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
                    <div className="relative w-full sm:max-w-xs group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <Input
                            placeholder="Search projects or managers..."
                            className="pl-10 h-10 border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:bg-white dark:focus:bg-gray-900 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 sm:w-44 h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950 hover:bg-white dark:hover:bg-gray-900 cursor-pointer outline-none focus:ring-2 focus:ring-blue-600/20 transition-all shadow-sm"
                        >
                            <option value="all">All Statuses</option>
                            <option value="in progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="on hold">On Hold</option>
                        </select>
                    </div>
                </div>

                {/* --- CONTENT --- */}
                {isProjectsLoading ? (
                    <ProjectsSkeleton view={view} />
                ) : filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 border-dashed shadow-sm transition-colors">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                            <FolderKanban size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">No projects found</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm text-center">
                            {searchQuery || statusFilter !== 'all'
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "There are no active projects right now. Create a new one to get started."}
                        </p>
                    </div>
                ) : (
                    <ProjectList
                        projects={filteredProjects}
                        view={view}
                        onActionClick={(id) => router.push(`/projects/${id}`)}
                    />
                )}

                <AddProjectModal
                    isOpen={isModalOpen}
                    managers={mappedManagers} // PASSING THE FIX
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddProject}
                    isSubmitting={createProjectMutation.isPending}
                />
            </div>
        </div>
    );
}