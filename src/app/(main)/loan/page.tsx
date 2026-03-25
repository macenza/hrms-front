'use client';

import React, { useState } from 'react';
import { Download, Banknote, Plus } from 'lucide-react';
import LoanStats from '@/components/loan/LoanStats';
import LoanTable from '@/components/loan/LoanTable';
import ApplyLoanModal from '@/components/loan/ApplyLoanModal';

export default function LoanPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan & Advances</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage employee salary advances and loan requests</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export Report</span>
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] transition-colors shadow-sm shadow-blue-500/30"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        New Loan Request
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <LoanStats />

            {/* Main Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Active Loans & Requests</h2>
                </div>
                <LoanTable />
            </div>

            {/* Application Modal */}
            <ApplyLoanModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}