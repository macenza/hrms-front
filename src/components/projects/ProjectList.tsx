'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MoreHorizontal, FolderOpen } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// 1. Data Contract (Aligned with your Projects Page)
export interface Project {
    id: string;
    name: string;
    description: string;
    manager: string;
    status: 'In Progress' | 'Completed' | 'On Hold';
    progress: number;
    dueDate: string;
    team: string[]; // Array of avatar URLs
    tasks: {
        total: number;
        open: number;
    };
}

interface ProjectListProps {
    projects: Project[];
    view: 'grid' | 'list';
    onActionClick?: (projectId: string) => void;
}

// 2. Helper for Status Badge Variants
const getStatusVariant = (status: Project['status']) => {
    switch (status) {
        case 'Completed': return 'success';
        case 'In Progress': return 'info';
        case 'On Hold': return 'warning';
        default: return 'default';
    }
};

export default function ProjectList({ projects, view, onActionClick }: ProjectListProps) {
    const router = useRouter();

    const handleProjectClick = (projectId: string) => {
        router.push(`/projects/${projectId}`);
    };

    // 3. Empty State Fallback
    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
                <div className="p-4 bg-gray-50 rounded-full text-gray-400 mb-4">
                    <FolderOpen size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No projects found</h3>
                <p className="text-gray-500 max-w-xs mt-1">Try adjusting your filters or create a new project to get started.</p>
            </div>
        );
    }

    // 4. Grid View Rendering
    if (view === 'grid') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {projects.map((project) => (
                    <Card
                        key={project.id}
                        onClick={() => handleProjectClick(project.id)}
                        className="group hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col h-full border-gray-100"
                    >
                        <CardContent className="p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <Badge variant={getStatusVariant(project.status)}>
                                    {project.status}
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 opacity-100 lg:opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onActionClick?.(project.id);
                                    }}
                                >
                                    <MoreHorizontal size={18} />
                                </Button>
                            </div>

                            <div className="flex-1 mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {project.name}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                                    {project.description}
                                </p>
                            </div>

                            {/* Progress Bar Section */}
                            <div className="mb-6">
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className="text-gray-500 uppercase tracking-wider">Progress</span>
                                    <span className={cn(project.progress === 100 ? "text-emerald-600" : "text-blue-600")}>
                                        {project.progress}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-1000 ease-out",
                                            project.progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                                        )}
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Card Footer */}
                            <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                                <div className="flex -space-x-2">
                                    {project.team.slice(0, 3).map((img, i) => (
                                        <img key={i} src={img} className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" alt="Team" />
                                    ))}
                                    {project.team.length > 3 && (
                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] text-gray-600 font-bold">
                                            +{project.team.length - 3}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                                    <Calendar size={14} />
                                    <span>{new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    // 5. List View Rendering
    return (
        <Card className="border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-300">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold">
                        <tr>
                            <th className="px-6 py-4 tracking-wider">PROJECT NAME</th>
                            <th className="px-6 py-4 tracking-wider">MANAGER</th>
                            <th className="px-6 py-4 tracking-wider">STATUS</th>
                            <th className="px-6 py-4 tracking-wider">PROGRESS</th>
                            <th className="px-6 py-4 tracking-wider">DUE DATE</th>
                            <th className="px-6 py-4 text-center tracking-wider">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {projects.map((project) => (
                            <tr
                                key={project.id}
                                onClick={() => handleProjectClick(project.id)}
                                className="hover:bg-gray-50 cursor-pointer transition-colors group"
                            >
                                <td className="px-6 py-4">
                                    <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{project.name}</div>
                                    <div className="text-xs text-gray-500 mt-1 font-medium">{project.tasks.open} open tasks</div>
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-700">{project.manager}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={getStatusVariant(project.status)}>
                                        {project.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 w-48">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full rounded-full", project.progress === 100 ? "bg-emerald-500" : "bg-blue-600")}
                                                style={{ width: `${project.progress}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 w-8">{project.progress}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-500 font-semibold uppercase tracking-tight">
                                    {new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-400 hover:text-blue-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onActionClick?.(project.id);
                                        }}
                                    >
                                        <MoreHorizontal size={18} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}