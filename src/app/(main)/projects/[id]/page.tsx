'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, User, Users, Clock, CheckCircle2, Loader2, Edit, Settings, LayoutDashboard, CheckSquare, LayoutGrid, List } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tabs & Services
import ProjectSettingsTab, { ProjectSettingsPayload } from '@/components/projects/tabs/ProjectSettingsTab';
import TeamTab from '@/components/projects/tabs/TeamTab';
import TaskListTab, { TaskRecord } from '@/components/projects/tabs/TaskListTab';
import KanbanBoard from '@/components/projects/KanbanBoard'; // Ensure this path is correct

import { employeeService } from '@/services/employeeService';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService'; // We will create this next
import { Project } from '@/components/projects/ProjectList';

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    // Tab & View States
    const [activeTab, setActiveTab] = useState('overview');
    const [taskView, setTaskView] = useState<'list' | 'kanban'>('kanban'); // Toggle for tasks
    const [isLoading, setIsLoading] = useState(true);

    // Data States
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<TaskRecord[]>([]);
    const [availableManagers, setAvailableManagers] = useState<{ name: string, id: string }[]>([]);

    // Interactive Progress State
    const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
    const [newProgress, setNewProgress] = useState(0);
    const [isSaving, setIsSaving] = useState(false);

    // RBAC simulation
    const currentUserRole = 'Manager';
    const canEdit = ['Admin', 'Manager', 'HR'].includes(currentUserRole);

    const fetchProjectData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Project Details
            const data = await projectService.getById(projectId);
            setProject({
                id: data._id,
                name: data.name,
                description: data.description,
                manager: data.managerName,
                dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : 'No Date',
                progress: data.progress,
                status: data.status,
                team: data.teamAvatars || [],
                tasks: data.tasks || { total: 0, open: 0 }
            });
            setNewProgress(data.progress);

            // 2. Fetch Tasks for this Project
            const taskData = await taskService.getByProject(projectId);
            const mappedTasks = taskData.map((t: any) => ({
                id: t._id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                tag: t.tag,
                dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
                assigneeName: t.assigneeName,
                assigneeAvatar: t.assigneeAvatar || ''
            }));
            setTasks(mappedTasks);

            // 3. Fetch Managers for Settings Tab
            const empResponse = await employeeService.getAll(1, 100);
            const managersOnly = empResponse.employees
                .filter((emp: any) => emp.role === 'Manager' || emp.role === 'Admin')
                .map((emp: any) => ({ name: emp.name, id: emp.name }));
            setAvailableManagers(managersOnly);

        } catch (error) {
            console.error("Failed to load project details");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) fetchProjectData();
    }, [projectId]);

    // --- HANDLERS ---
    const handleSaveProgress = async () => {
        setIsSaving(true);
        try {
            const updatedData = await projectService.update(projectId, { progress: newProgress });
            setProject(prev => prev ? { ...prev, progress: updatedData.progress, status: updatedData.status } : null);
            setIsUpdatingProgress(false);
        } catch (error) {
            alert('Failed to update progress');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSettings = async (settingsData: ProjectSettingsPayload) => {
        try {
            const updatePayload = {
                name: settingsData.projectName,
                managerName: settingsData.managerName,
                description: settingsData.description,
                status: settingsData.status,
                dueDate: settingsData.dueDate
            };
            const updatedProject = await projectService.update(projectId, updatePayload);
            setProject(prev => prev ? {
                ...prev,
                name: updatedProject.name,
                manager: updatedProject.managerName,
                description: updatedProject.description,
                status: updatedProject.status,
                dueDate: updatedProject.dueDate ? new Date(updatedProject.dueDate).toISOString().split('T')[0] : 'No Date',
            } : null);
            alert('Settings updated successfully!');
            setActiveTab('overview');
        } catch (error) {
            alert('Failed to update project settings.');
        }
    };

    const handleDeleteProject = async (id: string) => {
        try {
            await projectService.delete(id);
            router.push('/projects');
        } catch (error) {
            alert('Failed to delete project.');
        }
    };

    const handleTaskMove = async (taskId: string, newStatus: any) => {
        try {
            await taskService.updateStatus(taskId, newStatus);
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (error) {
            alert("Failed to move task");
            fetchProjectData(); // Re-fetch to snap back to original state on failure
        }
    };

    if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
    if (!project) return <div className="text-center py-20"><h2 className="text-xl font-bold text-gray-900">Project Not Found</h2><Button variant="outline" className="mt-4" onClick={() => router.push('/projects')}>Go Back</Button></div>;

    return (
        <div className="max-w-5xl space-y-6 animate-in fade-in duration-300">
            {/* Breadcrumb */}
            <button onClick={() => router.push('/projects')} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                <ChevronLeft size={16} /> Back to Projects
            </button>

            {/* Header Info */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{project.name}</h1>
                        <Badge variant={project.status === 'Completed' ? 'success' : 'default'} className="text-sm px-3 py-1">{project.status}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-3xl">{project.description}</p>

                    <div className="mt-6 flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                            <User size={18} className="text-gray-400" />
                            <span className="font-semibold text-gray-900">{project.manager}</span> (Manager)
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <Calendar size={18} className="text-gray-400" />
                            Due: <span className="font-semibold text-gray-900">{project.dueDate}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-200 bg-transparent">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={cn("whitespace-nowrap px-6 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2", activeTab === 'overview' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}
                >
                    <LayoutDashboard size={18} /> Overview
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={cn("whitespace-nowrap px-6 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2", activeTab === 'team' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}
                >
                    <Users size={18} /> Team
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={cn("whitespace-nowrap px-6 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2", activeTab === 'tasks' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}
                >
                    <CheckSquare size={18} /> Tasks
                </button>
                {canEdit && (
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={cn("whitespace-nowrap px-6 py-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2", activeTab === 'settings' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")}
                    >
                        <Settings size={18} /> Settings
                    </button>
                )}
            </div>

            {/* Tab Content Rendering */}
            <div className="pt-2">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <Card className="border-gray-200 shadow-sm">
                        <CardContent className="p-6 sm:p-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Clock size={20} className="text-blue-500" /> Project Progress
                                </h2>
                                {canEdit && !isUpdatingProgress && project.status !== 'Completed' && (
                                    <Button variant="ghost" size="sm" onClick={() => setIsUpdatingProgress(true)} className="text-blue-600 gap-2">
                                        <Edit size={14} /> Update Progress
                                    </Button>
                                )}
                            </div>

                            {isUpdatingProgress ? (
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 animate-in zoom-in-95 duration-200">
                                    <div className="flex justify-between text-sm font-bold text-gray-700 mb-4">
                                        <span>0%</span>
                                        <span className="text-blue-600 text-lg">{newProgress}%</span>
                                        <span>100%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100"
                                        value={newProgress}
                                        onChange={(e) => setNewProgress(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-end gap-3 mt-6">
                                        <Button variant="ghost" size="sm" onClick={() => { setIsUpdatingProgress(false); setNewProgress(project.progress); }}>Cancel</Button>
                                        <Button variant="primary" size="sm" onClick={handleSaveProgress} disabled={isSaving}>
                                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : 'Save Progress'}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-3xl font-bold text-gray-900">{project.progress}%</span>
                                        {project.progress === 100 && <CheckCircle2 className="text-emerald-500 mb-1" />}
                                    </div>
                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full transition-all duration-1000", project.progress === 100 ? "bg-emerald-500" : "bg-blue-600")} style={{ width: `${project.progress}%` }} />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* 2. TEAM TAB */}
                {activeTab === 'team' && project && (
                    <TeamTab
                        projectId={project.id}
                        teamAvatars={project.team}
                        onUpdateTeam={async (newTeamArray) => {
                            await projectService.update(project.id, { teamAvatars: newTeamArray });
                            setProject(prev => prev ? { ...prev, team: newTeamArray } : null);
                        }}
                    />
                )}

                {/* 3. TASKS TAB (With View Toggle) */}
                {activeTab === 'tasks' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {/* View Toggle Bar */}
                        <div className="flex justify-end">
                            <div className="flex items-center p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => setTaskView('kanban')}
                                    className={cn("p-1.5 h-8 w-8 rounded-md transition-all", taskView === 'kanban' ? "bg-gray-100 text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}
                                    title="Board View"
                                >
                                    <LayoutGrid size={16} />
                                </Button>
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => setTaskView('list')}
                                    className={cn("p-1.5 h-8 w-8 rounded-md transition-all", taskView === 'list' ? "bg-gray-100 text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600")}
                                    title="List View"
                                >
                                    <List size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* Render Active View */}
                        {taskView === 'list' ? (
                            <TaskListTab 
                                tasks={tasks}
                                onAddTask={() => console.log('Open Modal')} // Hook up to TaskModal state
                            />
                        ) : (
                            <KanbanBoard 
                                projectId={projectId}
                                tasks={tasks}
                                onTaskMove={handleTaskMove}
                                onTaskAdd={async (newTask) => {
                                    await taskService.create({ ...newTask, projectId });
                                    fetchProjectData(); // Refresh tasks
                                }}
                            />
                        )}
                    </div>
                )}

                {/* 4. SETTINGS TAB */}
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
                    />
                )}
            </div>
        </div>
    );
}