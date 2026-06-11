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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'applicants'] });
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs'] }); // update count
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
