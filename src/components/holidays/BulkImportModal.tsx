'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useBulkImportHolidays } from '@/hooks/api/useHolidays';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BulkImportModal({ isOpen, onClose }: BulkImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bulkImport = useBulkImportHolidays();

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = () => setIsDragOver(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
            setFile(f);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) setFile(f);
    };

    const handleSubmit = async () => {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            await bulkImport.mutateAsync(formData);
            setFile(null);
            onClose();
        } catch {
            // Error toast handled by mutation hook
        }
    };

    const handleClose = () => {
        setFile(null);
        bulkImport.reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Bulk Import Holidays</h3>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Format Instructions */}
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">File Format Requirements:</p>
                        <ul className="text-[11px] text-blue-600 dark:text-blue-400 space-y-0.5 font-medium list-disc list-inside">
                            <li>CSV (.csv) or Excel (.xlsx) file</li>
                            <li>Required columns: <span className="font-bold">name</span>, <span className="font-bold">date</span></li>
                            <li>Optional: country, state, type, description</li>
                            <li>Date format: YYYY-MM-DD (e.g., 2026-01-26)</li>
                        </ul>
                    </div>

                    {/* Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                            ${isDragOver
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                : file
                                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30'
                            }
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        {file ? (
                            <div className="flex flex-col items-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{file.name}</p>
                                <p className="text-xs text-gray-500 mt-1 font-medium">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    Drag & drop your file here
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">or click to browse</p>
                            </div>
                        )}
                    </div>

                    {/* Import Results */}
                    {bulkImport.data?.results && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 space-y-2">
                            <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Import Results:</p>
                            <div className="flex gap-4 text-xs font-semibold">
                                <span className="text-emerald-600">✓ {bulkImport.data.results.created} created</span>
                                <span className="text-amber-600">⏭ {bulkImport.data.results.skipped} skipped</span>
                            </div>
                            {bulkImport.data.results.errors?.length > 0 && (
                                <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                                    {bulkImport.data.results.errors.map((err: { row: number; message: string }, i: number) => (
                                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-red-600 dark:text-red-400">
                                            <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                            <span>Row {err.row}: {err.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <Button type="button" variant="ghost" onClick={handleClose} className="font-semibold text-gray-600 dark:text-gray-400">
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!file || bulkImport.isPending}
                        className="gap-2 font-bold shadow-sm shadow-blue-500/25 dark:shadow-none"
                    >
                        {bulkImport.isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        Import Holidays
                    </Button>
                </div>
            </div>
        </div>
    );
}
