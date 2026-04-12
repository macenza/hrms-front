'use client';

import React, { useState } from 'react';
import { AlignLeft, Tag, UploadCloud, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// UI Components
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Services
import { noticeService } from '@/services/noticeService';

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
    onSuccess: () => void; // Replaced onSubmit with onSuccess to trigger a list refresh
}

const initialFormState: NoticePayload = {
    title: '',
    category: 'general',
    isPinned: false,
    content: '',
    attachment: null
};

export default function CreateNoticeModal({ isOpen, onClose, onSuccess }: CreateNoticeModalProps) {
    const [formData, setFormData] = useState<NoticePayload>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
            
            // Edge Case: Validate file size (e.g., max 5MB) before accepting it
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }
            
            setFormData(prev => ({ ...prev, attachment: file }));
        }
    };

    const handleClose = () => {
        if (isSubmitting) return; // Prevent closing while uploading
        setFormData(initialFormState);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepare payload for file upload
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('category', formData.category);
            payload.append('isPinned', String(formData.isPinned));
            payload.append('content', formData.content);
            
            if (formData.attachment) {
                payload.append('file', formData.attachment);
            }

            // Execute API Call
            await noticeService.createNotice(payload);

            toast.success('Notice published successfully!');
            onSuccess(); // Trigger parent component to fetch the updated notice list
            handleClose();
        } catch (error: any) {
            console.error('Submission Error:', error);
            toast.error(error?.response?.data?.message || 'Failed to publish notice. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Publish New Notice" className="max-w-2xl">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 space-y-6 p-2">
                    
                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700" htmlFor="title">Notice Title</label>
                        <Input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Office closed for Thanksgiving"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700" htmlFor="category">
                                <Tag size={16} className="text-gray-400" /> Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                                className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="general">General</option>
                                <option value="hr">HR & Policy</option>
                                <option value="events">Events</option>
                                <option value="it">IT Updates</option>
                            </select>
                        </div>

                        {/* Options Checkbox */}
                        <div className="space-y-1.5 flex flex-col justify-center pt-6">
                            <label className={`flex items-center gap-3 ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer group'}`}>
                                <input
                                    type="checkbox"
                                    name="isPinned"
                                    checked={formData.isPinned}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed"
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                                    Pin to top of notice board
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700" htmlFor="content">
                            <AlignLeft size={16} className="text-gray-400" /> Message Content
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                            placeholder="Write your announcement here..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[150px] resize-y bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* Attachment Upload Zone */}
                    <div className="space-y-1.5 relative">
                        <label className="text-sm font-semibold text-gray-700">Attachment (Optional)</label>
                        <div className={`border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors relative overflow-hidden ${isSubmitting ? 'bg-gray-50 opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-blue-600 cursor-pointer group'}`}>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                disabled={isSubmitting}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                                title=""
                            />
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                <UploadCloud size={24} />
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                                {formData.attachment ? formData.attachment.name : "Click to upload document"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.attachment ? `${(formData.attachment.size / 1024 / 1024).toFixed(2)} MB` : "PDF, DOCX, or Images (Max 5MB)"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-500 font-medium text-center sm:text-left">
                        This will notify all active employees.
                    </p>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={handleClose} 
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none min-w-[120px]"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Publish Now'}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}