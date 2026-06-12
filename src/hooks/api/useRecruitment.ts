import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruitmentService, JobOpening, Applicant } from '@/services/recruitmentService';

export function useRecruitmentJobs() {
    return useQuery({
        queryKey: ['recruitment', 'jobs'],
        queryFn: recruitmentService.getJobs,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useCreateJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (jobData: Omit<JobOpening, 'id' | '_id'>) => recruitmentService.createJob(jobData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs'] });
        }
    });
}

export function useUpdateJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, jobData }: { id: string; jobData: Partial<JobOpening> }) => 
            recruitmentService.updateJob(id, jobData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs'] });
        }
    });
}

export function useDeleteJob() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => recruitmentService.deleteJob(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs'] });
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'applicants'] });
        }
    });
}

export function useRecruitmentApplicants() {
    return useQuery({
        queryKey: ['recruitment', 'applicants'],
        queryFn: recruitmentService.getApplicants,
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateApplicantStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: Applicant['status'] }) => 
            recruitmentService.updateApplicantStatus(id, status),
        onMutate: ({ id, status }) => {
            // Cancel any outgoing refetches to avoid overwriting our optimistic update
            queryClient.cancelQueries({ queryKey: ['recruitment', 'applicants'] });

            // Snapshot the previous applicants list
            const previousApplicants = queryClient.getQueryData<Applicant[]>(['recruitment', 'applicants']);

            // Optimistically update the list in cache
            if (previousApplicants) {
                queryClient.setQueryData<Applicant[]>(
                    ['recruitment', 'applicants'],
                    previousApplicants.map(app => {
                        const appId = app.id || app._id;
                        const targetId = id;
                        const isMatch = appId && targetId && appId.toString() === targetId.toString();
                        return isMatch ? { ...app, status } : app;
                    })
                );
            }

            return { previousApplicants };
        },
        onError: (err, variables, context) => {
            // Roll back if mutation fails
            if (context?.previousApplicants) {
                queryClient.setQueryData(['recruitment', 'applicants'], context.previousApplicants);
            }
        },
        onSettled: () => {
            // Always invalidate and refetch in the background to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'applicants'] });
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs'] });
        }
    });
}

export function useDeleteApplicant() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => recruitmentService.deleteApplicant(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'applicants'] });
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs'] }); // update count
        }
    });
}
