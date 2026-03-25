'use client';

import React from 'react';
import { FileText, Image as ImageIcon, UploadCloud, MoreVertical } from 'lucide-react';

export default function DocumentsTab() {
    const documents = [
        { name: 'Resume_Alice_Johnson.pdf', type: 'PDF', size: '2.4 MB', date: 'Oct 10, 2023', icon: FileText, color: 'text-red-500 bg-red-50' },
        { name: 'NDA_Agreement_Signed.pdf', type: 'PDF', size: '1.1 MB', date: 'Jan 12, 2023', icon: FileText, color: 'text-red-500 bg-red-50' },
        { name: 'Offer_Letter_Official.pdf', type: 'PDF', size: '845 KB', date: 'Jan 05, 2023', icon: FileText, color: 'text-red-500 bg-red-50' },
        { name: 'Passport_Copy.jpg', type: 'Image', size: '1.8 MB', date: 'Jan 10, 2023', icon: ImageIcon, color: 'text-blue-500 bg-blue-50' },
        { name: 'Degree_Certificate.pdf', type: 'PDF', size: '3.2 MB', date: 'Jan 10, 2023', icon: FileText, color: 'text-red-500 bg-red-50' },
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {/* Uploaded List */}
            <div className="lg:col-span-2">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Uploaded Documents</h2>
                <div className="space-y-3">
                    {documents.map((doc, idx) => {
                        const Icon = doc.icon;
                        return (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-[#4F7CF3]/30 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${doc.color}`}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{doc.type} • {doc.size} • {doc.date}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-all">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upload Zone */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Upload New</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-[#4F7CF3] transition-colors cursor-pointer group h-64">
                    <div className="p-4 bg-blue-50 text-[#4F7CF3] rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud size={32} />
                    </div>
                    <p className="text-sm font-bold text-gray-900">Drag & Drop or Click to Upload</p>
                    <p className="text-xs text-gray-500 mt-2">Supports PDF, JPG, PNG (Max 10MB)</p>
                </div>
            </div>
        </div>
    );
}