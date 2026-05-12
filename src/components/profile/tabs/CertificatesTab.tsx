'use client';

import React from 'react';
import { Award, Download, Eye, Plus, FileBadge } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export interface CertificateRecord {
    id: string;
    title: string;
    description: string;
    issueDate: string; 
    fileUrl?: string; 
}

interface CertificatesTabProps {
    certificates?: CertificateRecord[];
    isLoading?: boolean;
    onGenerate?: () => void;
    onPreview?: (certId: string) => void;
    onDownload?: (certId: string) => void;
}

const CertificateSkeleton = () => (
    <Card className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 transition-colors">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4 w-full md:w-2/3">
                <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0" />
                <div className="space-y-2 w-full">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-800/50 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-1/4 animate-pulse mt-2" />
                </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800 w-full md:w-auto">
                <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                <div className="h-9 w-36 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
        </CardContent>
    </Card>
);

export default function CertificatesTab({
    certificates = [],
    isLoading = false,
    onGenerate,
    onPreview,
    onDownload
}: CertificatesTabProps) {
    
    return (
        <div className="animate-in fade-in duration-300 space-y-6">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">
                    Issued Certificates
                </h2>
                <Button
                    variant="ghost"
                    onClick={onGenerate}
                    className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:text-blue-700 dark:hover:text-blue-300 transition-colors gap-2 font-semibold"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Generate Certificate
                </Button>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 2 }).map((_, idx) => <CertificateSkeleton key={idx} />)
                ) : !certificates || certificates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 border-dashed rounded-xl transition-colors">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-full text-gray-400 dark:text-gray-500 mb-3 shadow-sm dark:shadow-none transition-colors">
                            <FileBadge size={32} />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">No certificates found</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">This employee hasn't been issued any certificates yet.</p>
                    </div>
                ) : (
                    certificates.map((cert) => (
                        <Card
                            key={cert.id}
                            className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 overflow-hidden group"
                        >
                            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg shrink-0 transition-colors">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {cert.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 transition-colors">
                                            {cert.description}
                                        </p>
                                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1.5 uppercase tracking-wider transition-colors">
                                            Issued {cert.issueDate}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800 transition-colors w-full md:w-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPreview && onPreview(cert.id)}
                                        className="gap-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium h-9 flex-1 md:flex-none transition-colors"
                                    >
                                        <Eye size={16} /> Preview
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => onDownload && onDownload(cert.id)}
                                        className="gap-2 font-medium h-9 shadow-sm shadow-blue-500/25 dark:shadow-none flex-1 md:flex-none"
                                    >
                                        <Download size={16} /> Download PDF
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}