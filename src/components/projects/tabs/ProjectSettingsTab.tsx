'use client';

import React, { useState } from 'react';
import { Save, AlertTriangle, Trash2 } from 'lucide-react';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Data Contracts for Backend Integration
export type ProjectStatus = 'In Progress' | 'Completed' | 'On Hold';

export interface ProjectSettingsPayload {
    id: string;
    projectName: string;
    managerId: string;
    description: string;
    status: ProjectStatus;
    dueDate: string;
}

export interface ManagerOption {
    id: string;
    name: string;
}

interface ProjectSettingsTabProps {
    data?: ProjectSettingsPayload;
    managers?: ManagerOption[];
    onSave?: (data: ProjectSettingsPayload) => void;
    onDelete?: (projectId: string) => void;
}

// Mock Data Fallbacks
const mockProjectData: ProjectSettingsPayload = {
    id: 'PRJ-1042',
    projectName: 'Website Redesign',
    managerId: 'EMP-001',
    description: 'Revamp the corporate website with new branding and improved accessibility.',
    status: 'In Progress',
    dueDate: '2023-12-15',
};

const mockManagers: ManagerOption[] = [
    { id: 'EMP-001', name: 'Alice Johnson' },
    { id: 'EMP-002', name: 'Bob Smith' },
    { id: 'EMP-003', name: 'Sarah Lee' },
];

export default function ProjectSettingsTab({
    data = mockProjectData,
    managers = mockManagers,
    onSave,
    onDelete
}: ProjectSettingsTabProps) {

    // Centralized Form State
    const [formData, setFormData] = useState<ProjectSettingsPayload>(data);

    // Universal Change Handler
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (onSave) {
            onSave(formData);
        } else {
            console.log('Project Settings Payload Ready:', formData);
            // Example: await apiClient.put(`/projects/${formData.id}`, formData);
        }
    };

    const handleDelete = () => {
        // In a real app, you'd likely trigger a confirmation modal here first
        if (window.confirm('Are you absolutely sure you want to delete this project?')) {
            if (onDelete) {
                onDelete(formData.id);
            } else {
                console.log('Deleting project:', formData.id);
            }
        }
    };

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
                                    name="managerId"
                                    value={formData.managerId}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white font-medium"
                                >
                                    <option value="" disabled>Select Manager...</option>
                                    {managers.map(manager => (
                                        <option key={manager.id} value={manager.id}>{manager.name}</option>
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
                            <Button type="submit" variant="primary" className="gap-2 shadow-sm">
                                <Save size={16} />
                                Save Changes
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
                            className="shrink-0 gap-2 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                        >
                            <Trash2 size={16} />
                            Delete Project
                        </Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}