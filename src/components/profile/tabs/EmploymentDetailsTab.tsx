'use client';

import React from 'react';
import { Briefcase, MapPin, User, Calendar, Hash, Tag, Plus, Building } from 'lucide-react';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Data Contract for Backend Integration
export interface EmploymentDetailsData {
    employeeId: string;
    designation: string;
    reportingManager: string;
    dateOfJoining: string;
    department: string;
    employmentType: string;
    workLocation: string;
    skills: string[];
}

interface EmploymentDetailsTabProps {
    data?: EmploymentDetailsData;
    onAddSkill?: () => void;
}

// Mock Data Fallback
const mockEmploymentData: EmploymentDetailsData = {
    employeeId: 'EMP-001',
    designation: 'Senior UX Designer',
    reportingManager: 'Sarah Connor',
    dateOfJoining: 'Jan 12, 2023',
    department: 'Design',
    employmentType: 'Permanent',
    workLocation: 'HQ - San Francisco',
    skills: ['Figma', 'Adobe XD', 'User Research', 'Prototyping', 'HTML/CSS', 'Agile']
};

// Reusable Detail Item Helper (Matches PersonalInfoTab for consistency)
const DetailItem = ({
    label,
    value,
    icon: Icon,
    iconColor = "text-gray-400"
}: {
    label: string,
    value: string,
    icon?: any,
    iconColor?: string
}) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-start gap-2 text-gray-900 font-medium">
            {Icon && <Icon size={16} className={`${iconColor} mt-0.5 shrink-0`} />}
            <span>{value}</span>
        </div>
    </div>
);

export default function EmploymentDetailsTab({
    data = mockEmploymentData,
    onAddSkill
}: EmploymentDetailsTabProps) {

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">

            {/* Employment Information - Takes up 2 columns */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-gray-200 shadow-sm bg-gray-50/50">
                    <CardHeader className="pb-4 border-b border-gray-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Briefcase size={20} className="text-blue-600" />
                            Employment Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            <DetailItem label="Employee ID" value={data.employeeId} icon={Hash} />
                            <DetailItem label="Designation" value={data.designation} icon={Tag} />
                            <DetailItem label="Reporting Manager" value={data.reportingManager} icon={User} />
                            <DetailItem label="Date of Joining" value={data.dateOfJoining} icon={Calendar} />

                            {/* Optional: You can omit the icon if you prefer, the helper handles it safely */}
                            <DetailItem label="Department" value={data.department} icon={Building} />
                            <DetailItem label="Employment Type" value={data.employmentType} />

                            <div className="sm:col-span-2 pt-2">
                                <DetailItem
                                    label="Work Location"
                                    value={data.workLocation}
                                    icon={MapPin}
                                    iconColor="text-red-400"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Skills - Takes up 1 column */}
            <div className="space-y-6">
                <Card className="border-gray-200 shadow-sm bg-gray-50/50">
                    <CardHeader className="pb-4 border-b border-gray-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Skills</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAddSkill}
                            className="h-8 w-8 p-0 rounded-full text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                            aria-label="Add new skill"
                        >
                            <Plus size={20} />
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {data.skills.length === 0 ? (
                            <p className="text-sm text-gray-500 italic text-center py-4">No skills added yet.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:border-blue-300 transition-colors cursor-default"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}