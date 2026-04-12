'use client';

import React, { useState } from 'react';
import { X, Calendar, User, FileText, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface ProjectFormData {
    name: string;
    description: string;
    managerName: string;
    dueDate: string;
    progress: number;
    status: 'In Progress' | 'On Hold' | 'Completed';
}

interface AddProjectModalProps {
    isOpen: boolean;
    managers?: { name: string }[]; // Receive available managers from parent
    onClose: () => void;
    onSubmit: (data: ProjectFormData) => Promise<void>;
}

export default function AddProjectModal({ isOpen, managers = [], onClose, onSubmit }: AddProjectModalProps) {
    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        managerName: '',
        dueDate: '',
        progress: 0,
        status: 'In Progress'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            // Reset form on success
            setFormData({ name: '', description: '', managerName: '', dueDate: '', progress: 0, status: 'In Progress' });
        } catch (error) {
            console.error("Submission failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors" type="button">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form Body - Scrollable if screen is small */}
                <div className="overflow-y-auto p-6">
                    <form id="project-form" onSubmit={handleSubmit} className="space-y-5">

                        <Input
                            label="Project Name"
                            placeholder="e.g. Q4 Growth Strategy"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 uppercase">Description</label>
                            <textarea
                                className="w-full p-3 rounded-lg border border-gray-200 text-sm min-h-[100px] focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all resize-y"
                                placeholder="Briefly describe the project goals..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Dynamic Manager Dropdown */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase">Project Manager</label>
                                <select
                                    value={formData.managerName}
                                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white font-medium cursor-pointer"
                                >
                                    <option value="" disabled>Select Manager...</option>
                                    {managers.map((manager, idx) => (
                                        <option key={idx} value={manager.name}>{manager.name}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Due Date"
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                required
                            />
                        </div>

                        {/* Initial Progress Slider */}
                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-700 uppercase">Initial Progress</label>
                                <span className="text-sm font-bold text-blue-600">{formData.progress}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={formData.progress}
                                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                    <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                    <Button
                        variant="primary"
                        type="submit"
                        form="project-form" // Links button to the form above
                        disabled={isSubmitting || !formData.name || !formData.managerName || !formData.dueDate}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Create Project'}
                    </Button>
                </div>
            </div>
        </div>
    );
}