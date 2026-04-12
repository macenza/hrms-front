'use client';

import React from 'react';
import { MoreHorizontal, Calendar, CheckSquare, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Data Contracts for Backend Integration
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TaskRecord {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    tag: string;
    dueDate: string;
    assigneeName: string;
    assigneeAvatar?: string;
}

interface TaskListTabProps {
    tasks?: TaskRecord[];
    isLoading?: boolean;
    onTaskClick?: (taskId: string) => void;
    onActionClick?: (taskId: string) => void;
    onAddTask?: () => void; // Added for the creation modal
}

// Dynamic UI Helpers
const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
        case 'Completed': return 'success';
        case 'In Progress': return 'info';
        case 'To Do': return 'default';
        case 'Blocked': return 'error';
        default: return 'default';
    }
};

const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
        case 'Critical': return 'text-red-600 bg-red-50';
        case 'High': return 'text-orange-600 bg-orange-50';
        case 'Medium': return 'text-yellow-600 bg-yellow-50';
        case 'Low': return 'text-gray-600 bg-gray-50';
        default: return 'text-gray-500';
    }
};

const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function TaskListTab({
    tasks = [],
    isLoading = false,
    onTaskClick,
    onActionClick,
    onAddTask
}: TaskListTabProps) {

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-sm text-gray-500 font-medium">Loading project tasks...</p>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-300">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-bold text-gray-900">All Tasks <span className="text-gray-400 text-sm ml-2">({tasks.length})</span></h2>
                
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 shadow-sm bg-white">
                        <CheckSquare size={16} className="text-gray-400" />
                        <span className="hidden sm:inline">Mark Multiple</span>
                    </Button>
                    <Button variant="primary" size="sm" onClick={onAddTask} className="gap-2 shadow-sm shadow-blue-500/20">
                        <Plus size={16} strokeWidth={2.5} />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Main Task Table */}
            <Card className="border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">TASK NAME</th>
                                <th className="px-6 py-4">ASSIGNEE</th>
                                <th className="px-6 py-4">STATUS</th>
                                <th className="px-6 py-4">PRIORITY</th>
                                <th className="px-6 py-4">DUE DATE</th>
                                <th className="px-6 py-4 text-center">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <CheckSquare size={32} className="text-gray-300 mb-3" />
                                            <p className="text-sm font-semibold text-gray-900">No tasks found.</p>
                                            <p className="text-xs text-gray-500 mt-1">Get started by creating a new task for this project.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr
                                        key={task.id}
                                        className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                        onClick={() => onTaskClick && onTaskClick(task.id)}
                                    >
                                        {/* Task Title & Metadata */}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {task.title}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                                                    {task.tag || 'General'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Assignee */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {task.assigneeAvatar ? (
                                                    <img src={task.assigneeAvatar} alt={task.assigneeName} className="w-7 h-7 rounded-full border border-gray-200 object-cover" />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                                        {getInitials(task.assigneeName)}
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-700">{task.assigneeName}</span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusBadgeVariant(task.status)}>
                                                {task.status}
                                            </Badge>
                                        </td>

                                        {/* Priority */}
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2.5 py-1 rounded text-xs font-bold", getPriorityColor(task.priority))}>
                                                {task.priority || 'Medium'}
                                            </span>
                                        </td>

                                        {/* Due Date */}
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {task.dueDate || 'No Date'}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent row click from firing
                                                    if (onActionClick) onActionClick(task.id);
                                                }}
                                                className="p-1.5 h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
                                                aria-label="Task options"
                                            >
                                                <MoreHorizontal size={18} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}