import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projectService';
import { ProjectFormData } from '@/components/projects/AddProjectModal';
import { fetchProjectManagers } from '@/lib/projectManagers';

export function useProjectsData() {
    return useQuery({
        queryKey: ['projects', 'all'],
        queryFn: async () => {
            const data = await projectService.getAll();
            return data.map((p: any) => ({
                id: p._id,
                name: p.name,
                description: p.description,
                manager: p.managerName || 'Unassigned',
                targetEndDate: p.dueDate ? new Date(p.dueDate).toISOString().split('T')[0] : 'No Date',
                progress: p.progress || 0,
                status: p.status,
                team: p.teamAvatars || [],
                tasks: p.tasks || { total: 0, open: 0 }
            }));
        },
        staleTime: 5 * 60 * 1000, // 5 mins cache
    });
}

export function useProjectManagers(enabled: boolean) {
    return useQuery({
        queryKey: ['projects', 'managers'],
        queryFn: fetchProjectManagers,
        enabled,
        staleTime: 10 * 60 * 1000,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ProjectFormData) => {
            const { dueDate, manager, progress, status, ...rest } = data;
            return projectService.create({
                name: rest.name,
                description: rest.description,
                manager,
                managerId: manager,
                progress,
                status,
                targetEndDate: dueDate,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects', 'all'] });
        }
    });
}