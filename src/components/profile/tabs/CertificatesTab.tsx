'use client';

import React, { useState } from 'react';
import { Download, Eye, UploadCloud, FileBadge, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

/** Max certificate file size (bytes). Kept in sync with UI copy below. */
export const CERTIFICATE_MAX_BYTES = 10 * 1024 * 1024;

export interface CertificateRecord {
    id: string;
    title: string;
    description: string;
    issueDate: string;
    fileUrl?: string;
    /** File size in bytes from API (for display). */
    sizeInBytes?: number;
}

interface CertificatesTabProps {
    certificates?: CertificateRecord[];
    isLoading?: boolean;
    /** Admin and HR can upload; employees can only view. */
    canUpload?: boolean;
    isUploading?: boolean;
    onUpload?: (file: File) => void;
}

const formatBytes = (bytes: number, decimals = 1) => {
    if (!Number.isFinite(bytes) || bytes < 0) return '—';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

function resolveCertificateFileUrl(fileUrl?: string): string | undefined {
    if (!fileUrl) return undefined;
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) return fileUrl;
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
    const root = base.replace(/\/api\/?$/i, '');
    return fileUrl.startsWith('/') ? `${root}${fileUrl}` : `${root}/${fileUrl}`;
}

export function validateCertificateFile(file: File): string | null {
    if (file.size > CERTIFICATE_MAX_BYTES) {
        return `File must be ${CERTIFICATE_MAX_BYTES / (1024 * 1024)} MB or smaller.`;
    }
    const allowed =
        file.type === 'application/pdf' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/webp';
    const ext = /\.(pdf|jpe?g|png|webp)$/i.test(file.name);
    if (!allowed && !ext) {
        return 'Please upload a PDF or image (JPEG, PNG, WebP).';
    }
    return null;
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
    canUpload = false,
    isUploading = false,
    onUpload,
}: CertificatesTabProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalError('');
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !onUpload || !canUpload) return;
        const err = validateCertificateFile(file);
        if (err) {
            setLocalError(err);
            return;
        }
        onUpload(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!canUpload || isUploading) return;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (!canUpload || isUploading || !onUpload) return;
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        const err = validateCertificateFile(file);
        if (err) {
            setLocalError(err);
            return;
        }
        onUpload(file);
    };

    const listSection = (
        <div className={cn(canUpload ? 'lg:col-span-2' : 'lg:col-span-3')}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">
                Certificates
            </h2>
            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 2 }).map((_, idx) => <CertificateSkeleton key={idx} />)
                ) : !certificates || certificates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 border-dashed rounded-xl transition-colors">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-full text-gray-400 dark:text-gray-500 mb-3 shadow-sm dark:shadow-none transition-colors">
                            <FileBadge size={32} />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                            No certificates yet
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center max-w-sm transition-colors">
                            {canUpload
                                ? 'Upload a PDF or image using the panel on the right.'
                                : 'Certificates will appear here once an administrator or HR uploads them.'}
                        </p>
                    </div>
                ) : (
                    certificates.map((cert) => {
                        const absoluteUrl = resolveCertificateFileUrl(cert.fileUrl);
                        const hasFile = Boolean(absoluteUrl);
                        const isPdf =
                            cert.title?.toLowerCase().endsWith('.pdf') ||
                            absoluteUrl?.toLowerCase().includes('.pdf');
                        const DocIcon = isPdf ? FileText : ImageIcon;

                        return (
                            <Card
                                key={cert.id}
                                className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 overflow-hidden group"
                            >
                                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                                    <div className="flex items-start gap-4 min-w-0">
                                        <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg shrink-0 transition-colors">
                                            <DocIcon size={24} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                {cert.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 transition-colors">
                                                {cert.description || 'Certificate file'}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider transition-colors">
                                                <span>Issued {cert.issueDate}</span>
                                                {cert.sizeInBytes != null && cert.sizeInBytes > 0 && (
                                                    <>
                                                        <span className="opacity-50">·</span>
                                                        <span className="normal-case tracking-normal text-gray-500 dark:text-gray-400">
                                                            {formatBytes(cert.sizeInBytes)}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800 transition-colors w-full md:w-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!hasFile}
                                            onClick={() => hasFile && window.open(absoluteUrl, '_blank', 'noopener,noreferrer')}
                                            className="gap-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium h-9 flex-1 md:flex-none transition-colors"
                                        >
                                            <Eye size={16} /> Preview
                                        </Button>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            disabled={!hasFile}
                                            onClick={() => {
                                                if (!absoluteUrl) return;
                                                const a = document.createElement('a');
                                                a.href = absoluteUrl;
                                                a.download = cert.title || 'certificate';
                                                a.target = '_blank';
                                                a.rel = 'noopener noreferrer';
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                            }}
                                            className="gap-2 font-medium h-9 shadow-sm shadow-blue-500/25 dark:shadow-none flex-1 md:flex-none"
                                        >
                                            <Download size={16} /> Download
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );

    const uploadSection =
        canUpload && onUpload ? (
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">
                    Upload certificate
                </h2>
                {localError && (
                    <div className="mb-3 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 transition-colors">
                        {localError}
                    </div>
                )}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        'relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[220px] overflow-hidden',
                        isUploading
                            ? 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-70 cursor-not-allowed'
                            : 'cursor-pointer group',
                        isDragging && !isUploading
                            ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 scale-[1.02]'
                            : !isUploading &&
                                  'border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    )}
                >
                    {!isUploading && (
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            title=""
                            disabled={isUploading}
                            aria-label="Upload certificate file"
                        />
                    )}
                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-500 mb-4" />
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 transition-colors">
                                Uploading…
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                                Please wait.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div
                                className={cn(
                                    'p-4 rounded-full mb-4 transition-transform duration-300',
                                    isDragging
                                        ? 'bg-blue-600 dark:bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/25'
                                        : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110'
                                )}
                            >
                                <UploadCloud size={32} />
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 transition-colors">
                                {isDragging ? 'Drop file here' : 'Drag & drop or click'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium transition-colors">
                                PDF or image — max {CERTIFICATE_MAX_BYTES / (1024 * 1024)} MB
                            </p>
                        </>
                    )}
                </div>
            </div>
        ) : null;

    return (
        <div
            className={cn(
                'grid grid-cols-1 gap-8 animate-in fade-in duration-300',
                canUpload ? 'lg:grid-cols-3' : ''
            )}
        >
            {listSection}
            {uploadSection}
        </div>
    );
}
