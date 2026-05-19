'use client';
import React from 'react';
import { Calendar, CheckCircle2, MoreVertical, Timer, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';

export interface Project {
    id: string;
    name: string;
    description: string;
    // THE FIX: Flexible manager typing to accept any envelope structure
    manager?: any; 
    managerName?: string;
    // THE FIX: Safe date fallbacks
    dueDate?: string;
    deadline?: string; 
    status: string;
    team?: string[]; 
    tasks?: { total: number; open: number };
}

interface ProjectListProps {
    projects: Project[];
    view: 'grid' | 'list';
    onActionClick: (id: string) => void; 
}

export default function ProjectList({ projects, view, onActionClick }: ProjectListProps) {
    
    // THE FIX: Universal safe extractor for Manager Name
    const getManagerName = (p: Project) => {
        if (p.managerName) return p.managerName;
        if (typeof p.manager === 'object' && p.manager?.name) return p.manager.name;
        if (typeof p.manager === 'string') return p.manager;
        return 'Unassigned';
    };

    if (view === 'list') {
        return (
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm dark:shadow-none animate-in fade-in duration-300 transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800 uppercase tracking-wider text-xs transition-colors">
                            <tr>
                                <th className="px-6 py-4">Project</th>
                                <th className="px-6 py-4">Manager</th>
                                {/* PROGRESS BAR REMOVED */}
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 transition-colors">
                            {projects.map((project) => (
                                <tr 
                                    key={project.id} 
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                                    onClick={() => onActionClick(project.id)}
                                >
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {project.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 transition-colors">
                                        {/* THE FIX: Safe Manager Name Mapping */}
                                        {getManagerName(project)}
                                    </td>
                                    
                                    {/* PROGRESS BAR REMOVED */}

                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                                            {/* THE FIX: Date mapping fallback */}
                                            {project.dueDate || project.deadline || 'No Set Date'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
                                            project.status === 'Completed' ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : 
                                            project.status === 'On Hold' ? "bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400" : 
                                            "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                        )}>
                                            {project.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onActionClick(project.id);
                                            }} 
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
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
                    onClick={() => onActionClick(project.id)}
                    className="group flex flex-col border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none hover:border-blue-300 dark:hover:border-blue-900/50 hover:shadow-md dark:hover:shadow-none cursor-pointer transition-all duration-300"
                >
                    <CardContent className="p-6 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className={cn(
                                "p-2.5 rounded-xl shadow-sm dark:shadow-none transition-colors",
                                project.status === 'Completed' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                                project.status === 'On Hold' ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400" : 
                                "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            )}>
                                {project.status === 'Completed' ? <CheckCircle2 size={22} /> : <Timer size={22} />}
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    onActionClick(project.id);
                                }} 
                                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                            >
                                <MoreVertical size={20} />
                            </button>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {project.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 min-h-[40px] transition-colors">
                            {project.description}
                        </p> 
                        
                        <div className="flex-grow" /> 
                        
                        {/* THE FIX: Removed Progress Bar, Inserted Manager Identity Row */}
                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 transition-colors">
                            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Project Manager</p>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-[10px] font-bold shadow-sm dark:shadow-none">
                                    {getManagerName(project).charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {getManagerName(project)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between transition-colors">
                            <div className="flex items-center">
                                {project.team && project.team.length > 0 ? (
                                    <div className="flex -space-x-2">
                                        {project.team.slice(0, 3).map((avatar, i) => (
                                            <img key={i} src={avatar} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 object-cover bg-gray-50 dark:bg-gray-800 shadow-sm dark:shadow-none transition-colors" alt="team member" />
                                        ))}
                                        {project.team.length > 3 && (
                                            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400 shadow-sm dark:shadow-none transition-colors">
                                                +{project.team.length - 3}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded-md transition-colors">
                                        <Users size={12} /> Unassigned
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium text-sm transition-colors">
                                <Calendar size={14} />
                                <span>{project.dueDate || project.deadline || 'No Set Date'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}