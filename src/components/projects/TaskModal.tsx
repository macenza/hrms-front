'use client';

import React, { useState } from 'react';
import { X, Calendar, Flag, Tag } from 'lucide-react';
import clsx from 'clsx';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: any) => void;
    task: any | null;
}

export default function TaskModal({ isOpen, onClose, onSubmit, task }: TaskModalProps) {
    const [title, setTitle] = useState(task ? task.title : '');
    const [description, setDescription] = useState(task ? task.description : '');
    const [priority, setPriority] = useState(task ? task.priority : 'Medium');
    const [tag, setTag] = useState(task ? task.tag : 'General');
    const [date, setDate] = useState(task ? task.date : '');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ title, description, priority, tag, date: date || new Date().toLocaleDateString() });
        setTitle('');
        setDescription('');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">{task ? 'Edit Task' : 'Create New Task'}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Task Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] font-medium text-gray-900 transition-all"
                            placeholder="e.g. Design Homepage"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] h-24 resize-none text-gray-700 transition-all"
                            placeholder="Add detailed instructions..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Priority</label>
                            <div className="relative">
                                <Flag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full py-2.5 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] appearance-none bg-white text-gray-700 font-medium cursor-pointer"
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Due Date</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full py-2.5 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] text-gray-600 font-medium cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pb-2">
                        <label className="text-sm font-bold text-gray-700">Task Tag</label>
                        <div className="flex flex-wrap gap-2">
                            {['General', 'Design', 'Development', 'Meeting'].map(t => (
                                <button
                                    type="button"
                                    key={t}
                                    onClick={() => setTag(t)}
                                    className={clsx(
                                        "px-4 py-2 rounded-lg text-xs font-bold transition-all border",
                                        tag === t 
                                            ? "bg-[#4F7CF3]/10 border-[#4F7CF3] text-[#4F7CF3] shadow-sm" 
                                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-[#4F7CF3] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#3A62D7] transition-colors"
                        >
                            {task ? 'Save Changes' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}