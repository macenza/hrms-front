// src/app/(main)/projects/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, User, Users, Clock, CheckCircle2, Loader2, Edit, Settings, LayoutDashboard, CheckSquare, LayoutGrid, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

import ProjectSettingsTab, { ProjectSettingsPayload } from '@/components/projects/tabs/ProjectSettingsTab';
import TeamTab from '@/components/projects/tabs/TeamTab';
import TaskListTab from '@/components/projects/tabs/TaskListTab';
import KanbanBoard from '@/components/projects/KanbanBoard'; 

import { useAppSelector } from '@/store/hooks';
import { useProjectManagers } from '@/hooks/api/useProjects';
import { 
    useProjectDetails, 
    useProjectTasks, 
    useUpdateProject, 
    useDeleteProject,
    useUpdateTaskStatus,
    useCreateTask
} from '@/hooks/api/useProjectDetails';

// Premium Skeleton for the Header
const ProjectHeaderSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-2/3 mb-2" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-1/2 mb-6" />
        <div className="flex gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32" />
        </div>
    </div>
);

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    
    // 1. RBAC Enforcement
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const canEdit = ['admin', 'manager', 'hr'].includes(role);

    // 2. React Query Data Layer
    const { data: project, isLoading: isProjectLoading } = useProjectDetails(projectId);
    const { data: tasks = [], isLoading: isTasksLoading } = useProjectTasks(projectId);
    const { data: availableManagers = [] } = useProjectManagers(isAuthenticated && canEdit);
    
    const updateProjectMutation = useUpdateProject(projectId);
    const deleteProjectMutation = useDeleteProject();
    const updateTaskStatusMutation = useUpdateTaskStatus(projectId);
    const createTaskMutation = useCreateTask(projectId);

    // 3. Local UI State
    const [activeTab, setActiveTab] = useState('overview');
    const [taskView, setTaskView] = useState<'list' | 'kanban'>('kanban');
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
    const [newProgress, setNewProgress] = useState(0);

    // Sync local progress state when project loads
    useEffect(() => {
        if (project) setNewProgress(project.progress);
    }, [project]);

    // Kick unauthorized users back
    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    const handleSaveProgress = async () => {
        try {
            await updateProjectMutation.mutateAsync({ progress: newProgress });
            setIsUpdatingProgress(false);
        } catch (error) {
            alert('Failed to update progress');
        }
    };

    const handleSaveSettings = async (settingsData: ProjectSettingsPayload) => {
        try {
            await updateProjectMutation.mutateAsync({
                name: settingsData.projectName,
                managerName: settingsData.managerName,
                description: settingsData.description,
                status: settingsData.status,
                dueDate: settingsData.dueDate
            });
            alert('Settings updated successfully!');
            setActiveTab('overview');
        } catch (error) {
            alert('Failed to update project settings.');
        }
    };

    const handleDeleteProject = async (id: string) => {
        try {
            await deleteProjectMutation.mutateAsync(id);
            router.push('/projects');
        } catch (error) {
            alert('Failed to delete project.');
        }
    };

    const handleTaskMove = async (taskId: string, newStatus: string) => {
        try {
            await updateTaskStatusMutation.mutateAsync({ taskId, status: newStatus });
        } catch (error) {
            alert("Failed to move task");
        }
    };

    if (!isAuthenticated) return null;

    if (isProjectLoading) {
        return (
            <div className="max-w-5xl mx-auto space-y-6 p-6 animate-in fade-in duration-300">
                <ProjectHeaderSkeleton />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Project Not Found</h2>
                <Button variant="outline" className="mt-4" onClick={() => router.push('/projects')}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <button 
                    onClick={() => router.push('/projects')} 
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                    <ChevronLeft size={16} /> Back to Projects
                </button>
                
                {/* Project Header */}
                <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4 transition-colors">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">{project.name}</h1>
                            <Badge variant={project.status === 'Completed' ? 'success' : 'default'} className="text-sm px-3 py-1">
                                {project.status}
                            </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed max-w-3xl transition-colors">
                            {project.description}
                        </p>
                        <div className="mt-6 flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors">
                                <User size={18} className="text-gray-400 dark:text-gray-500" />
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{project.manager}</span> (Manager)
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 transition-colors">
                                <Calendar size={18} className="text-gray-400 dark:text-gray-500" />
                                Due: <span className="font-semibold text-gray-900 dark:text-gray-100">{project.dueDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 dark:border-gray-800 bg-transparent transition-colors">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'team', icon: Users, label: 'Team' },
                        { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
                        ...(canEdit ? [{ id: 'settings', icon: Settings, label: 'Settings' }] : [])
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "whitespace-nowrap px-6 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2", 
                                activeTab === tab.id 
                                    ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400" 
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                            )}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="pt-2">
                    {activeTab === 'overview' && (
                        <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors">
                            <CardContent className="p-6 sm:p-8">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 transition-colors">
                                        <Clock size={20} className="text-blue-500 dark:text-blue-400" /> Project Progress
                                    </h2>
                                    {canEdit && !isUpdatingProgress && project.status !== 'Completed' && (
                                        <Button variant="ghost" size="sm" onClick={() => setIsUpdatingProgress(true)} className="text-blue-600 dark:text-blue-400 gap-2 hover:bg-blue-50 dark:hover:bg-blue-500/10">
                                            <Edit size={14} /> Update Progress
                                        </Button>
                                    )}
                                </div>
                                {isUpdatingProgress ? (
                                    <div className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-900/50 rounded-xl p-6 animate-in zoom-in-95 duration-200 transition-colors">
                                        <div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 transition-colors">
                                            <span>0%</span>
                                            <span className="text-blue-600 dark:text-blue-400 text-lg">{newProgress}%</span>
                                            <span>100%</span>
                                        </div>
                                        <input
                                            type="range" min="0" max="100"
                                            value={newProgress}
                                            onChange={(e) => setNewProgress(Number(e.target.value))}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                                        />
                                        <div className="flex justify-end gap-3 mt-6">
                                            <Button variant="ghost" size="sm" onClick={() => { setIsUpdatingProgress(false); setNewProgress(project.progress); }} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</Button>
                                            <Button variant="primary" size="sm" onClick={handleSaveProgress} disabled={updateProjectMutation.isPending}>
                                                {updateProjectMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : 'Save Progress'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100 transition-colors">{project.progress}%</span>
                                            {project.progress === 100 && <CheckCircle2 className="text-emerald-500 dark:text-emerald-400 mb-1" />}
                                        </div>
                                        <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden transition-colors">
                                            <div className={cn("h-full rounded-full transition-all duration-1000", project.progress === 100 ? "bg-emerald-500" : "bg-blue-600 dark:bg-blue-500")} style={{ width: `${project.progress}%` }} />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'team' && (
                        <TeamTab
                            projectId={project.id}
                            teamAvatars={project.team}
                            onUpdateTeam={async (newTeamArray) => {
                                await updateProjectMutation.mutateAsync({ teamAvatars: newTeamArray });
                            }}
                        />
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-4 animate-in fade-in duration-300">
                            <div className="flex justify-end">
                                <div className="flex items-center p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm dark:shadow-none transition-colors">
                                    <Button
                                        variant="ghost" size="sm"
                                        onClick={() => setTaskView('kanban')}
                                        className={cn("p-1.5 h-8 w-8 rounded-md transition-all", taskView === 'kanban' ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-none" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300")}
                                        title="Board View"
                                    >
                                        <LayoutGrid size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost" size="sm"
                                        onClick={() => setTaskView('list')}
                                        className={cn("p-1.5 h-8 w-8 rounded-md transition-all", taskView === 'list' ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-none" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300")}
                                        title="List View"
                                    >
                                        <List size={16} />
                                    </Button>
                                </div>
                            </div>
                            
                            {isTasksLoading ? (
                                <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
                            ) : taskView === 'list' ? (
                                <TaskListTab 
                                    tasks={tasks}
                                    onAddTask={() => console.log('Open Modal')} 
                                />
                            ) : (
                                <KanbanBoard 
                                    projectId={projectId}
                                    tasks={tasks}
                                    onTaskMove={handleTaskMove}
                                    onTaskAdd={async (newTask) => {
                                        await createTaskMutation.mutateAsync(newTask);
                                    }}
                                />
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && canEdit && (
                        <ProjectSettingsTab
                            data={{
                                id: project.id,
                                projectName: project.name,
                                managerName: project.manager,
                                description: project.description,
                                status: project.status as any,
                                dueDate: project.dueDate
                            }}
                            managers={availableManagers}
                            onSave={handleSaveSettings}
                            onDelete={handleDeleteProject}
                            isSubmitting={updateProjectMutation.isPending}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}