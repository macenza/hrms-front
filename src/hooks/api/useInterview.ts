// src/hooks/api/useInterview.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService, CreateRoundPayload, GetInterviewsResponse } from '@/services/interviewService';
import { recruitmentService } from '@/services/recruitmentService';
import { Interview, InterviewRound } from '@/components/recruitment/types';

export interface ScheduleInterviewParams {
    jobId: string;
    applicantId: string;
    roundData: CreateRoundPayload;
}

export function useScheduleInterview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ jobId, applicantId, roundData }: ScheduleInterviewParams) => {
            // 1. Create the base Interview record
            const interview = await interviewService.createInterview({
                jobId,
                applicantId,
                status: 'Scheduled',
                notes: roundData.notes || ''
            });

            const interviewId = interview._id || interview.id;
            if (!interviewId) {
                throw new Error("Failed to retrieve generated Interview ID");
            }

            // 2. Create the child InterviewRound record
            const round = await interviewService.createInterviewRound(interviewId, roundData);

            // 3. Update the Applicant's status in recruitment system to 'Interview'
            await recruitmentService.updateApplicantStatus(applicantId, 'Interview');

            return { interview, round };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'applicants'] });
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs'] });
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'interviews'] });
        }
    });
}

export function useInterviews(params?: Record<string, any>) {
    return useQuery<GetInterviewsResponse>({
        queryKey: ['recruitment', 'interviews', params],
        queryFn: () => interviewService.getInterviews(params),
    });
}

export function useInterviewById(id: string) {
    return useQuery<Interview>({
        queryKey: ['recruitment', 'interview', id],
        queryFn: () => interviewService.getInterviewById(id),
        enabled: !!id,
    });
}

export function useUpdateInterview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<Interview> }) =>
            interviewService.updateInterview(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'interviews'] });
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'applicants'] });
        }
    });
}

export function useDeleteInterview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => interviewService.deleteInterview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'interviews'] });
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'applicants'] });
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs'] });
        }
    });
}

export interface UpdateInterviewRoundParams {
    interviewId: string;
    roundId: string;
    payload: Partial<CreateRoundPayload> & { status?: string };
}

export function useUpdateInterviewRound() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ interviewId, roundId, payload }: UpdateInterviewRoundParams) =>
            interviewService.updateInterviewRound(interviewId, roundId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recruitment', 'interviews'] });
        }
    });
}
