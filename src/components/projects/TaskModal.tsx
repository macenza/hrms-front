'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Flag, Tag as TagIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Data Contract for Tasks
export interface TaskFormData {
    title: string;
    description: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    tag: string;
    dueDate: string;
}

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: TaskFormData) => void;
    task: any | null; // Data of the task being edited
}

const initialFormState: TaskFormData = {
    title: '',
    description: '',
    priority: 'Medium',
    tag: 'General',
    dueDate: '',
};

export default function TaskModal({ isOpen, onClose, onSubmit, task }: TaskModalProps) {
    const [formData, setFormData] = useState<TaskFormData>(initialFormState);

    // Sync form state with the task prop when it changes (for editing)
    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'Medium',
                tag: task.tag || 'General',
                dueDate: task.dueDate || '',
            });
        } else {
            setFormData(initialFormState);
        }
    }, [task, isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setFormData(initialFormState);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        handleClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={task ? 'Edit Task' : 'Create New Task'}
            className="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Task Title */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Task Title</label>
                    <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Design Homepage"
                        required
                    />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 h-24 resize-none text-gray-700 transition-all text-sm"
                        placeholder="Add detailed instructions..."
                    />
                </div>

                {/* Priority & Due Date Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700">Priority</label>
                        <div className="relative">
                            <Flag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white font-medium cursor-pointer appearance-none"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700">Due Date</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <Input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Task Tags (Selection Buttons) */}
                <div className="space-y-2 pb-2">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <TagIcon size={16} className="text-gray-400" /> Task Tag
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {['General', 'Design', 'Development', 'Meeting', 'Research'].map(t => (
                            <button
                                type="button"
                                key={t}
                                onClick={() => setFormData(prev => ({ ...prev, tag: t }))}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                                    formData.tag === t
                                        ? "bg-blue-50 border-blue-600 text-blue-600 shadow-sm"
                                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex gap-3">
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={handleClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        className="flex-1 shadow-md shadow-blue-500/20"
                    >
                        {task ? 'Save Changes' : 'Create Task'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}