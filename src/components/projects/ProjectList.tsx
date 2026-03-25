'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';
import type { Project } from '@/app/(main)/projects/page';

interface ProjectListProps {
    projects: Project[];
    view: 'grid' | 'list';
}

export default function ProjectList({ projects, view }: ProjectListProps) {
    const router = useRouter();

    const handleProjectClick = (projectId: string) => {
        router.push(`/projects/${projectId}`);
    };

    if (view === 'grid') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => handleProjectClick(project.id)}
                        className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#4F7CF3]/30 transition-all cursor-pointer relative flex flex-col h-full"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className={clsx(
                                "px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide",
                                project.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                                project.status === 'In Progress' ? "bg-blue-50 text-[#4F7CF3]" : "bg-gray-100 text-gray-700"
                            )}>
                                {project.status}
                            </span>
                            <button className="text-gray-400 hover:text-gray-600 p-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal size={18} />
                            </button>
                        </div>

                        <div className="flex-1 mb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#4F7CF3] transition-colors">
                                {project.name}
                            </h3>
                            <p className="text-gray-500 text-sm line-clamp-2">{project.description}</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between text-xs font-semibold mb-2">
                                <span className="text-gray-600">Progress</span>
                                <span className={project.progress === 100 ? "text-emerald-600" : "text-[#4F7CF3]"}>
                                    {project.progress}%
                                </span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={clsx("h-full rounded-full transition-all duration-1000 ease-out",
                                        project.progress === 100 ? "bg-emerald-500" : "bg-[#4F7CF3]"
                                    )}
                                    style={{ width: `${project.progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                            <div className="flex -space-x-2">
                                {project.team.map((img, i) => (
                                    <img key={i} src={img} className="w-8 h-8 rounded-full border-2 border-white" alt="Team member" />
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-xs text-gray-400 font-bold">
                                    +
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                <Calendar size={14} />
                                <span>{new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                    <tr>
                        <th className="px-6 py-4">PROJECT NAME</th>
                        <th className="px-6 py-4">MANAGER</th>
                        <th className="px-6 py-4">STATUS</th>
                        <th className="px-6 py-4">PROGRESS</th>
                        <th className="px-6 py-4">DUE DATE</th>
                        <th className="px-6 py-4 text-center">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {projects.map((project) => (
                        <tr
                            key={project.id}
                            onClick={() => handleProjectClick(project.id)}
                            className="hover:bg-gray-50 cursor-pointer transition-colors group"
                        >
                            <td className="px-6 py-4">
                                <div className="font-bold text-gray-900 group-hover:text-[#4F7CF3] transition-colors">{project.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{project.tasks.open} open tasks</div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-700">{project.manager}</td>
                            <td className="px-6 py-4">
                                <span className={clsx(
                                    "px-2.5 py-1 rounded-full text-xs font-bold tracking-wide",
                                    project.status === 'Completed' ? "bg-emerald-100 text-emerald-700" :
                                    project.status === 'In Progress' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                )}>
                                    {project.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 w-48">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={clsx("h-full rounded-full", project.progress === 100 ? "bg-emerald-500" : "bg-[#4F7CF3]")}
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 w-8">{project.progress}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-medium">
                                {new Date(project.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button className="text-gray-400 hover:text-[#4F7CF3] p-2 transition-colors" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}