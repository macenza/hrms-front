import apiClient from './apiClient';

export interface ScreeningQuestion {
    id?: string;
    _id?: string;
    questionText: string;
    isOptional: boolean;
}

export interface ScreeningAnswer {
    questionId: string;
    questionText: string;
    answer: string;
}

export interface JobOpening {
    id?: string;
    _id?: string;
    title: string;
    department: string;
    employmentType: string;
    openings: number;
    experienceRequired: string;
    location: string;
    description: string;
    status: 'Draft' | 'Active' | 'Closed';
    slug: string;
    applicantsCount?: number;
    createdAt?: string;
    workMode: 'On-site' | 'Hybrid' | 'Remote';
    salaryRange: string;
    deadline: string;
    screeningQuestions?: ScreeningQuestion[];
}

export interface Applicant {
    id?: string;
    _id?: string;
    jobId: string;
    jobTitle?: string;
    candidateName: string;
    email: string;
    phone: string;
    appliedDate?: string;
    status: 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
    resumeName: string;
    resumeData?: string; // base64
    notes?: string;
    currentLocation: string;
    highestQualification: string;
    yearsOfExperience: number;
    availableStartDate: string;
    portfolioUrl?: string;
    gitHubProfile?: string;
    linkedInProfile?: string;
    currentCompany?: string;
    currentCtc?: string;
    expectedCtc?: string;
    noticePeriod?: string;
    coverLetterName?: string;
    coverLetterData?: string; // base64
    screeningAnswers?: ScreeningAnswer[];
}

export const recruitmentService = {
    // --- HR/Admin Authenticated Operations ---
    
    getJobs: async (): Promise<JobOpening[]> => {
        try {
            const response = await apiClient.get('/recruitment/jobs');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching jobs:', error);
            throw error;
        }
    },

    createJob: async (jobData: Omit<JobOpening, 'id' | '_id'>): Promise<JobOpening> => {
        try {
            const response = await apiClient.post('/recruitment/jobs', jobData);
            return response.data.data;
        } catch (error) {
            console.error('Error creating job:', error);
            throw error;
        }
    },

    updateJob: async (id: string, jobData: Partial<JobOpening>): Promise<JobOpening> => {
        try {
            const response = await apiClient.put(`/recruitment/jobs/${id}`, jobData);
            return response.data.data;
        } catch (error) {
            console.error(`Error updating job ${id}:`, error);
            throw error;
        }
    },

    deleteJob: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/recruitment/jobs/${id}`);
        } catch (error) {
            console.error(`Error deleting job ${id}:`, error);
            throw error;
        }
    },

    getApplicants: async (): Promise<Applicant[]> => {
        try {
            const response = await apiClient.get('/recruitment/applicants');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching applicants:', error);
            throw error;
        }
    },

    updateApplicantStatus: async (id: string, status: Applicant['status']): Promise<Applicant> => {
        try {
            const response = await apiClient.patch(`/recruitment/applicants/${id}/status`, { status });
            return response.data.data;
        } catch (error) {
            console.error(`Error updating applicant status ${id}:`, error);
            throw error;
        }
    },

    deleteApplicant: async (id: string): Promise<void> => {
        try {
            await apiClient.delete(`/recruitment/applicants/${id}`);
        } catch (error) {
            console.error(`Error deleting applicant ${id}:`, error);
            throw error;
        }
    },

    // --- Public Candidate Facing Operations ---

    getPublicJobs: async (organizationSlug: string): Promise<JobOpening[]> => {
        try {
            const response = await apiClient.get(`/recruitment/public/careers/${organizationSlug}/jobs`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching public jobs for ${organizationSlug}:`, error);
            throw error;
        }
    },

    getPublicJobBySlug: async (organizationSlug: string, jobSlug: string): Promise<JobOpening> => {
        try {
            const response = await apiClient.get(`/recruitment/public/careers/${organizationSlug}/jobs/${jobSlug}`);
            return response.data.data;
        } catch (error) {
            console.error(`Error fetching public job detail for ${organizationSlug}/${jobSlug}:`, error);
            throw error;
        }
    },

    submitApplication: async (
        organizationSlug: string,
        jobSlug: string,
        applicationData: any
    ): Promise<Applicant> => {
        try {
            const response = await apiClient.post(
                `/recruitment/public/careers/${organizationSlug}/jobs/${jobSlug}/apply`,
                applicationData
            );
            return response.data.data;
        } catch (error) {
            console.error(`Error submitting application for ${organizationSlug}/${jobSlug}:`, error);
            throw error;
        }
    }
};
