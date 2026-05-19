'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, User, Users, CheckCircle2, Loader2, Settings, LayoutDashboard, CheckSquare, LayoutGrid, List, CheckCircle } from 'lucide-react';
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
    useCreateTask,
    useUpdateTask,
    useDeleteTask
} from '@/hooks/api/useProjectDetails';
import { toast } from 'sonner';

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
    
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const canEdit = ['admin', 'manager', 'hr'].includes(role);
    
    const { data: project, isLoading: isProjectLoading, isError, error } = useProjectDetails(projectId);
    const { data: tasks = [], isLoading: isTasksLoading } = useProjectTasks(projectId);
    const { data: availableManagers = [] } = useProjectManagers(isAuthenticated && canEdit);
    
    const updateProjectMutation = useUpdateProject(projectId);
    const deleteProjectMutation = useDeleteProject();
    const updateTaskStatusMutation = useUpdateTaskStatus(projectId);
    const createTaskMutation = useCreateTask(projectId);
    const updateTaskMutation = useUpdateTask(projectId);
    const deleteTaskMutation = useDeleteTask(projectId);
    
    const [activeTab, setActiveTab] = useState('overview');
    const [taskView, setTaskView] = useState<'list' | 'kanban'>('kanban');

    useEffect(() => {
        if (!isAuthenticated && typeof window !== 'undefined') {
            router.replace('/login');
        }
    }, [isAuthenticated, router]);

    const handleSaveSettings = async (settingsData: ProjectSettingsPayload) => {
        try {
            await updateProjectMutation.mutateAsync({
                name: settingsData.projectName,
                manager: settingsData.managerId,
                description: settingsData.description,
                status: settingsData.status,
                targetEndDate: settingsData.dueDate,
            });
            toast.success('Settings updated successfully!');
            setActiveTab('overview');
        } catch (error) {
            toast.error('Failed to update project settings.');
        }
    };

    const handleDeleteProject = async (id: string) => {
        try {
            await deleteProjectMutation.mutateAsync(id);
            router.push('/projects');
            toast.success('Project deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete project.');
        }
    };

    // THE FIX: Strict parameter types to prevent [object Object] payload
    const handleTaskMove = async (taskId: string, apiStatus: string) => {
        try {
            await updateTaskStatusMutation.mutateAsync({ taskId, status: apiStatus });
        } catch (error) {
            toast.error("Failed to move task");
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

    if (isError) {
        const errMsg = (error as any)?.response?.data?.message || 'Access Denied: You do not have permission to view this project.';
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] flex flex-col justify-center items-center p-6 transition-colors duration-300">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-red-100 dark:border-red-950/30 p-8 shadow-sm text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4">
                        <ChevronLeft size={32} className="rotate-180" />
                    </div>
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Access Denied</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                        {errMsg}
                    </p>
                    <Button 
                        variant="primary" 
                        onClick={() => router.push('/projects')}
                        className="w-full font-semibold shadow-sm"
                    >
                        Back to Projects
                    </Button>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] flex flex-col justify-center items-center p-6 text-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Project Not Found</h2>
                <Button variant="outline" className="mt-4" onClick={() => router.push('/projects')}>Go Back</Button>
            </div>
        );
    }

    const completedTasks = tasks.filter((t: any) => t.status === 'Completed').length;
    const totalTasks = tasks.length;
    const derivedProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                <button 
                    onClick={() => router.push('/projects')} 
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                    <ChevronLeft size={16} /> Back to Projects
                </button>

                <div className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4 transition-colors">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">{project.name}</h1>
                            <Badge variant={project.status === 'Completed' ? 'success' : 'default'} className="text-sm px-3 py-1">
                                {project.status || 'Planning'}
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
                                Due: <span className="font-semibold text-gray-900 dark:text-gray-100">{project.dueDateDisplay ?? project.dueDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

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

                <div className="pt-2">
                    {/* THE FIX: Visual Progress Bar Removed. Task Stats Only. */}
                    {activeTab === 'overview' && (
                        <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors">
                            <CardContent className="p-6 sm:p-8">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 transition-colors mb-6">
                                    <CheckCircle size={20} className="text-blue-500 dark:text-blue-400" /> Project Summary
                                </h2>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Tasks</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalTasks}</p>
                                    </div>
                                    <div className="p-5 bg-emerald-50 dark:bg-emerald-500/5 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Completed</p>
                                        <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{completedTasks}</p>
                                    </div>
                                    <div className="p-5 bg-blue-50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Completion Rate</p>
                                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{derivedProgress}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'team' && (
                        <TeamTab
                            projectId={project.id}
                            teamAvatars={project.team}
                            onUpdateTeam={async (newTeamArray) => {
                                await updateProjectMutation.mutateAsync({ teamMembers: newTeamArray });
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
                                    >
                                        <LayoutGrid size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost" size="sm"
                                        onClick={() => setTaskView('list')}
                                        className={cn("p-1.5 h-8 w-8 rounded-md transition-all", taskView === 'list' ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-none" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300")}
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
                                    team={project.team}
                                    onTaskMove={handleTaskMove}
                                    onTaskAdd={async (newTask) => {
                                        await createTaskMutation.mutateAsync(newTask);
                                    }}
                                    onTaskUpdate={async (taskId, updatedTask) => {
                                        await updateTaskMutation.mutateAsync({ taskId, taskData: updatedTask });
                                    }}
                                    onTaskDelete={async (taskId) => {
                                        await deleteTaskMutation.mutateAsync(taskId);
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
                                managerId: project.managerId,
                                description: project.description,
                                status: project.status as ProjectSettingsPayload['status'],
                                dueDate: project.dueDate,
                            }}
                            managers={availableManagers.map((m) => ({
                                id: m.id,
                                name: m.name,
                            }))}
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