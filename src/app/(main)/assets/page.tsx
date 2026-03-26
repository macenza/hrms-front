'use client';

import React, { useState } from 'react';
import { Download, Plus } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

// Feature Components
import AssetStats from '@/components/assets/AssetStats';
import AssetTable from '@/components/assets/AssetTable';
import AssignAssetModal from '@/components/assets/AssignAssetModal';

export default function AssetsPage() {
    // State for modal management
    const [isModalOpen, setIsModalOpen] = useState(false);

    // In the future, this is where fetch data hooks.
    // e.g., const { data: assets, isLoading } = useAssets();
    // e.g., const { data: stats } = useAssetStats();

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Track company hardware, software licenses, and equipment
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export Inventory</span>
                    </Button>
                    
                    <Button 
                        variant="primary" 
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2 shadow-sm shadow-blue-500/30"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        Assign Asset
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            {/* When API is ready, pass the data: <AssetStats data={stats} /> */}
            <AssetStats />

            {/* Main Data Table */}
            <Card className="border-gray-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Company Assets List</CardTitle>
                </CardHeader>
                {/* Removed internal padding on CardContent to let the table span edge-to-edge if desired, 
                    or keep standard padding depending on client preference */}
                <CardContent>
                    {/* When API is ready, pass the data: <AssetTable assets={assets} /> */}
                    <AssetTable />
                </CardContent>
            </Card>

            {/* Application Modal */}
            <AssignAssetModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                // onSubmit={(payload) => handleAssignAsset(payload)}
            />
        </div>
    );
}