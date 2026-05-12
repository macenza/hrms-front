'use client';

import React, { useState, useEffect } from 'react';
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
    managers?: { name: string }[]; 
    onClose: () => void;
    onSubmit: (data: ProjectFormData) => Promise<void>;
    isSubmitting?: boolean; // Managed by parent React Query mutation
}

const initialFormState: ProjectFormData = {
    name: '',
    description: '',
    managerName: '',
    dueDate: '',
    progress: 0,
    status: 'In Progress'
};

export default function AddProjectModal({ 
    isOpen, 
    managers = [], 
    onClose, 
    onSubmit, 
    isSubmitting = false 
}: AddProjectModalProps) {
    
    const [formData, setFormData] = useState<ProjectFormData>(initialFormState);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Submission failed");
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] transition-colors">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50 shrink-0 transition-colors">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors">Create New Project</h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors" 
                        type="button"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Body / Form */}
                <div className="overflow-y-auto p-6">
                    <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
                        
                        <Input
                            label="Project Name"
                            placeholder="e.g. Q4 Growth Strategy"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={isSubmitting}
                            className="text-gray-900 dark:text-gray-100"
                        />
                        
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase transition-colors">Description</label>
                            <textarea
                                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-800 text-sm min-h-[100px] focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 outline-none transition-all resize-y bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 disabled:opacity-50"
                                placeholder="Briefly describe the project goals..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                disabled={isSubmitting}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase transition-colors">Project Manager</label>
                                <select
                                    value={formData.managerName}
                                    onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-medium cursor-pointer disabled:opacity-50 transition-all"
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
                                disabled={isSubmitting}
                                className="text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                            />
                        </div>
                        
                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase transition-colors">Initial Progress</label>
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 transition-colors">{formData.progress}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={formData.progress}
                                onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                                disabled={isSubmitting}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 disabled:opacity-50 transition-colors"
                            />
                        </div>
                    </form>
                </div>
                
                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0 transition-colors">
                    <Button 
                        variant="outline" 
                        type="button" 
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        form="project-form" 
                        disabled={isSubmitting || !formData.name || !formData.managerName || !formData.dueDate}
                        className="min-w-[140px] gap-2 font-semibold shadow-sm shadow-blue-500/25 dark:shadow-none"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : null}
                        {isSubmitting ? 'Creating...' : 'Create Project'}
                    </Button>
                </div>
            </div>
        </div>
    );
}