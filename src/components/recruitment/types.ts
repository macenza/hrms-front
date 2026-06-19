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
    coverLetterData?: string;
    screeningAnswers?: ScreeningAnswer[];
}
