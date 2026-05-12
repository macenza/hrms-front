import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { taskService } from '@/services/taskService';

export function useProjectDetails(projectId: string) {
    return useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            const data = await projectService.getById(projectId);
            return {
                id: data._id,
                name: data.name,
                description: data.description,
                manager: data.managerName,
                dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : 'No Date',
                progress: data.progress,
                status: data.status,
                team: data.teamAvatars || [],
                tasks: data.tasks || { total: 0, open: 0 }
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
            return taskData.map((t: any) => ({
                id: t._id,
                title: t.title,
                status: t.status,
                priority: t.priority,
                tag: t.tag,
                dueDate: t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
                assigneeName: t.assigneeName,
                assigneeAvatar: t.assigneeAvatar || ''
            }));
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
            queryClient.invalidateQueries({ queryKey: ['projects', 'all'] }); // Refresh main grid
        }
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (projectId: string) => projectService.delete(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', 'all'] });
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