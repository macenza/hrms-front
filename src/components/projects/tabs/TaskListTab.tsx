'use client';

import React from 'react';
import { MoreHorizontal, MessageSquare, Paperclip, Calendar, CheckSquare } from 'lucide-react';
import clsx from 'clsx';

const mockTasks = [
    { id: 'TSK-101', title: 'Research Competitor Analysis', status: 'To Do', priority: 'High', tag: 'Research', dueDate: 'Oct 24, 2023', assignee: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 'TSK-102', title: 'Draft Wireframes for Home', status: 'To Do', priority: 'Medium', tag: 'Design', dueDate: 'Oct 25, 2023', assignee: 'Bob Smith', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 'TSK-103', title: 'Setup React Project Repo', status: 'In Progress', priority: 'High', tag: 'Development', dueDate: 'Oct 20, 2023', assignee: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 'TSK-104', title: 'Kickoff Meeting', status: 'Completed', priority: 'Low', tag: 'Meeting', dueDate: 'Oct 18, 2023', assignee: 'Sarah Lee', avatar: 'https://i.pravatar.cc/150?u=6' },
];

export default function TaskListTab() {
    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">All Tasks</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                    <CheckSquare size={16} className="text-gray-400" /> Mark Multiple
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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
                    <tbody className="divide-y divide-gray-100">
                        {mockTasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900 group-hover:text-[#4F7CF3] transition-colors">{task.title}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-semibold text-gray-500">{task.id}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                            {task.tag}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={task.avatar} alt={task.assignee} className="w-7 h-7 rounded-full border border-gray-200" />
                                        <span className="font-medium text-gray-700">{task.assignee}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        "px-2.5 py-1 rounded-full text-xs font-bold",
                                        task.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                                        task.status === 'In Progress' ? "bg-blue-50 text-[#4F7CF3]" : "bg-gray-100 text-gray-600"
                                    )}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={clsx(
                                        "font-bold text-xs",
                                        task.priority === 'High' ? "text-red-500" :
                                        task.priority === 'Medium' ? "text-yellow-600" : "text-gray-500"
                                    )}>
                                        {task.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-medium flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400" /> {task.dueDate}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button className="text-gray-400 hover:text-gray-700 p-1 transition-colors">
                                        <MoreHorizontal size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}