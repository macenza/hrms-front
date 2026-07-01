'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { employeeService } from '@/services/employeeService';
import apiClient from '@/services/apiClient';
import { 
    Download, Upload, CheckCircle2, AlertTriangle, AlertCircle, 
    X, RefreshCw, ChevronDown, ChevronUp, Loader2, Send, Check, AlertOctagon
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

interface ImportEmployeesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess?: () => void;
}

interface ImportSummary {
    totalRows: number;
    successCount: number;
    skippedCount: number;
    duplicateCount: number;
    failedCount: number;
    imported: Array<{ name: string; email: string; password: string }>;
    failures: Array<{ row: number; name?: string; email?: string; reason: string }>;
}

interface EmailProgress {
    isSending: boolean;
    total: number;
    current: number;
    success: number;
    failures: Array<{ name: string; email: string; password: string; error: string }>;
}

export default function ImportEmployeesModal({ isOpen, onClose, onImportSuccess }: ImportEmployeesModalProps) {
    // Basic States
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [file, setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<'add' | 'overwrite'>('add');
    const [employeesExist, setEmployeesExist] = useState(false);
    
    // UI Helpers
    const [isLoadingInit, setIsLoadingInit] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showFailures, setShowFailures] = useState(false);
    const [confirmOverwrite, setConfirmOverwrite] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Results Summary
    const [summary, setSummary] = useState<ImportSummary | null>(null);

    // Email progress state
    const [emailProgress, setEmailProgress] = useState<EmailProgress>({
        isSending: false,
        total: 0,
        current: 0,
        success: 0,
        failures: []
    });

    // Check if employees exist on load
    useEffect(() => {
        if (isOpen) {
            const checkExisting = async () => {
                setIsLoadingInit(true);
                try {
                    const res = await employeeService.checkExisting();
                    if (res.success) {
                        setEmployeesExist(res.exists);
                        setMode(res.exists ? 'add' : 'add');
                    }
                } catch (err) {
                    console.error('Failed to check existing employees:', err);
                } finally {
                    setIsLoadingInit(false);
                }
            };
            checkExisting();
        } else {
            // Reset state on modal close
            setStep(1);
            setFile(null);
            setMode('add');
            setEmployeesExist(false);
            setConfirmOverwrite(false);
            setSummary(null);
            setEmailProgress({
                isSending: false,
                total: 0,
                current: 0,
                success: 0,
                failures: []
            });
        }
    }, [isOpen]);

    // Handle Drag & Drop
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
        if (fileExt === 'xlsx' || fileExt === 'xls' || fileExt === 'csv') {
            setFile(selectedFile);
        } else {
            toast.error("Unsupported file format. Please upload .xlsx, .xls, or .csv");
        }
    };

    // Download Sample Template
    const handleDownloadTemplate = async () => {
        try {
            const response = await apiClient.get('/employees/import-template', { responseType: 'blob' });
            const contentType = response.headers['content-type'];
            const blob = new Blob([response.data], { 
                type: typeof contentType === 'string' ? contentType : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'Employee_Import_Template.xlsx';
            link.click();
            toast.success('Template downloaded successfully!');
        } catch (error) {
            console.error('Failed to download template:', error);
            toast.error('Failed to download import template.');
        }
    };

    // Handle Bulk Import
    const handleImport = async () => {
        if (!file) return;

        if (mode === 'overwrite' && !confirmOverwrite) {
            toast.error("Please confirm that you want to overwrite all employees.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('mode', mode);

            const res = await employeeService.bulkImport(formData);
            if (res.success) {
                setSummary(res.summary);
                setStep(2);
                if (onImportSuccess) onImportSuccess();
                toast.success(`Import complete! Processed ${res.summary.totalRows} rows.`);
            } else {
                toast.error(res.message || 'Import failed.');
            }
        } catch (err: any) {
            console.error(err);
            const serverMsg = err.response?.data?.message || 'Failed to import employees.';
            toast.error(serverMsg);
        } finally {
            setIsUploading(false);
        }
    };

    // Send credentials progressively
    const handleSendCredentials = async () => {
        if (!summary || summary.imported.length === 0) return;
        setStep(3);

        const listToSend = [...summary.imported];
        setEmailProgress({
            isSending: true,
            total: listToSend.length,
            current: 0,
            success: 0,
            failures: []
        });

        await sendProgressiveEmails(listToSend);
    };

    const sendProgressiveEmails = async (list: Array<{ name: string; email: string; password: string }>) => {
        const failures: any[] = [];
        let successCount = emailProgress.success;

        for (let i = 0; i < list.length; i++) {
            const emp = list[i];
            setEmailProgress(prev => ({ ...prev, current: i + 1 }));

            try {
                await employeeService.sendCredentials({
                    name: emp.name,
                    email: emp.email,
                    password: emp.password
                });
                successCount++;
                setEmailProgress(prev => ({ ...prev, success: successCount }));
            } catch (err: any) {
                console.error(`Failed to send email to ${emp.email}:`, err);
                failures.push({
                    name: emp.name,
                    email: emp.email,
                    password: emp.password,
                    error: err.response?.data?.message || err.message || 'SMTP delivery failed'
                });
                setEmailProgress(prev => ({ ...prev, failures: [...failures] }));
            }
        }

        setEmailProgress(prev => ({ ...prev, isSending: false }));
        if (failures.length === 0) {
            toast.success("All credentials sent successfully!");
        } else {
            toast.warning(`Sent credentials with ${failures.length} failures.`);
        }
    };

    const handleRetryFailed = async () => {
        const toRetry = [...emailProgress.failures];
        setEmailProgress(prev => ({
            ...prev,
            isSending: true,
            total: toRetry.length,
            current: 0,
            failures: []
        }));

        await sendProgressiveEmails(toRetry);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={() => {
                if (isUploading || emailProgress.isSending) return; // Block closing during active operations
                onClose();
            }} 
            title="Import Employees" 
            className="max-w-2xl"
        >
            {isLoadingInit ? (
                <div className="flex flex-col items-center justify-center p-8 gap-4 min-h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500" />
                    <span className="text-sm text-gray-500 font-medium dark:text-gray-400">Verifying database status...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* --- STEP 1: UPLOAD & OPTIONS --- */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Explanation Card */}
                            <div className="p-5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-100/30 dark:border-blue-900/20 rounded-2xl space-y-3 transition-colors">
                                <h3 className="text-sm font-extrabold text-blue-950 dark:text-blue-300">
                                    Import Employees
                                </h3>
                                <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 space-y-2">
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">Please make sure your file contains these required columns:</p>
                                    <ul className="list-disc pl-5 font-bold text-gray-950 dark:text-gray-100 grid grid-cols-2 gap-y-1 text-xs">
                                        <li>Employee</li>
                                        <li>Department</li>
                                        <li>Role</li>
                                        <li>Email</li>
                                        <li>Phone</li>
                                        <li>Joining Date</li>
                                    </ul>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                                        Any extra columns in the file will be added to the employee profile automatically.
                                    </p>
                                </div>
                            </div>

                            {/* Download Template & Upload Area */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Select Document File</span>
                                    <button 
                                        onClick={handleDownloadTemplate}
                                        className="text-xs font-bold text-[#6D5DFD] dark:text-[#8B7BFF] hover:underline flex items-center gap-1"
                                    >
                                        <Download size={14} /> Download Sample Template
                                    </button>
                                </div>

                                <div 
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                    className={cn(
                                        "h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer",
                                        dragActive 
                                            ? "border-[#6D5DFD] bg-[#6D5DFD]/5 dark:bg-[#6D5DFD]/10" 
                                            : "border-gray-300 dark:border-gray-800 bg-gray-50 hover:bg-white dark:bg-gray-950 dark:hover:bg-gray-900"
                                    )}
                                    onClick={() => document.getElementById('employee-file-input')?.click()}
                                >
                                    <input 
                                        id="employee-file-input"
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {file ? (
                                        <div className="space-y-2">
                                            <div className="mx-auto w-10 h-10 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 break-all">{file.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(1)} KB • Click to swap file</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-gray-500 dark:text-gray-400">
                                            <div className="mx-auto w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400">
                                                <Upload size={20} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Drag & drop your file here</p>
                                            <p className="text-xs text-gray-500">Supports .xlsx, .xls, and .csv up to 50MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Existing Employee Detection Options */}
                            {employeesExist && (
                                <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-5 transition-colors">
                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Existing Employees Detected</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Add to Existing option */}
                                        <label 
                                            className={cn(
                                                "border p-4 rounded-xl cursor-pointer flex flex-col gap-1 transition-all",
                                                mode === 'add' 
                                                    ? "border-blue-600 bg-blue-50/20 dark:border-blue-500 dark:bg-blue-950/10" 
                                                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="radio" 
                                                    name="import-mode" 
                                                    checked={mode === 'add'} 
                                                    onChange={() => { setMode('add'); setConfirmOverwrite(false); }}
                                                    className="text-blue-600 dark:text-blue-500 focus:ring-blue-500" 
                                                />
                                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Add to Existing</span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 pl-5 leading-relaxed">
                                                Preserves your current list. Adds only new employees and prevents duplicate emails/IDs.
                                            </span>
                                        </label>

                                        {/* Overwrite option */}
                                        <label 
                                            className={cn(
                                                "border p-4 rounded-xl cursor-pointer flex flex-col gap-1 transition-all",
                                                mode === 'overwrite' 
                                                    ? "border-red-600 bg-red-50/10 dark:border-red-500 dark:bg-red-950/10" 
                                                    : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="radio" 
                                                    name="import-mode" 
                                                    checked={mode === 'overwrite'} 
                                                    onChange={() => setMode('overwrite')}
                                                    className="text-red-600 dark:text-red-500 focus:ring-red-500" 
                                                />
                                                <span className="text-sm font-bold text-red-600 dark:text-red-400">Overwrite List</span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 pl-5 leading-relaxed">
                                                Replaces all current employee profiles with the contents of this template.
                                            </span>
                                        </label>
                                    </div>

                                    {/* Warn Overlay for Overwrite */}
                                    {mode === 'overwrite' && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 dark:bg-red-950/20 dark:border-red-900/30">
                                            <div className="flex gap-2.5 items-start">
                                                <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <span className="text-sm font-bold text-red-800 dark:text-red-400">Destructive Actions Warning</span>
                                                    <p className="text-xs text-red-700/95 dark:text-red-300/80 leading-relaxed">
                                                        This action will remove all existing employees and replace them with the uploaded file. This action cannot be undone.
                                                    </p>
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2.5 pl-7.5 cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={confirmOverwrite} 
                                                    onChange={(e) => setConfirmOverwrite(e.target.checked)}
                                                    className="rounded border-red-300 dark:border-red-900 text-red-600 focus:ring-red-500 dark:bg-gray-950" 
                                                />
                                                <span className="text-xs font-bold text-red-800 dark:text-red-400">I confirm I want to wipe and replace the employee list</span>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button variant="ghost" onClick={onClose} disabled={isUploading}>
                                    Cancel
                                </Button>
                                <Button 
                                    variant="primary" 
                                    onClick={handleImport}
                                    disabled={!file || isUploading || (mode === 'overwrite' && !confirmOverwrite)}
                                    className={cn(mode === 'overwrite' ? "bg-red-600 hover:bg-red-700" : "bg-[#6D5DFD] hover:bg-[#5b4eed]")}
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin mr-1.5" />
                                            Importing Data...
                                        </>
                                    ) : (
                                        'Start Import'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* --- STEP 2: SUMMARY & RESULTS --- */}
                    {step === 2 && summary && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Summary Grid Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl text-center">
                                    <div className="text-sm font-bold text-gray-500">Processed</div>
                                    <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-1">{summary.totalRows}</div>
                                </div>
                                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-center">
                                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Successful</div>
                                    <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{summary.successCount}</div>
                                </div>
                                <div className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl text-center">
                                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400">Duplicates</div>
                                    <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{summary.duplicateCount}</div>
                                </div>
                                <div className="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl text-center">
                                    <div className="text-sm font-bold text-red-600 dark:text-red-400">Failed</div>
                                    <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">{summary.failedCount}</div>
                                </div>
                            </div>

                            {/* Failures Breakdown */}
                            {summary.failures.length > 0 && (
                                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                    <button 
                                        onClick={() => setShowFailures(!showFailures)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900/50 transition-colors border-b border-gray-200 dark:border-gray-800"
                                    >
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <AlertTriangle size={16} className="text-amber-500" />
                                            View skipped / failed records ({summary.failures.length})
                                        </span>
                                        {showFailures ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>

                                    {showFailures && (
                                        <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                                            {summary.failures.map((err, idx) => (
                                                <div key={idx} className="p-3 text-xs flex justify-between gap-4 dark:text-gray-300">
                                                    <div className="space-y-0.5">
                                                        <span className="font-bold text-gray-500">Row {err.row}</span>
                                                        <span className="block font-medium">{err.name || 'N/A'} {err.email ? `(${err.email})` : ''}</span>
                                                    </div>
                                                    <span className="text-red-600 dark:text-red-400 font-bold shrink-0 text-right">{err.reason}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Choices */}
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                                    {summary.successCount > 0 
                                        ? `Created ${summary.successCount} employee records successfully. Would you like to email log-in credentials to them now?` 
                                        : "No employees were imported. Please check failures and try again."}
                                </span>

                                <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" onClick={onClose}>
                                        Save & Close
                                    </Button>
                                    {summary.successCount > 0 && (
                                        <Button 
                                            variant="primary" 
                                            onClick={handleSendCredentials}
                                            className="bg-[#6D5DFD] hover:bg-[#5b4eed] gap-1.5"
                                        >
                                            <Send size={14} /> Send Credentials
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- STEP 3: CREDENTIAL DELIVERY PROGRESS --- */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    {emailProgress.isSending ? 'Sending Credentials...' : 'Credential Delivery Finished'}
                                </h4>
                                
                                {/* Progress bar wrapper */}
                                <div className="w-full h-3.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden relative border border-gray-200/50 dark:border-gray-800">
                                    <div 
                                        className="h-full bg-[#6D5DFD] transition-all duration-300 rounded-full"
                                        style={{ width: `${(emailProgress.current / emailProgress.total) * 100}%` }}
                                    />
                                </div>

                                <div className="flex justify-between text-xs text-gray-500 font-medium">
                                    <span>Processing user {emailProgress.current} of {emailProgress.total}</span>
                                    <span>Success: {emailProgress.success}</span>
                                </div>
                            </div>

                            {/* Progress details */}
                            {emailProgress.isSending && summary && summary.imported[emailProgress.current - 1] && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-between text-xs transition-colors">
                                    <div className="space-y-0.5">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">
                                            {summary.imported[emailProgress.current - 1].name}
                                        </span>
                                        <span className="block text-gray-500">
                                            {summary.imported[emailProgress.current - 1].email}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#6D5DFD]">
                                        <Loader2 size={14} className="animate-spin" />
                                        <span className="font-bold">Sending...</span>
                                    </div>
                                </div>
                            )}

                            {/* Failures List */}
                            {emailProgress.failures.length > 0 && (
                                <div className="p-4 bg-red-50/50 border border-red-100 dark:bg-red-950/10 dark:border-red-900/30 rounded-xl space-y-3">
                                    <span className="text-xs font-bold text-red-800 dark:text-red-400 flex items-center gap-1.5">
                                        <AlertCircle size={14} /> Failed Email Deliveries ({emailProgress.failures.length})
                                    </span>
                                    <div className="max-h-40 overflow-y-auto divide-y divide-red-100 dark:divide-red-950/20">
                                        {emailProgress.failures.map((fail, idx) => (
                                            <div key={idx} className="py-2.5 text-xs flex justify-between gap-4 text-red-700 dark:text-red-400/90 font-medium">
                                                <div className="space-y-0.5">
                                                    <span className="font-bold">{fail.name}</span>
                                                    <span className="block text-gray-500 dark:text-gray-400">{fail.email}</span>
                                                </div>
                                                <span className="font-bold shrink-0">{fail.error}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Final Finished View Actions */}
                            {!emailProgress.isSending && (
                                <div className="border-t border-gray-100 dark:border-gray-800 pt-5 flex items-center justify-between">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {emailProgress.failures.length === 0 
                                            ? "Credentials sent successfully to all imported employees!" 
                                            : `Successfully sent ${emailProgress.success} emails. ${emailProgress.failures.length} failed.`}
                                    </span>

                                    <div className="flex gap-2">
                                        {emailProgress.failures.length > 0 && (
                                            <Button 
                                                variant="outline" 
                                                onClick={handleRetryFailed}
                                                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/20"
                                            >
                                                <RefreshCw size={14} className="mr-1.5" /> Retry Failed
                                            </Button>
                                        )}
                                        <Button variant="primary" onClick={onClose} className="bg-emerald-600 hover:bg-emerald-700">
                                            <Check size={14} className="mr-1.5" /> Done
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
