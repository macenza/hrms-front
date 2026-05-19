'use client';

import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, X, ImageIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

/** Max size for profile photo selection (bytes). */
export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

/** `accept` attribute for the hidden file input. */
export const PROFILE_PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

export function validateProfilePhotoFile(file: File): string | null {
    if (!file.type.startsWith('image/')) {
        return 'Please choose an image file (JPEG, PNG, WebP, or GIF).';
    }
    if (file.size > PROFILE_PHOTO_MAX_BYTES) {
        return `Image must be ${PROFILE_PHOTO_MAX_BYTES / 1024 / 1024} MB or smaller.`;
    }
    return null;
}

export interface ProfilePhotoUploadStepProps {
    disabled?: boolean;
    file: File | null;
    onFileChange: (file: File | null) => void;
    /** Shown below local validation errors (e.g. upload failed). */
    error?: string;
}

/**
 * Step UI: pick a profile photo via click or drag-and-drop, preview, and clear.
 * Does not perform network I/O; parent owns the `File` and any API calls.
 */
export default function ProfilePhotoUploadStep({
    disabled = false,
    file,
    onFileChange,
    error: externalError,
}: ProfilePhotoUploadStepProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const applyFile = (next: File | null) => {
        setLocalError('');
        if (!next) {
            onFileChange(null);
            return;
        }
        const validationError = validateProfilePhotoFile(next);
        if (validationError) {
            setLocalError(validationError);
            return;
        }
        onFileChange(next);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const chosen = e.target.files?.[0];
        applyFile(chosen ?? null);
        e.target.value = '';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) applyFile(dropped);
    };

    const combinedError = localError || externalError;

    return (
        <div className="space-y-4">
            {combinedError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 transition-colors">
                    {combinedError}
                </div>
            )}

            {file && previewUrl && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 transition-colors">
                    <img
                        src={previewUrl}
                        alt="Selected profile preview"
                        className="w-24 h-24 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={file.name}>
                            {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {(file.size / 1024).toFixed(1)} KB — optional; uploads after the employee is created.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={disabled}
                                onClick={() => inputRef.current?.click()}
                            >
                                Replace
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={disabled}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => {
                                    applyFile(null);
                                    if (inputRef.current) inputRef.current.value = '';
                                }}
                            >
                                <X size={16} className="mr-1.5 inline" />
                                Remove
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative border-2 border-dashed rounded-xl min-h-[200px] flex flex-col items-center justify-center text-center transition-colors overflow-hidden',
                    disabled && 'opacity-60 cursor-not-allowed',
                    !disabled && 'cursor-pointer group',
                    isDragging && !disabled
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 scale-[1.01]'
                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    file && 'min-h-[120px] py-6'
                )}
            >
                {!disabled && (
                    <input
                        ref={inputRef}
                        type="file"
                        accept={PROFILE_PHOTO_ACCEPT}
                        aria-label="Upload profile photo"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                        disabled={disabled}
                        onChange={handleInputChange}
                    />
                )}

                <div className="pointer-events-none relative z-0 flex flex-col items-center px-6 py-8">
                    <div
                        className={cn(
                            'p-3 rounded-full mb-3 transition-transform',
                            isDragging && !disabled
                                ? 'bg-blue-600 dark:bg-blue-500 text-white scale-110'
                                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110'
                        )}
                    >
                        {file ? <ImageIcon size={24} /> : <UploadCloud size={24} />}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {file ? 'Drop another image to replace' : 'Upload profile photo'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                        {file
                            ? 'Or use Replace / Remove above.'
                            : 'Click or drag an image here. JPEG, PNG, WebP, or GIF — max 5 MB.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
