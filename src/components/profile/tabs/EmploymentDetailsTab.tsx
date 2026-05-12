'use client';

import React from 'react';
import { Briefcase, MapPin, User, Calendar, Hash, Tag, Plus, Building } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

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
    data: EmploymentDetailsData;
    onAddSkill?: () => void;
}

const DetailItem = ({
    label,
    value,
    icon: Icon,
    iconColor = "text-gray-400 dark:text-gray-500"
}: {
    label: string,
    value?: string,
    icon?: any,
    iconColor?: string
}) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 transition-colors">
            {label}
        </p>
        <div className="flex items-start gap-2 text-gray-900 dark:text-gray-100 font-medium transition-colors">
            {Icon && <Icon size={16} className={cn(iconColor, "mt-0.5 shrink-0 transition-colors")} />}
            <span className={!value || value === 'N/A' ? 'text-gray-400 dark:text-gray-500 italic font-normal' : ''}>
                {value || 'Not provided'}
            </span>
        </div>
    </div>
);

export default function EmploymentDetailsTab({
    data,
    onAddSkill
}: EmploymentDetailsTabProps) {
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Main Details Card */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-300">
                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 transition-colors">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Briefcase size={20} className="text-blue-600 dark:text-blue-400" />
                            Employment Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                            <DetailItem label="Employee ID" value={data.employeeId} icon={Hash} />
                            <DetailItem label="Designation" value={data.designation} icon={Tag} />
                            <DetailItem label="Reporting Manager" value={data.reportingManager} icon={User} />
                            <DetailItem label="Date of Joining" value={data.dateOfJoining} icon={Calendar} />
                            <DetailItem label="Department" value={data.department} icon={Building} />
                            <DetailItem label="Employment Type" value={data.employmentType} />
                            <div className="sm:col-span-2 pt-2 border-t border-gray-100 dark:border-gray-800 transition-colors">
                                <DetailItem
                                    label="Work Location"
                                    value={data.workLocation}
                                    icon={MapPin}
                                    iconColor="text-red-500 dark:text-red-400"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Skills Card */}
            <div className="space-y-6">
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-300 flex flex-col h-full">
                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between transition-colors">
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Skills</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAddSkill}
                            className="h-8 w-8 p-0 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            aria-label="Add new skill"
                        >
                            <Plus size={20} strokeWidth={2.5} />
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6 flex-1">
                        {!data.skills || data.skills.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No skills added yet.</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg shadow-sm hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors cursor-default"
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