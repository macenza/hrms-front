'use client';

import React, { useState, useEffect } from 'react';
import { Save, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export type ProjectStatus = 'In Progress' | 'Completed' | 'On Hold';

export interface ProjectSettingsPayload {
    id: string;
    projectName: string;
    managerName: string; 
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
    isSubmitting?: boolean; // Accept loading state from parent's React Query mutation
    onSave?: (data: ProjectSettingsPayload) => Promise<void>; 
    onDelete?: (projectId: string) => Promise<void>; 
}

export default function ProjectSettingsTab({
    data,
    managers = [],
    isLoading = false,
    isSubmitting = false,
    onSave,
    onDelete
}: ProjectSettingsTabProps) {
    const [formData, setFormData] = useState<ProjectSettingsPayload>({
        id: '',
        projectName: '',
        managerName: '',
        description: '',
        status: 'In Progress',
        dueDate: ''
    });

    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (data) {
            setFormData(data);
        }
    }, [data]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (onSave) {
            try {
                await onSave(formData);
            } catch (error) {
                console.error("Save failed");
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
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500 mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl animate-in fade-in duration-300 space-y-8">
            
            {/* General Settings Card */}
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6 transition-colors">
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100 transition-colors">General Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">Project Name</label>
                                <input
                                    type="text"
                                    name="projectName"
                                    value={formData.projectName}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm font-medium bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-all shadow-sm dark:shadow-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">Project Manager</label>
                                <select
                                    name="managerName"
                                    value={formData.managerName}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm font-medium bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-all shadow-sm dark:shadow-none cursor-pointer"
                                >
                                    <option value="" disabled>Select Manager...</option>
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
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent min-h-[100px] resize-y bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-all shadow-sm dark:shadow-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm font-medium bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-all shadow-sm dark:shadow-none cursor-pointer"
                                >
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="On Hold">On Hold</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm font-medium bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-all shadow-sm dark:shadow-none [color-scheme:light] dark:[color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end transition-colors">
                            <Button type="submit" variant="primary" disabled={isSubmitting} className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none min-w-[140px] font-semibold">
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

            {/* Danger Zone Card */}
            <Card className="border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-500/10 overflow-hidden shadow-sm dark:shadow-none transition-colors">
                <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2 transition-colors">
                        <AlertTriangle size={20} />
                        Danger Zone
                    </h2>
                    <p className="text-sm text-red-600 dark:text-red-300/80 mb-6 transition-colors">
                        Irreversible actions regarding this project.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 rounded-xl transition-colors">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 transition-colors">Delete Project</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                                Once deleted, it will be gone forever. Please be certain.
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="shrink-0 gap-2 bg-white dark:bg-gray-950 border-2 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800 min-w-[140px] transition-colors"
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