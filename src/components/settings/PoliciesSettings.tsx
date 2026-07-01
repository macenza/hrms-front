'use client';

import React, { useState, useRef } from 'react';
import { FileText, UploadCloud, Lock, Eye, CheckCircle, Info, ShieldAlert, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { usePolicies, useUploadPolicy, Policy } from '@/hooks/api/usePolicies';
import { cn } from '@/utils/cn';

// Types for Policies UI mapping
type PolicyCategory = 'hr' | 'admin' | 'it' | 'company';

interface PolicyCardConfig {
    id: PolicyCategory;
    title: string;
    description: string;
    gradientClass: string;
    iconColorClass: string;
    badgeClass: string;
}

const POLICY_CARDS: PolicyCardConfig[] = [
    {
        id: 'hr',
        title: 'HR Policy',
        description: 'Employee onboarding, workplace conduct, and standards.',
        gradientClass: 'from-rose-500/10 to-purple-500/10 border-rose-100 dark:border-rose-950/30 hover:border-rose-300 dark:hover:border-rose-900',
        iconColorClass: 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/20',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
    },
    {
        id: 'admin',
        title: 'Admin Policy',
        description: 'Office operational procedures, facility rules, and templates.',
        gradientClass: 'from-blue-500/10 to-indigo-500/10 border-blue-100 dark:border-blue-950/30 hover:border-blue-300 dark:hover:border-blue-900',
        iconColorClass: 'text-blue-500 bg-blue-500/10 dark:bg-blue-500/20',
        badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
    },
    {
        id: 'it',
        title: 'IT Policy',
        description: 'Information security guidelines, devices usage, and access rules.',
        gradientClass: 'from-emerald-500/10 to-teal-500/10 border-emerald-100 dark:border-emerald-950/30 hover:border-emerald-300 dark:hover:border-emerald-900',
        iconColorClass: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
    },
    {
        id: 'company',
        title: 'Company Policy',
        description: 'Corporate vision, strategy alignment, and general regulations.',
        gradientClass: 'from-violet-500/10 to-fuchsia-500/10 border-violet-100 dark:border-violet-950/30 hover:border-violet-300 dark:hover:border-violet-900',
        iconColorClass: 'text-violet-500 bg-violet-500/10 dark:bg-violet-500/20',
        badgeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300'
    }
];

// Helper to format file size in KB/MB
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function PoliciesSettings() {
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role?.toLowerCase() || 'employee';

    // State managers
    const [selectedCategory, setSelectedCategory] = useState<PolicyCategory | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // React Query mutations and queries
    const { data: policies = [], isLoading: isQueryLoading } = usePolicies();
    const uploadPolicyMutation = useUploadPolicy();

    // Map policies by category key for instant access
    const policyMap = React.useMemo(() => {
        const map: Record<string, Policy> = {};
        policies.forEach((policy) => {
            if (policy.category) {
                map[policy.category.toLowerCase()] = policy;
            }
        });
        return map;
    }, [policies]);

    // Check permissions dynamically
    const canUpload = (category: PolicyCategory) => {
        if (userRole === 'admin') return true;
        if (userRole === 'hr' && category === 'hr') return true;
        return false;
    };

    const handleOpenModal = (category: PolicyCategory) => {
        setSelectedCategory(category);
        setSelectedFile(null);
        setFileError(null);
    };

    const handleCloseModal = () => {
        setSelectedCategory(null);
        setSelectedFile(null);
        setFileError(null);
    };

    // Client-side file validation
    const validateFile = (file: File) => {
        setFileError(null);
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            setFileError('Invalid file type. Only PDF documents are accepted.');
            return false;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setFileError('File exceeds size limit. Maximum file size allowed is 10MB.');
            return false;
        }
        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
            }
        }
    };

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
            const file = e.dataTransfer.files[0];
            if (validateFile(file)) {
                setSelectedFile(file);
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory || !selectedFile) return;

        const formData = new FormData();
        formData.append('category', selectedCategory);
        formData.append('file', selectedFile);

        try {
            await uploadPolicyMutation.mutateAsync(formData);
            toast.success(`${selectedCategory.toUpperCase()} Policy successfully uploaded!`);
            handleCloseModal();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to upload policy. Please try again.');
        }
    };

    // Construct backend preview absolute URL
    const getPreviewUrl = (policy: Policy) => {
        if (policy.filePath.startsWith('http')) return policy.filePath;
        const apiBase = process.env.NEXT_PUBLIC_API_URL
            ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
            : 'http://localhost:4000';
        return `${apiBase}${policy.filePath}`;
    };

    const activePolicy = selectedCategory ? policyMap[selectedCategory] : null;
    const writePermission = selectedCategory ? canUpload(selectedCategory) : false;

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header info card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Policies & Compliance</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                        Review, download, or manage company regulations and compliance guidelines.
                    </p>
                </div>
            </div>

            {/* Grid of Policies */}
            {isQueryLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((id) => (
                        <div key={id} className="h-44 bg-gray-100 dark:bg-gray-800/40 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {POLICY_CARDS.map((card) => {
                        const policy = policyMap[card.id];
                        const isUploaded = !!policy;
                        return (
                            <button
                                key={card.id}
                                onClick={() => handleOpenModal(card.id)}
                                className={cn(
                                    "text-left flex flex-col justify-between p-6 bg-gradient-to-br border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary/40",
                                    card.gradientClass
                                )}
                            >
                                {/* Glow highlights */}
                                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-primary/5 blur-xl group-hover:scale-150 transition-transform duration-500" />
                                
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className={cn("p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110", card.iconColorClass)}>
                                            <FileText size={22} />
                                        </div>
                                        {isUploaded ? (
                                            <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full text-[11px] font-bold">
                                                <CheckCircle size={12} /> Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-[11px] font-bold">
                                                <Info size={12} /> Unset
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 transition-colors">{card.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed transition-colors">{card.description}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-gray-100/50 dark:border-gray-800/50 pt-4 w-full text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                                    <span className="flex items-center gap-1.5">
                                        {isUploaded 
                                            ? ((userRole === 'employee' || userRole === 'manager') ? 'View Document' : 'View & Manage Document') 
                                            : 'Setup Policy'}
                                    </span>
                                    <ArrowRight size={14} />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Premium Policy Modal */}
            <Modal
                isOpen={selectedCategory !== null}
                onClose={handleCloseModal}
                title={selectedCategory ? POLICY_CARDS.find(c => c.id === selectedCategory)?.title || 'Policy Manager' : 'Policy Manager'}
                className="max-w-xl"
            >
                <div className="space-y-6">
                    {/* View Policy Section */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                            <Eye size={12} /> View Policy
                        </h4>
                        {activePolicy ? (
                            <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl space-y-4 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0">
                                        <FileText size={20} />
                                    </div>
                                    <div className="overflow-hidden space-y-1">
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{activePolicy.fileName}</p>
                                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 dark:text-gray-500">
                                            <span>Size: {formatBytes(activePolicy.fileSize)}</span>
                                            <span>•</span>
                                            <span>Updated: {new Date(activePolicy.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-4 border-t border-gray-150 dark:border-gray-800 pt-3 text-xs text-gray-500">
                                    <span>Uploaded by: <strong className="text-gray-700 dark:text-gray-300 font-semibold">{typeof activePolicy.uploadedBy === 'object' ? activePolicy.uploadedBy?.name : 'Administrator'}</strong></span>
                                    <div className="flex items-center gap-3">
                                        <a
                                            href={getPreviewUrl(activePolicy)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
                                        >
                                            <Eye size={14} /> Preview
                                        </a>
                                        <span className="text-gray-300 dark:text-gray-700">|</span>
                                        <a
                                            href={getPreviewUrl(activePolicy)}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                fetch(getPreviewUrl(activePolicy))
                                                    .then(resp => resp.blob())
                                                    .then(blob => {
                                                        const url = window.URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.style.display = 'none';
                                                        a.href = url;
                                                        a.download = activePolicy.fileName || 'policy.pdf';
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        window.URL.revokeObjectURL(url);
                                                    })
                                                    .catch(err => {
                                                        console.error('Failed to download policy:', err);
                                                        window.open(getPreviewUrl(activePolicy), '_blank');
                                                    });
                                            }}
                                            className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline cursor-pointer"
                                        >
                                            <Download size={14} /> Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 rounded-xl text-center space-y-2 transition-colors">
                                <Info className="w-8 h-8 text-gray-400 mx-auto" />
                                <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No policy available</p>
                                <p className="text-xs text-gray-400 max-w-[280px] mx-auto leading-relaxed">
                                    This policy has not been uploaded yet. Please check back later.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Upload / Replace Section */}
                    {selectedCategory && writePermission && (
                        <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-5">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                                <UploadCloud size={12} /> Upload or Replace Policy
                            </h4>

                            <div
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                onClick={triggerFileInput}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 relative group overflow-hidden",
                                    dragActive
                                        ? "border-primary bg-primary/5"
                                        : "border-gray-250 dark:border-gray-800 bg-gray-50/20 hover:bg-gray-50/70 dark:hover:bg-gray-900/50 hover:border-primary/40"
                                )}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="application/pdf"
                                />
                                
                                {selectedFile ? (
                                    <div className="space-y-2">
                                        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto animate-bounce" />
                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate px-4">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-400">{formatBytes(selectedFile.size)} • PDF Document</p>
                                        <p className="text-[10px] text-primary font-bold mt-2 hover:underline">Click or drag to replace file</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <UploadCloud className="w-8 h-8 text-gray-400 mx-auto group-hover:scale-110 transition-transform text-primary/80" />
                                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Drag and drop your PDF here</p>
                                        <p className="text-xs text-gray-400">or click to browse local files (PDF only, up to 10MB)</p>
                                    </div>
                                )}
                            </div>

                            {fileError && (
                                <p className="text-xs text-red-500 font-semibold flex items-center gap-1.5">
                                    <ShieldAlert size={14} className="shrink-0" />
                                    {fileError}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseModal}
                                    disabled={uploadPolicyMutation.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={!selectedFile || uploadPolicyMutation.isPending}
                                    className="font-semibold shadow-md shadow-primary/10 gap-1.5"
                                >
                                    {uploadPolicyMutation.isPending ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud size={16} />
                                            Submit Policy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>
        </div>
    );
}
