'use client';

import React, { useState } from 'react';
import { FileText, Image as ImageIcon, UploadCloud, MoreVertical, File, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

export type DocumentExtension = 'PDF' | 'JPG' | 'PNG' | 'DOCX' | 'Other';

export interface DocumentRecord {
    id: string;
    name: string;
    type: DocumentExtension;
    sizeInBytes: number; 
    uploadDate: string;
    fileUrl?: string; 
}

interface DocumentsTabProps {
    documents?: DocumentRecord[];
    isLoading?: boolean;
    isUploading?: boolean;
    onUpload?: (file: File) => void;
    onActionClick?: (documentId: string) => void;
}

const formatBytes = (bytes: number, decimals = 1) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Premium Dark-Mode compatible document styling
const getDocumentStyle = (type: string) => {
    switch (type.toUpperCase()) {
        case 'PDF':
            return { icon: FileText, colorClass: 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' };
        case 'JPG':
        case 'JPEG':
        case 'PNG':
            return { icon: ImageIcon, colorClass: 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' };
        case 'DOCX':
        case 'DOC':
            return { icon: FileText, colorClass: 'text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20' };
        default:
            return { icon: File, colorClass: 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' };
    }
};

// Premium Skeleton Loader
const DocumentSkeleton = () => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm dark:shadow-none animate-pulse transition-colors">
        <div className="flex items-center gap-4 w-full pr-4">
            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="space-y-2 w-full">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800/50 rounded w-1/2" />
            </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
    </div>
);

export default function DocumentsTab({
    documents = [],
    isLoading = false,
    isUploading = false,
    onUpload,
    onActionClick
}: DocumentsTabProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && onUpload) {
            onUpload(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!isUploading) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (isUploading) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onUpload) {
            onUpload(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            
            {/* Document List */}
            <div className="lg:col-span-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Uploaded Documents</h2>
                
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, idx) => <DocumentSkeleton key={idx} />)}
                    </div>
                ) : !documents || documents.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 border-dashed rounded-xl transition-colors">
                        <div className="p-4 bg-white dark:bg-gray-800 w-16 h-16 mx-auto rounded-full text-gray-400 dark:text-gray-500 mb-3 shadow-sm dark:shadow-none flex items-center justify-center transition-colors">
                            <File size={24} />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">No documents uploaded yet.</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">Drag and drop a file to upload securely.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {documents.map((doc) => {
                            const { icon: Icon, colorClass } = getDocumentStyle(doc.type);
                            return (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm dark:shadow-none hover:border-blue-300 dark:hover:border-blue-900/50 hover:shadow-md dark:hover:shadow-none transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-4 truncate pr-4">
                                        <div className={cn("p-3 rounded-lg shrink-0 border transition-colors", colorClass)}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate transition-colors" title={doc.name}>
                                                {doc.name}
                                            </p>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">
                                                {doc.type} • {formatBytes(doc.sizeInBytes)} • {doc.uploadDate}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onActionClick && onActionClick(doc.id)}
                                        className="p-2 h-9 w-9 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all shrink-0"
                                        aria-label="Document options"
                                    >
                                        <MoreVertical size={18} />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Upload Zone */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 transition-colors">Upload New</h2>
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 h-64 overflow-hidden",
                        isUploading 
                            ? "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-70 cursor-not-allowed" 
                            : "cursor-pointer group",
                        isDragging && !isUploading 
                            ? "border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 scale-[1.02]" 
                            : !isUploading && "border-gray-300 dark:border-gray-700 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    )}
                >
                    {!isUploading && (
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            title=""
                            disabled={isUploading}
                        />
                    )}

                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-500 mb-4" />
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 transition-colors">Uploading...</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">Please wait, securing file.</p>
                        </div>
                    ) : (
                        <>
                            <div className={cn(
                                "p-4 rounded-full mb-4 transition-transform duration-300",
                                isDragging 
                                    ? "bg-blue-600 dark:bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/25" 
                                    : "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110"
                            )}>
                                <UploadCloud size={32} />
                            </div>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 transition-colors">
                                {isDragging ? "Drop file here!" : "Drag & Drop or Click"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium transition-colors">
                                Supports PDF, JPG, PNG (Max 10MB)
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}