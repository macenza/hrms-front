'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Flag, Tag as TagIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
    task: any | null; 
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

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'Medium',
                tag: task.tag || 'General',
                dueDate: task.dueDate || '',
            });
        } else if (isOpen) {
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
            <form onSubmit={handleSubmit} className="space-y-5 p-2">
                
                {/* Title */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Task Title</label>
                    <Input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Design Homepage"
                        required
                        className="text-gray-900 dark:text-gray-100"
                    />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-600/20 dark:focus:ring-blue-500/40 focus:border-blue-600 dark:focus:border-blue-500 h-24 resize-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-600 transition-all text-sm shadow-sm dark:shadow-none"
                        placeholder="Add detailed instructions..."
                    />
                </div>

                {/* Priority & Date Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Priority</label>
                        <div className="relative">
                            <Flag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors" />
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full h-10 pl-10 pr-4 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-medium cursor-pointer appearance-none transition-all shadow-sm dark:shadow-none"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                                <option value="Critical">Critical</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Due Date</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none transition-colors" />
                            <Input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="pl-10 text-gray-900 dark:text-gray-100 [color-scheme:light] dark:[color-scheme:dark]"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div className="space-y-2 pb-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition-colors">
                        <TagIcon size={16} className="text-gray-400 dark:text-gray-500 transition-colors" /> Task Tag
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
                                        ? "bg-blue-50 dark:bg-blue-500/10 border-blue-600 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-sm dark:shadow-none"
                                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex gap-3 transition-colors">
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={handleClose}
                        className="flex-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        type="submit"
                        className="flex-1 shadow-md shadow-blue-500/25 dark:shadow-none font-semibold"
                    >
                        {task ? 'Save Changes' : 'Create Task'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}