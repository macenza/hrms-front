'use client';

import React from 'react';
import { Award, Download, Eye, Plus } from 'lucide-react';

export default function CertificatesTab() {
    const certificates = [
        { title: 'Appreciation Certificate', desc: 'For outstanding performance in Q3 2023.', date: 'Issued Oct 2023' },
        { title: 'Promotion Letter', desc: 'Promoted to Senior UX Designer.', date: 'Issued Jan 2023' },
        { title: 'Internship Completion', desc: 'Successfully completed UX Internship.', date: 'Issued Aug 2022' },
    ];

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Issued Certificates</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#4F7CF3]/10 text-[#4F7CF3] rounded-lg text-sm font-semibold hover:bg-[#4F7CF3]/20 transition-colors">
                    <Plus size={16} /> Generate Certificate
                </button>
            </div>

            <div className="space-y-4">
                {certificates.map((cert, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                                <Award size={24} />
                            </div>
                            <div>
                                <h3 className="text-md font-bold text-gray-900">{cert.title}</h3>
                                <p className="text-sm text-gray-600 mt-0.5">{cert.desc}</p>
                                <p className="text-xs text-gray-400 mt-1">{cert.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                <Eye size={16} /> Preview
                            </button>
                            <button className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                                <Download size={16} /> Download PDF
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}