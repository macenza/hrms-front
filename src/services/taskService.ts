import apiClient from './apiClient';
import { ENDPOINTS } from '@/constants/endpoints';
import { toUiTaskStatus } from '@/lib/taskStatus';

/** Tried when API rejects `Completed` (legacy schemas may use Complete/Done). */
const COMPLETED_STATUS_FALLBACKS = ['Complete', 'Done'] as const;

async function putTaskStatus(taskId: string, status: string) {
    return apiClient.put(ENDPOINTS.TASK.MOVE(taskId), { status });
}

export const taskService = {
    getByProject: async (projectId: string) => {
        try {
            const response = await apiClient.get(ENDPOINTS.TASK.BY_PROJECT(projectId));
            return response.data?.data || response.data?.tasks || response.data;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    },
    create: async (taskData: Record<string, unknown> & { projectId: string }) => {
        try {
            const { projectId, status, ...rest } = taskData;
            const payload = {
                ...rest,
                status: typeof status === 'string' ? status : 'To Do',
            };
            const response = await apiClient.post(ENDPOINTS.TASK.BY_PROJECT(projectId), payload);
            return response.data;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },
    updateStatus: async (taskId: string, status: string) => {
        const trimmed = status.trim();
        try {
            const response = await putTaskStatus(taskId, trimmed);
            return response.data;
        } catch (error: unknown) {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message ?? '';

            if (
                toUiTaskStatus(trimmed) === 'Completed' &&
                message.toLowerCase().includes('not a valid enum')
            ) {
                for (const fallback of COMPLETED_STATUS_FALLBACKS) {
                    if (fallback === trimmed) continue;
                    try {
                        const response = await putTaskStatus(taskId, fallback);
                        return response.data;
                    } catch {
                        /* try next candidate */
                    }
                }
            }

            console.error('Error updating task status:', error);
            throw error;
        }
    },
};
