'use client';

import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, Trash2, Loader2 } from 'lucide-react';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Data Contracts for Backend Integration
export type ProjectStatus = 'In Progress' | 'Completed' | 'On Hold';

export interface ProjectSettingsPayload {
    id: string;
    projectName: string;
    managerName: string; // Updated to match your schema (managerName instead of managerId)
    description: string;
    status: ProjectStatus;
    dueDate: string;
}

export interface ManagerOption {
    name: string;
}

interface ProjectSettingsTabProps {
    data?: ProjectSettingsPayload;
    managers?: ManagerOption[];
    isLoading?: boolean;
    onSave?: (data: ProjectSettingsPayload) => Promise<void>; // Make it async
    onDelete?: (projectId: string) => Promise<void>; // Make it async
}

export default function ProjectSettingsTab({
    data,
    managers = [],
    isLoading = false,
    onSave,
    onDelete
}: ProjectSettingsTabProps) {
    
    // Centralized Form State (Initialize empty, then update when data arrives)
    const [formData, setFormData] = useState<ProjectSettingsPayload>({
        id: '',
        projectName: '',
        managerName: '',
        description: '',
        status: 'In Progress',
        dueDate: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sync form data when the parent finishes fetching the live project data
    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    // Universal Change Handler
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (onSave) {
            setIsSubmitting(true);
            try {
                await onSave(formData);
            } catch (error) {
                console.error("Save failed");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you absolutely sure you want to delete this project? This action cannot be undone.')) {
            if (onDelete) {
                setIsDeleting(true);
                try {
                    await onDelete(formData.id);
                } catch (error) {
                    console.error("Delete failed");
                    setIsDeleting(false); // Only reset if it fails (success will redirect away)
                }
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-sm text-gray-500 font-medium">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl animate-in fade-in duration-300 space-y-8">
            {/* General Settings */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 pb-4 mb-6">
                    <CardTitle className="text-lg">General Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Project Name</label>
                                <input
                                    type="text"
                                    name="projectName"
                                    value={formData.projectName}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Project Manager</label>
                                <select
                                    name="managerName"
                                    value={formData.managerName}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white font-medium"
                                >
                                    <option value="" disabled>Select Manager...</option>
                                    {/* Include current manager even if they aren't in the list to prevent empty selects */}
                                    {formData.managerName && !managers.find(m => m.name === formData.managerName) && (
                                        <option value={formData.managerName}>{formData.managerName}</option>
                                    )}
                                    {managers.map((manager, idx) => (
                                        <option key={idx} value={manager.name}>{manager.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[100px] resize-y bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white font-medium"
                                >
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="On Hold">On Hold</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <Button type="submit" variant="primary" disabled={isSubmitting} className="gap-2 shadow-sm min-w-[140px]">
                                {isSubmitting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 bg-red-50/30 overflow-hidden">
                <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Danger Zone
                    </h2>
                    <p className="text-sm text-red-600 mb-6">
                        Irreversible actions regarding this project.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-red-100 rounded-xl">
                        <div>
                            <h3 className="font-bold text-gray-900">Delete Project</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Once deleted, it will be gone forever. Please be certain.
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="shrink-0 gap-2 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 min-w-[140px]"
                        >
                            {isDeleting ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Trash2 size={16} />
                            )}
                            {isDeleting ? 'Deleting...' : 'Delete Project'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}