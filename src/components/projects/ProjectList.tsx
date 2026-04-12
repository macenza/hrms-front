'use client';

import React from 'react';
import { Calendar, CheckCircle2, MoreVertical, Timer, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';

export interface Project {
    id: string;
    name: string;
    description: string;
    manager: string;
    dueDate: string;
    progress: number;
    status: 'In Progress' | 'Completed' | 'On Hold';
    team: string[]; // Array of avatar URLs
    tasks: { total: number; open: number };
}

interface ProjectListProps {
    projects: Project[];
    view: 'grid' | 'list';
    onActionClick: (id: string) => void; // This will now serve as our primary navigation click
}

export default function ProjectList({ projects, view, onActionClick }: ProjectListProps) {
    if (view === 'list') {
        return (
            <Card className="border-gray-200 overflow-hidden shadow-sm animate-in fade-in duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Manager</th>
                                <th className="px-6 py-4">Progress</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {projects.map((project) => (
                                <tr 
                                    key={project.id} 
                                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                    onClick={() => onActionClick(project.id)} // Click anywhere on the row to navigate
                                >
                                    <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {project.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{project.manager}</td>
                                    <td className="px-6 py-4 w-48">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={cn("h-full rounded-full transition-all duration-500", project.progress === 100 ? "bg-emerald-500" : "bg-blue-600")} 
                                                    style={{ width: `${project.progress}%` }} 
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-gray-500 w-8">{project.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {project.dueDate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            project.status === 'Completed' ? "bg-emerald-100 text-emerald-700" : 
                                            project.status === 'On Hold' ? "bg-orange-100 text-orange-700" : 
                                            "bg-blue-100 text-blue-700"
                                        )}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation(); // Stop row click
                                                onActionClick(project.id);
                                            }} 
                                            className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-900 transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {projects.map((project) => (
                <Card 
                    key={project.id} 
                    onClick={() => onActionClick(project.id)} // Click anywhere on the card to navigate
                    className="group hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-300 bg-white"
                >
                    <CardContent className="p-6 flex flex-col h-full">
                        
                        {/* Header Icons */}
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn(
                                "p-2.5 rounded-xl shadow-sm",
                                project.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : 
                                project.status === 'On Hold' ? "bg-orange-50 text-orange-600" : 
                                "bg-blue-50 text-blue-600"
                            )}>
                                {project.status === 'Completed' ? <CheckCircle2 size={22} /> : <Timer size={22} />}
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); // Stop card click
                                    onActionClick(project.id);
                                }} 
                                className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                            >
                                <MoreVertical size={20} />
                            </button>
                        </div>

                        {/* Title & Desc */}
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{project.name}</h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2 min-h-[40px]">{project.description}</p>

                        <div className="flex-grow" /> {/* Pushes footer to the bottom */}

                        {/* Progress Bar */}
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={cn("h-full rounded-full transition-all duration-500", project.progress === 100 ? "bg-emerald-500" : "bg-blue-600")} 
                                    style={{ width: `${project.progress}%` }} 
                                />
                            </div>
                        </div>

                        {/* Footer (Team & Date) */}
                        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center">
                                {/* Safe Team Rendering */}
                                {project.team && project.team.length > 0 ? (
                                    <div className="flex -space-x-2">
                                        {project.team.slice(0, 3).map((avatar, i) => (
                                            <img key={i} src={avatar} className="w-8 h-8 rounded-full border-2 border-white object-cover bg-gray-50 shadow-sm" alt="team member" />
                                        ))}
                                        {project.team.length > 3 && (
                                            <div className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                                                +{project.team.length - 3}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                        <Users size={12} /> Unassigned
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                                <Calendar size={14} />
                                <span>{project.dueDate}</span>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            ))}
        </div>
    );
}