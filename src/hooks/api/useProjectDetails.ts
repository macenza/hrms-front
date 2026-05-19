import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';
import { toUiTaskStatus } from '@/lib/taskStatus';

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectData: any) => projectService.create(projectData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });
}

export function useProjectDetails(projectId: string) {
    return useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            const data = await projectService.getById(projectId);
            
            const managerId =
                typeof data.manager === 'object' && data.manager !== null
                    ? String(data.manager._id ?? data.manager.id ?? '')
                    : String(data.manager ?? '');

            return {
                id: data._id || data.id,
                name: data.name,
                description: data.description,
                manager: data.manager?.name || data.managerName || 'Unassigned',
                managerId,
                dueDate: data.targetEndDate
                    ? new Date(data.targetEndDate).toISOString().split('T')[0]
                    : '',
                dueDateDisplay: data.targetEndDate
                    ? new Date(data.targetEndDate).toLocaleDateString()
                    : 'No Date',
                progress: data.progress || 0,
                status: data.status || 'Active',
                team: data.teamAvatars || data.team || [],
                tasks: data.tasks || { total: 0, open: 0 },
            };
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useProjectTasks(projectId: string) {
    return useQuery({
        queryKey: ['project', projectId, 'tasks'],
        queryFn: async () => {
            const taskData = await taskService.getByProject(projectId);
            
            // Safety check in case of empty states
            if (!Array.isArray(taskData)) return [];

            return taskData.map((t: any) => {
                const apiStatus = String(t.status ?? 'To Do');
                return {
                    id: t._id || t.id,
                    title: t.title,
                    status: toUiTaskStatus(apiStatus),
                    apiStatus,
                    priority: t.priority || 'Medium',
                    tag: t.tag || 'Task',
                    dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
                    assigneeName: t.assignee?.name || t.assigneeName || 'Unassigned',
                    assigneeAvatar: t.assignee?.avatar || t.assigneeAvatar || '',
                };
            });
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateProject(projectId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => projectService.update(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            queryClient.invalidateQueries({ queryKey: ['projects'] }); 
        }
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId: string) => projectService.delete(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        }
    });
}

export function useUpdateTaskStatus(projectId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, status }: { taskId: string, status: string }) => taskService.updateStatus(taskId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId, 'tasks'] });
        }
    });
}

export function useCreateTask(projectId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (taskData: any) => taskService.create({ ...taskData, projectId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId, 'tasks'] });
        }
    });
}