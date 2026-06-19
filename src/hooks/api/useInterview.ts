// src/hooks/api/useInterview.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService, CreateRoundPayload } from '@/services/interviewService';
import { recruitmentService } from '@/services/recruitmentService';

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
        }
    });
}
