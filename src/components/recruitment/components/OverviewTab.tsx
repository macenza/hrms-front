// src/components/recruitment/components/OverviewTab.tsx
import React from "react";
import { JobOpening, Applicant } from "../types";
import RecruitmentStats from "./RecruitmentStats";
import JobOpeningsTable from "./JobOpeningsTable";
import ApplicantsTable from "./ApplicantsTable";

interface OverviewTabProps {
    stats: {
        openPositions: number;
        totalApplicants: number;
        interviews: number;
        positionsFilled: number;
    };
    jobs: JobOpening[];
    organizationSlug: string;
    copiedJobId: string | null;
    onCopyUrl: (jobSlug: string, jobId: string) => void;
    onViewJobDetails: (job: JobOpening) => void;
    onEditJob: (job: JobOpening) => void;
    onLaunchJob: (id: string) => void;
    onCloseJob: (id: string) => void;
    onDeleteJob: (id: string) => void;
    applicants: Applicant[];
    openDropdownId: string | null;
    onToggleDropdown: (e: React.MouseEvent, applicantId: string) => void;
    onUpdateApplicantStatus: (applicantId: string, candidateName: string, status: Applicant['status']) => void;
    onViewApplicant: (applicant: Applicant) => void;
    onDeleteApplicant: (id: string, candidateName: string) => void;
}

export default function OverviewTab({
    stats,
    jobs,
    organizationSlug,
    copiedJobId,
    onCopyUrl,
    onViewJobDetails,
    onEditJob,
    onLaunchJob,
    onCloseJob,
    onDeleteJob,
    applicants,
    openDropdownId,
    onToggleDropdown,
    onUpdateApplicantStatus,
    onViewApplicant,
    onDeleteApplicant
}: OverviewTabProps) {
    return (
        <div className="space-y-6">
            <RecruitmentStats stats={stats} />
            
            <JobOpeningsTable 
                jobs={jobs}
                organizationSlug={organizationSlug}
                copiedJobId={copiedJobId}
                onCopyUrl={onCopyUrl}
                onViewDetails={onViewJobDetails}
                onEdit={onEditJob}
                onLaunch={onLaunchJob}
                onClose={onCloseJob}
                onDelete={onDeleteJob}
            />

            <ApplicantsTable 
                applicants={applicants}
                openDropdownId={openDropdownId}
                onToggleDropdown={onToggleDropdown}
                onUpdateStatus={onUpdateApplicantStatus}
                onViewApplication={onViewApplicant}
                onDeleteApplicant={onDeleteApplicant}
            />
        </div>
    );
}
