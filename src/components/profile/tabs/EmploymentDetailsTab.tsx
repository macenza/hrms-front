'use client';

import React, { useState } from 'react';
import { Briefcase, MapPin, User, Calendar, Hash, Tag, Plus, Building, X, Loader2, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export interface EmploymentDetailsData {
    employeeId: string;
    designation: string;
    reportingManager: string;
    dateOfJoining: string;
    department: string;
    employmentType: string;
    workLocation: string;
    skills: string[];
    shiftName?: string;
    shiftTiming?: string;
    batchNo?: string;
}

interface EmploymentDetailsTabProps {
    data: EmploymentDetailsData;
    onUpdateSkills?: (newSkills: string[]) => Promise<void>;
    canEditSkills?: boolean;
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
    <div className="min-w-0 w-full overflow-hidden">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 transition-colors">
            {label}
        </p>
        <div className="flex items-start gap-2 text-gray-900 dark:text-gray-100 font-medium transition-colors w-full overflow-hidden">
            {Icon && <Icon size={16} className={cn(iconColor, "mt-0.5 shrink-0 transition-colors")} />}
            <div className="min-w-0 flex-1 overflow-x-auto scrollbar-thin">
                <span className={cn(
                    "block max-w-full",
                    !value || value === 'N/A' ? 'text-gray-400 dark:text-gray-500 italic font-normal' : ''
                )}>
                    {value || 'Not provided'}
                </span>
            </div>
        </div>
    </div>
);

export default function EmploymentDetailsTab({
    data,
    onUpdateSkills,
    canEditSkills = false
}: EmploymentDetailsTabProps) {
    const [newSkill, setNewSkill] = useState('');
    const [isSavingSkill, setIsSavingSkill] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    if (!data) return null;

    const handleAddSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newSkill.trim();
        if (!trimmed) return;
        
        if (data.skills?.some(s => s.toLowerCase() === trimmed.toLowerCase())) {
            toast.error("Skill already exists!");
            return;
        }

        setIsSavingSkill(true);
        try {
            const updated = [...(data.skills || []), trimmed];
            await onUpdateSkills?.(updated);
            setNewSkill('');
            setShowAddForm(false);
        } catch (error) {
            // Error managed by caller
        } finally {
            setIsSavingSkill(false);
        }
    };

    const handleDeleteSkill = async (skillToDelete: string) => {
        if (confirm(`Remove skill "${skillToDelete}"?`)) {
            setIsSavingSkill(true);
            try {
                const updated = (data.skills || []).filter(s => s !== skillToDelete);
                await onUpdateSkills?.(updated);
            } catch (error) {
                // Error managed by caller
            } finally {
                setIsSavingSkill(false);
            }
        }
    };

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
                            <DetailItem
                                label="Shift"
                                value={data.shiftName ? `${data.shiftName} (${data.shiftTiming})` : 'No Shift Assigned'}
                                icon={Clock}
                            />
                            <DetailItem
                                label="Batch No."
                                value={data.batchNo}
                                icon={Tag}
                            />
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
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">Skills & Expertise</CardTitle>
                        {canEditSkills && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowAddForm(!showAddForm)}
                                className={cn(
                                    "h-8 w-8 p-0 rounded-full hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors",
                                    showAddForm ? "text-red-500 hover:text-red-600" : "text-blue-600 dark:text-blue-400"
                                )}
                                aria-label={showAddForm ? "Cancel adding skill" : "Add new skill"}
                            >
                                {showAddForm ? <X size={18} /> : <Plus size={20} strokeWidth={2.5} />}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="pt-6 flex-1 space-y-4">
                        {/* Inline Skill Add Form */}
                        {showAddForm && (
                            <form onSubmit={handleAddSkill} className="flex gap-2 items-end animate-in slide-in-from-top-2 duration-200">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Enter skill (e.g. React)"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        disabled={isSavingSkill}
                                        className="h-9 text-xs"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={isSavingSkill || !newSkill.trim()}
                                    className="h-9 font-bold px-3 shrink-0"
                                >
                                    {isSavingSkill ? <Loader2 size={14} className="animate-spin" /> : "Add"}
                                </Button>
                            </form>
                        )}

                        {!data.skills || data.skills.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-6">
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No skills listed yet.</p>
                                {canEditSkills && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAddForm(true)}
                                        className="mt-3 text-xs border-dashed text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                                    >
                                        Add your first skill
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {data.skills.map((skill, idx) => (
                                    <div
                                        key={idx}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg shadow-sm hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-200"
                                    >
                                        <span>{skill}</span>
                                        {canEditSkills && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSkill(skill)}
                                                disabled={isSavingSkill}
                                                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                aria-label={`Remove skill ${skill}`}
                                            >
                                                <X size={12} strokeWidth={2.5} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}