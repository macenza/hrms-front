// src/services/interviewService.ts
import apiClient from './apiClient';

export interface CreateInterviewPayload {
    jobId: string;
    applicantId: string;
    status?: string;
    overallScore?: number;
    recommendation?: string;
    notes?: string;
}

export interface CreateRoundPayload {
    roundType: string;
    scheduledTime: string; // ISO datetime string
    durationMinutes: number;
    interviewerName: string;
    notes?: string;
    meetingUrl?: string;
}

export const interviewService = {
    /**
     * Create a new interview record on the backend
     */
    createInterview: async (payload: CreateInterviewPayload) => {
        const response = await apiClient.post('/interviews', payload);
        return response.data.data;
    },

    /**
     * Schedule a round for an interview
     */
    createInterviewRound: async (interviewId: string, payload: CreateRoundPayload) => {
        const response = await apiClient.post(`/interviews/${interviewId}/rounds`, payload);
        return response.data.data;
    }
};
