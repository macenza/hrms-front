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

const getProjectCardStyles = (idx: number) => {
    const themes = [
        // 0: Blue/Indigo
        {
            cardClass: 'hover:shadow-[0_20px_50px_-12px_rgba(59,130,246,0.2)] hover:border-blue-300 dark:hover:border-blue-850',
            borderLine: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500',
            hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
        },
        // 1: Green/Teal
        {
            cardClass: 'hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.2)] hover:border-emerald-300 dark:hover:border-emerald-850',
            borderLine: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400',
            hoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
        },
        // 2: Yellow/Amber
        {
            cardClass: 'hover:shadow-[0_20px_50px_-12px_rgba(245,158,11,0.22)] hover:border-amber-300 dark:hover:border-amber-800',
            borderLine: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500',
            hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
        },
        // 3: Red/Rose
        {
            cardClass: 'hover:shadow-[0_20px_50px_-12px_rgba(244,63,94,0.22)] hover:border-rose-300 dark:hover:border-rose-850',
            borderLine: 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-500',
            hoverText: 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
        },
        // 4: Purple/Fuchsia
        {
            cardClass: 'hover:shadow-[0_20px_50px_-12px_rgba(139,92,246,0.2)] hover:border-purple-300 dark:hover:border-purple-850',
            borderLine: 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-violet-500',
            hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400'
        },
        // 5: Black/Slate
        {
            cardClass: 'hover:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] dark:hover:shadow-[0_20px_50px_-12px_rgba(255,255,255,0.08)] hover:border-slate-400 dark:hover:border-slate-700',
            borderLine: 'bg-gradient-to-r from-slate-700 via-slate-800 to-slate-950 dark:from-slate-400 dark:via-slate-500 dark:to-slate-600',
            hoverText: 'group-hover:text-slate-800 dark:group-hover:text-slate-200'
        },
        // 6: Brown/Amber-900
        {
            cardClass: 'hover:shadow-[0_20px_50px_-12px_rgba(120,53,4,0.22)] hover:border-amber-700 dark:hover:border-amber-900',
            borderLine: 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950',
            hoverText: 'group-hover:text-amber-800 dark:group-hover:text-amber-600'
        }
    ];
    return themes[idx % themes.length];
};

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {projects.map((project, idx) => {
                const styles = getProjectCardStyles(idx);
                return (
                    <Card 
                        key={project.id} 
                        onClick={() => onActionClick(project.id)}
                        className={cn(
                            "group flex flex-col border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none cursor-pointer transition-all duration-300 relative overflow-hidden hover:-translate-y-1.5",
                            styles.cardClass
                        )}
                    >
                        {/* Top gradient border line */}
                        <div className={cn("absolute top-0 left-0 right-0 h-[4px]", styles.borderLine)} />
                        
                        <CardContent className="p-6 pt-7 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div className={cn(
                                    "p-2.5 rounded-xl shadow-sm dark:shadow-none transition-all duration-300 group-hover:scale-105",
                                    project.status === 'Completed' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
                                    project.status === 'On Hold' ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400" : 
                                    "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                )}>
                                    {project.status === 'Completed' ? <CheckCircle2 size={22} /> : <Timer size={22} />}
                                </div>
                            </div>
                            <h3 className={cn("text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors line-clamp-1", styles.hoverText)}>
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
                                {project.team && project.team.length > 0 && (
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
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium text-sm transition-colors">
                                <Calendar size={14} />
                                <span>{project.dueDate || project.deadline || 'No Set Date'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        })}
        </div>
    );
}