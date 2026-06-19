// src/components/recruitment/components/ApplicantsTab.tsx
import React from "react";
import { Applicant } from "../types";
import ApplicantsTable from "./ApplicantsTable";

interface ApplicantsTabProps {
    applicants: Applicant[];
    openDropdownId: string | null;
    onToggleDropdown: (e: React.MouseEvent, applicantId: string) => void;
    onUpdateStatus: (applicantId: string, candidateName: string, status: Applicant['status']) => void;
    onViewApplication: (applicant: Applicant) => void;
    onDeleteApplicant: (id: string, candidateName: string) => void;
}

export default function ApplicantsTab({
    applicants,
    openDropdownId,
    onToggleDropdown,
    onUpdateStatus,
    onViewApplication,
    onDeleteApplicant
}: ApplicantsTabProps) {
    return (
        <ApplicantsTable 
            applicants={applicants}
            openDropdownId={openDropdownId}
            onToggleDropdown={onToggleDropdown}
            onUpdateStatus={onUpdateStatus}
            onViewApplication={onViewApplication}
            onDeleteApplicant={onDeleteApplicant}
        />
    );
}
