// src/components/recruitment/types.ts

export interface ScreeningQuestion {
    id: string;
    questionText: string;
    isOptional: boolean;
}

export interface ScreeningAnswer {
    questionId: string;
    questionText: string;
    answer: string;
}

export interface JobOpening {
    id: string;
    title: string;
    department: string;
    employmentType: string;
    openings: number;
    experienceRequired: string;
    location: string;
    description: string;
    status: 'Draft' | 'Active' | 'Closed';
    slug: string;
    applicantsCount: number;
    createdAt: string;
    workMode: 'On-site' | 'Hybrid' | 'Remote';
    salaryRange: string;
    deadline: string;
    screeningQuestions?: ScreeningQuestion[];
}

export interface Applicant {
    id: string;
    _id?: string;
    jobId: string;
    jobTitle: string;
    candidateName: string;
    email: string;
    phone: string;
    appliedDate: string;
    status: 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
    resumeName: string;
    resumeData?: string;
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

export interface InterviewEvaluation {
    id?: string;
    _id?: string;
    roundId: string;
    evaluatorId?: string;
    isAiEvaluated: boolean;
    score: number;
    strengths: string[];
    weaknesses: string[];
    detailedFeedback: string;
    categoryRatings?: Record<string, number>;
}

export interface InterviewRound {
    id?: string;
    _id?: string;
    interviewId: string;
    roundNumber: number;
    roundType: 'Technical' | 'HR' | 'System-Coding' | 'System-MCQ' | 'AI-Video-Screening' | 'Behavioral';
    status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Evaluation-Completed' | 'Failed';
    interviewerIds?: Array<{ _id: string; name: string; email: string }>;
    scheduledTime: string;
    durationMinutes: number;
    meetingUrl?: string;
    aiSessionId?: string;
    proctoringEnabled: boolean;
    candidateToken?: string;
    notes?: string;
    evaluations?: InterviewEvaluation[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Interview {
    id?: string;
    _id?: string;
    organizationId: string;
    jobId: string | Omit<JobOpening, 'description'>;
    applicantId: string | Pick<Applicant, 'id' | '_id' | 'candidateName' | 'email' | 'phone' | 'status'>;
    status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled' | 'Evaluation-Pending';
    overallScore: number;
    recommendation: 'Hire' | 'Reject' | 'Next-Round' | 'Hold' | 'None';
    notes?: string;
    rounds?: InterviewRound[];
    hiringDecision?: any;
    createdAt?: string;
    updatedAt?: string;
}
