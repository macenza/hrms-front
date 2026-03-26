'use client';

import React from 'react';
import { MoreHorizontal, Calendar, CheckSquare } from 'lucide-react';
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
    onTaskClick?: (taskId: string) => void;
    onActionClick?: (taskId: string) => void;
}

// Mock Data Fallback
const mockTasks: TaskRecord[] = [
    { id: 'TSK-101', title: 'Research Competitor Analysis', status: 'To Do', priority: 'High', tag: 'Research', dueDate: 'Oct 24, 2023', assigneeName: 'Alice Johnson', assigneeAvatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 'TSK-102', title: 'Draft Wireframes for Home', status: 'To Do', priority: 'Medium', tag: 'Design', dueDate: 'Oct 25, 2023', assigneeName: 'Bob Smith', assigneeAvatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 'TSK-103', title: 'Setup React Project Repo', status: 'In Progress', priority: 'High', tag: 'Development', dueDate: 'Oct 20, 2023', assigneeName: 'Alice Johnson', assigneeAvatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 'TSK-104', title: 'Kickoff Meeting', status: 'Completed', priority: 'Low', tag: 'Meeting', dueDate: 'Oct 18, 2023', assigneeName: 'Sarah Lee', assigneeAvatar: 'https://i.pravatar.cc/150?u=6' },
];

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

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export default function TaskListTab({
    tasks = mockTasks,
    onTaskClick,
    onActionClick
}: TaskListTabProps) {

    return (
        <div className="animate-in fade-in duration-300">

            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">All Tasks</h2>
                <Button variant="outline" size="sm" className="gap-2 shadow-sm">
                    <CheckSquare size={16} className="text-gray-400" />
                    <span className="hidden sm:inline">Mark Multiple</span>
                </Button>
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
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No tasks assigned to this project yet.
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
                                                <span className="text-xs font-semibold text-gray-500">{task.id}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                                                    {task.tag}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Assignee */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {task.assigneeAvatar ? (
                                                    <img src={task.assigneeAvatar} alt={task.assigneeName} className="w-7 h-7 rounded-full border border-gray-200 object-cover" />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
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
                                                {task.priority}
                                            </span>
                                        </td>

                                        {/* Due Date */}
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {task.dueDate}
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
                                                className="p-1.5 h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
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