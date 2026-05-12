'use client';

import React from 'react';
import { MoreHorizontal, Calendar, CheckSquare, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

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
    onAddTask?: () => void; 
}

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
        case 'Critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10';
        case 'High': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10';
        case 'Medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10';
        case 'Low': return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50';
        default: return 'text-gray-500 dark:text-gray-400';
    }
};

const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

// Universal system avatar color generator
const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    const colors = [
        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
        'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
        'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

// Skeleton Loader
const TableRowSkeleton = () => (
    <tr className="animate-pulse bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <td className="px-6 py-4 space-y-2 w-1/3">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-16"></div>
        </td>
        <td className="px-6 py-4 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
        </td>
        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div></td>
        <td className="px-6 py-4"><div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded"></div></td>
        <td className="px-6 py-4 text-center"><div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto"></div></td>
    </tr>
);

export default function TaskListTab({
    tasks = [],
    isLoading = false,
    onTaskClick,
    onActionClick,
    onAddTask
}: TaskListTabProps) {
    
    const isInitialLoad = isLoading && tasks.length === 0;

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">
                    All Tasks <span className="text-gray-400 dark:text-gray-500 text-sm ml-2 transition-colors">({tasks.length})</span>
                </h2> 
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2 shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <CheckSquare size={16} className="text-gray-400 dark:text-gray-500" />
                        <span className="hidden sm:inline">Mark Multiple</span>
                    </Button>
                    <Button variant="primary" size="sm" onClick={onAddTask} className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none font-semibold">
                        <Plus size={16} strokeWidth={2.5} />
                        New Task
                    </Button>
                </div>
            </div>

            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm dark:shadow-none relative transition-colors duration-300">
                
                {/* Soft overlay for background fetches while data is still visible */}
                {isLoading && !isInitialLoad && (
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/20 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-200 backdrop-blur-[1px]">
                         <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-500" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-medium transition-colors">
                            <tr>
                                <th className="px-6 py-4 uppercase tracking-wider text-xs">Task Name</th>
                                <th className="px-6 py-4 uppercase tracking-wider text-xs">Assignee</th>
                                <th className="px-6 py-4 uppercase tracking-wider text-xs">Status</th>
                                <th className="px-6 py-4 uppercase tracking-wider text-xs">Priority</th>
                                <th className="px-6 py-4 uppercase tracking-wider text-xs">Due Date</th>
                                <th className="px-6 py-4 text-center uppercase tracking-wider text-xs">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                            {isInitialLoad ? (
                                Array.from({ length: 5 }).map((_, idx) => <TableRowSkeleton key={idx} />)
                            ) : tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 transition-colors">
                                        <div className="flex flex-col items-center justify-center">
                                            <CheckSquare size={32} className="text-gray-300 dark:text-gray-600 mb-3 transition-colors" />
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">No tasks found.</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">Get started by creating a new task for this project.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <tr
                                        key={task.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
                                        onClick={() => onTaskClick && onTaskClick(task.id)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {task.title}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded transition-colors">
                                                    {task.tag || 'General'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {task.assigneeAvatar ? (
                                                    <img src={task.assigneeAvatar} alt={task.assigneeName} className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 object-cover transition-colors" />
                                                ) : (
                                                    <div className={cn(
                                                        "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors",
                                                        getAvatarColor(task.assigneeName)
                                                    )}>
                                                        {getInitials(task.assigneeName)}
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors">{task.assigneeName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusBadgeVariant(task.status)}>
                                                {task.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2.5 py-1 rounded text-xs font-bold transition-colors", getPriorityColor(task.priority))}>
                                                {task.priority || 'Medium'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium transition-colors">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                                                {task.dueDate || 'No Date'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    if (onActionClick) onActionClick(task.id);
                                                }}
                                                className="p-1.5 h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all"
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