'use client';

import React, { useState } from 'react';
import { Download, Plus, Laptop } from 'lucide-react';
import AssetStats from '@/components/assets/AssetStats';
import AssetTable from '@/components/assets/AssetTable';
import AssignAssetModal from '@/components/assets/AssignAssetModal';

export default function AssetsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track company hardware, software licenses, and equipment</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export Inventory</span>
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] transition-colors shadow-sm shadow-blue-500/30"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Assign Asset
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <AssetStats />

            {/* Main Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Company Assets List</h2>
                </div>
                <AssetTable />
            </div>

            {/* Application Modal */}
            <AssignAssetModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}