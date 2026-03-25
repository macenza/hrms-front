'use client';

import React from 'react';
import { X, AlignLeft, Tag, UploadCloud } from 'lucide-react';

interface CreateNoticeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateNoticeModal({ isOpen, onClose }: CreateNoticeModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Publish New Notice</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Notice Title</label>
                        <input 
                            type="text" 
                            placeholder="e.g., Office closed for Thanksgiving"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-900 font-medium" 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Tag size={16} className="text-gray-400" /> Category
                            </label>
                            <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-700 bg-white">
                                <option value="general">General</option>
                                <option value="hr">HR & Policy</option>
                                <option value="events">Events</option>
                                <option value="it">IT Updates</option>
                            </select>
                        </div>
                        {/* Options */}
                        <div className="space-y-2 flex flex-col justify-center pt-6">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#4F7CF3] focus:ring-[#4F7CF3]" />
                                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">Pin to top of notice board</span>
                            </label>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <AlignLeft size={16} className="text-gray-400" /> Message Content
                        </label>
                        <textarea 
                            placeholder="Write your announcement here..." 
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none min-h-[150px] resize-none text-gray-700" 
                        />
                    </div>

                    {/* Attachment */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Attachment (Optional)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-[#4F7CF3] transition-colors cursor-pointer group">
                            <div className="p-3 bg-blue-50 text-[#4F7CF3] rounded-full mb-3 group-hover:scale-110 transition-transform">
                                <UploadCloud size={24} />
                            </div>
                            <p className="text-sm font-bold text-gray-900">Click to upload document</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOCX, or Images (Max 5MB)</p>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center gap-3">
                    <p className="text-xs text-gray-500 font-medium">This will notify all active employees.</p>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button className="px-6 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] shadow-sm transition-colors flex items-center gap-2">
                            Publish Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}