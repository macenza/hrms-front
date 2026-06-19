// src/components/recruitment/components/JobDetailsModal.tsx
"use client";

import React from "react";
import { X, Copy } from "lucide-react";
import { JobOpening } from "../types";

interface JobDetailsModalProps {
    job: JobOpening;
    onClose: () => void;
    onCopyUrl: (slug: string, id: string) => void;
}

export default function JobDetailsModal({ job, onClose, onCopyUrl }: JobDetailsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col p-6 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{job.title}</h3>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 py-4 overflow-y-auto space-y-4 max-h-[60vh] custom-scrollbar text-sm text-gray-700 dark:text-gray-300">
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-955 p-4 rounded-xl">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Department</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{job.department}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Location</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{job.location}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Employment Type</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{job.employmentType}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block">Experience Required</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{job.experienceRequired}</span>
                        </div>
                    </div>
                    
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 block mb-1">Description</span>
                        <p className="leading-relaxed whitespace-pre-line text-gray-600 dark:text-gray-355 bg-gray-50/50 dark:bg-gray-955/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                            {job.description || "No description provided."}
                        </p>
                    </div>
                    
                    {job.status === "Active" && (
                        <div className="border-t border-dashed border-gray-200 dark:border-gray-850 pt-4 flex items-center justify-between">
                            <span className="text-xs text-gray-455 dark:text-gray-400 font-semibold">Copy and share career URL:</span>
                            <button
                                onClick={() => onCopyUrl(job.slug, job.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-black transition-colors"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                Copy Link
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
