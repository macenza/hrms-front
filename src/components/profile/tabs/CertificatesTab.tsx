'use client';

import React from 'react';
import { Award, Download, Eye, Plus, FileBadge } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Data Contract for Backend Integration
export interface CertificateRecord {
    id: string;
    title: string;
    description: string;
    issueDate: string; // e.g., 'Oct 2023' or ISO string
    fileUrl?: string; // URL provided by the backend to fetch the PDF
}

interface CertificatesTabProps {
    certificates?: CertificateRecord[];
    onGenerate?: () => void;
    onPreview?: (certId: string) => void;
    onDownload?: (certId: string) => void;
}

// Mock Data Fallback
const mockCertificates: CertificateRecord[] = [
    { id: 'CERT-001', title: 'Appreciation Certificate', description: 'For outstanding performance in Q3 2023.', issueDate: 'Oct 2023' },
    { id: 'CERT-002', title: 'Promotion Letter', description: 'Promoted to Senior UX Designer.', issueDate: 'Jan 2023' },
    { id: 'CERT-003', title: 'Internship Completion', description: 'Successfully completed UX Internship.', issueDate: 'Aug 2022' },
];

export default function CertificatesTab({
    certificates = mockCertificates,
    onGenerate,
    onPreview,
    onDownload
}: CertificatesTabProps) {

    return (
        <div className="animate-in fade-in duration-300">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg font-bold text-gray-900">Issued Certificates</h2>

                {/* Customized Button to maintain your original tinted design */}
                <Button
                    variant="ghost"
                    onClick={onGenerate}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors gap-2 font-semibold"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Generate Certificate
                </Button>
            </div>

            {/* Certificates List */}
            <div className="space-y-4">
                {certificates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-gray-200 border-dashed rounded-xl">
                        <div className="p-4 bg-white rounded-full text-gray-400 mb-3 shadow-sm">
                            <FileBadge size={32} />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">No certificates found</p>
                        <p className="text-xs text-gray-500 mt-1">This employee hasn't been issued any certificates yet.</p>
                    </div>
                ) : (
                    certificates.map((cert) => (
                        <Card key={cert.id} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">

                                {/* Certificate Details */}
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">{cert.title}</h3>
                                        <p className="text-sm text-gray-600 mt-0.5">{cert.description}</p>
                                        <p className="text-xs font-medium text-gray-400 mt-1.5 uppercase tracking-wider">
                                            Issued {cert.issueDate}
                                        </p>
                                    </div>
                                </div>

                                {/* Document Actions */}
                                <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onPreview && onPreview(cert.id)}
                                        className="gap-2 text-gray-600 font-medium h-9"
                                    >
                                        <Eye size={16} /> Preview
                                    </Button>

                                    {/* Customizing standard button to maintain the dark gray styling */}
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => onDownload && onDownload(cert.id)}
                                        className="gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium h-9 shadow-sm"
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