// src/services/interviewService.ts
import apiClient from './apiClient';

import { Interview, InterviewRound } from '@/components/recruitment/types';

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

export interface GetInterviewsResponse {
    success: boolean;
    data: Interview[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalEntries: number;
        entriesPerPage: number;
    };
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
    },

    /**
     * Fetch all interviews with filters and pagination
     */
    getInterviews: async (params?: Record<string, any>): Promise<GetInterviewsResponse> => {
        const response = await apiClient.get('/interviews', { params });
        return response.data;
    },

    /**
     * Get details of a single interview
     */
    getInterviewById: async (id: string): Promise<Interview> => {
        const response = await apiClient.get(`/interviews/${id}`);
        return response.data.data;
    },

    /**
     * Update an interview record
     */
    updateInterview: async (id: string, payload: Partial<Interview>): Promise<Interview> => {
        const response = await apiClient.patch(`/interviews/${id}`, payload);
        return response.data.data;
    },

    /**
     * Delete an interview record
     */
    deleteInterview: async (id: string): Promise<void> => {
        await apiClient.delete(`/interviews/${id}`);
    },

    /**
     * Update/reschedule an interview round
     */
    updateInterviewRound: async (
        interviewId: string,
        roundId: string,
        payload: Partial<CreateRoundPayload> & { status?: string }
    ): Promise<InterviewRound> => {
        const response = await apiClient.patch(`/interviews/${interviewId}/rounds/${roundId}`, payload);
        return response.data.data;
    }
};
