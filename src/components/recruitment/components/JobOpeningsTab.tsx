// src/components/recruitment/components/JobOpeningsTab.tsx
import React from "react";
import { JobOpening } from "../types";
import JobOpeningsTable from "./JobOpeningsTable";

interface JobOpeningsTabProps {
    jobs: JobOpening[];
    organizationSlug: string;
    copiedJobId: string | null;
    onCopyUrl: (jobSlug: string, jobId: string) => void;
    onViewJobDetails: (job: JobOpening) => void;
    onEditJob: (job: JobOpening) => void;
    onLaunchJob: (id: string) => void;
    onCloseJob: (id: string) => void;
    onDeleteJob: (id: string) => void;
}

export default function JobOpeningsTab({
    jobs,
    organizationSlug,
    copiedJobId,
    onCopyUrl,
    onViewJobDetails,
    onEditJob,
    onLaunchJob,
    onCloseJob,
    onDeleteJob
}: JobOpeningsTabProps) {
    return (
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
    );
}
