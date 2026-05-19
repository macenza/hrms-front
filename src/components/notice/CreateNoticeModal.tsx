'use client';

import React, { useState, useEffect } from 'react';
import { AlignLeft, Tag, UploadCloud, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateNotice } from '@/hooks/api/useNotices';
import { cn } from '@/utils/cn';

export interface NoticePayload {
    title: string;
    category: string;
    isPinned: boolean;
    content: string;
    attachment: File | null;
}

interface CreateNoticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; 
}

const initialFormState: NoticePayload = {
    title: '',
    category: 'General',
    isPinned: false,
    content: '',
    attachment: null
};

export default function CreateNoticeModal({ isOpen, onClose, onSuccess }: CreateNoticeModalProps) {
    const [formData, setFormData] = useState<NoticePayload>(initialFormState);
    
    // Connect to React Query Mutation
    const createNoticeMutation = useCreateNotice();

    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
        }
    }, [isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }
            setFormData(prev => ({ ...prev, attachment: file }));
        }
    };

    const handleClose = () => {
        if (createNoticeMutation.isPending) return; 
        setFormData(initialFormState);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('category', formData.category);
            payload.append('isPinned', String(formData.isPinned));
            payload.append('content', formData.content);
            if (formData.attachment) {
                payload.append('file', formData.attachment);
            }
            
            await createNoticeMutation.mutateAsync(payload);
            
            onSuccess(); // Parent handles toast & closing
            handleClose();
        } catch (error: any) {
            console.error('Submission Error:', error);
            toast.error(error?.response?.data?.message || 'Failed to publish notice. Please try again.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Publish New Notice" className="max-w-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 space-y-6 p-2">
                    
                    {/* Notice Title */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors" htmlFor="title">Notice Title</label>
                        <Input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Office closed for Thanksgiving"
                            required
                            disabled={createNoticeMutation.isPending}
                            className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950"
                        />
                    </div>

                    {/* Category & Pin Option */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors" htmlFor="category">
                                <Tag size={16} className="text-gray-400 dark:text-gray-500" /> Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                disabled={createNoticeMutation.isPending}
                                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-900/50 disabled:cursor-not-allowed transition-all shadow-sm dark:shadow-none cursor-pointer"
                            >
                                <option value="General">General</option>
                                <option value="HR">HR & Policy</option>
                                <option value="Events">Events</option>
                                <option value="IT">IT Updates</option>
                            </select>
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-center pt-6">
                            <label className={cn(
                                "flex items-center gap-3 transition-colors",
                                createNoticeMutation.isPending ? "cursor-not-allowed opacity-50" : "cursor-pointer group"
                            )}>
                                <input
                                    type="checkbox"
                                    name="isPinned"
                                    checked={formData.isPinned}
                                    onChange={handleChange}
                                    disabled={createNoticeMutation.isPending}
                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-600 dark:focus:ring-blue-500/50 focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-900 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-900"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                                    Pin to top of notice board
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors" htmlFor="content">
                            <AlignLeft size={16} className="text-gray-400 dark:text-gray-500" /> Message Content
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            disabled={createNoticeMutation.isPending}
                            placeholder="Write your announcement here..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent min-h-[150px] resize-y bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-900/50 disabled:cursor-not-allowed transition-all shadow-sm dark:shadow-none"
                        />
                    </div>

                    {/* Attachment Upload */}
                    <div className="space-y-1.5 relative">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">Attachment (Optional)</label>
                        <div className={cn(
                            "border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors relative overflow-hidden",
                            createNoticeMutation.isPending 
                                ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-50 cursor-not-allowed" 
                                : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-600 dark:hover:border-blue-500 cursor-pointer group"
                        )}>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                disabled={createNoticeMutation.isPending}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                                title=""
                            />
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                <UploadCloud size={24} />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                                {formData.attachment ? formData.attachment.name : "Click to upload document"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                                {formData.attachment ? `${(formData.attachment.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOCX, or Images (Max 5MB)"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center sm:text-left transition-colors">
                        This will notify all active employees.
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={handleClose} 
                            disabled={createNoticeMutation.isPending}
                            className="flex-1 sm:flex-none text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={createNoticeMutation.isPending || !formData.title || !formData.content}
                            className="flex-1 sm:flex-none min-w-[140px] shadow-md shadow-blue-500/25 dark:shadow-none font-semibold"
                        >
                            {createNoticeMutation.isPending ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Publish Now'}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}