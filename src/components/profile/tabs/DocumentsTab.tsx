'use client';

import React, { useState } from 'react';
import { FileText, Image as ImageIcon, UploadCloud, MoreVertical, File, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Button } from '@/components/ui/Button';

// Data Contracts for Backend Integration
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
    isUploading?: boolean; // New state for file upload
    onUpload?: (file: File) => void;
    onActionClick?: (documentId: string) => void;
}

// Dynamic UI Helpers
const formatBytes = (bytes: number, decimals = 1) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const getDocumentStyle = (type: string) => {
    switch (type.toUpperCase()) {
        case 'PDF':
            return { icon: FileText, colorClass: 'text-red-500 bg-red-50 border-red-100' };
        case 'JPG':
        case 'JPEG':
        case 'PNG':
            return { icon: ImageIcon, colorClass: 'text-blue-500 bg-blue-50 border-blue-100' };
        case 'DOCX':
        case 'DOC':
            return { icon: FileText, colorClass: 'text-indigo-500 bg-indigo-50 border-indigo-100' };
        default:
            return { icon: File, colorClass: 'text-gray-500 bg-gray-50 border-gray-200' };
    }
};

export default function DocumentsTab({
    documents = [],
    isLoading = false,
    isUploading = false,
    onUpload,
    onActionClick
}: DocumentsTabProps) {
    const [isDragging, setIsDragging] = useState(false);

    // File Handlers
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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-sm text-gray-500 font-medium">Loading documents...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {/* Uploaded List */}
            <div className="lg:col-span-2">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Uploaded Documents</h2>
                {!documents || documents.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 border border-gray-200 border-dashed rounded-xl">
                        <p className="text-sm font-semibold text-gray-500">No documents uploaded yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {documents.map((doc) => {
                            const { icon: Icon, colorClass } = getDocumentStyle(doc.type);
                            return (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-4 truncate pr-4">
                                        <div className={cn("p-3 rounded-lg shrink-0 border", colorClass)}>
                                            <Icon size={24} />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-gray-900 truncate" title={doc.name}>
                                                {doc.name}
                                            </p>
                                            <p className="text-xs font-medium text-gray-500 mt-0.5">
                                                {doc.type} • {formatBytes(doc.sizeInBytes)} • {doc.uploadDate}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onActionClick && onActionClick(doc.id)}
                                        className="p-2 h-9 w-9 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all shrink-0"
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
                <h2 className="text-lg font-bold text-gray-900 mb-4">Upload New</h2>
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all h-64 overflow-hidden",
                        isUploading ? "border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed" : "cursor-pointer group",
                        isDragging && !isUploading ? "border-blue-600 bg-blue-50/50 scale-[1.02]" : "border-gray-300 hover:border-blue-600 hover:bg-gray-50"
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
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                            <p className="text-sm font-bold text-gray-900">Uploading...</p>
                            <p className="text-xs text-gray-500 mt-1">Please wait</p>
                        </div>
                    ) : (
                        <>
                            <div className={cn(
                                "p-4 rounded-full mb-4 transition-transform",
                                isDragging ? "bg-blue-600 text-white scale-110" : "bg-blue-50 text-blue-600 group-hover:scale-110"
                            )}>
                                <UploadCloud size={32} />
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                                {isDragging ? "Drop file here!" : "Drag & Drop or Click"}
                            </p>
                            <p className="text-xs text-gray-500 mt-2 font-medium">Supports PDF, JPG, PNG (Max 10MB)</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}