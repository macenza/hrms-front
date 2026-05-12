// src/app/(main)/assets/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Download, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import AssetStats from '@/components/assets/AssetStats';
import AssetTable, { Asset } from '@/components/assets/AssetTable';
import AssignAssetModal, { AssignAssetPayload } from '@/components/assets/AssignAssetModal';
import AddAssetModal, { AddAssetPayload } from '@/components/assets/AddAssetModal';
import { useAppSelector } from '@/store/hooks';
import { useAssetData, useAssetFormOptions, useCreateAsset, useAssignAsset } from '@/hooks/api/useAssets';

export default function AssetsPage() {
    // 1. Strict RBAC Enforcement
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isManagerial = role === 'admin' || role === 'hr';

    // 2. React Query Data Layer
    const { data: assetData, isLoading: isAssetsLoading } = useAssetData();
    const { data: employeesData = [], isLoading: isEmpLoading } = useAssetFormOptions(isAuthenticated && isManagerial);
    
    const createAssetMutation = useCreateAsset();
    const assignAssetMutation = useAssignAsset();

    const stats = assetData?.stats || null;
    const records: Asset[] = assetData?.records || [];
    const isLoading = isAssetsLoading || createAssetMutation.isPending || assignAssetMutation.isPending;

    // 3. Local UI State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Derived state for the Assign Modal
    const availableAssets = useMemo(() => {
        return records
            .filter((rec) => rec.status === 'Available')
            .map((rec) => ({
                id: rec.dbId,
                label: `${rec.name} (${rec.id})`
            }));
    }, [records]);

    const handleAddAsset = async (payload: AddAssetPayload) => {
        try {
            await createAssetMutation.mutateAsync(payload);
            setIsAddModalOpen(false);
        } catch (error: any) {
            if (error.response?.status === 400) {
                alert(error.response.data.message);
            } else {
                alert('Failed to add asset.');
            }
        }
    };

    const handleAssignAsset = async (payload: AssignAssetPayload) => {
        try {
            await assignAssetMutation.mutateAsync(payload);
            setIsAssignModalOpen(false);
        } catch (error) {
            alert('Failed to assign asset.');
        }
    };

    const handleExportInventory = () => {
        if (records.length === 0) return alert("No records to export.");
        
        const headers = ['Asset Tag', 'Name', 'Category', 'Assignee', 'Assigned Date', 'Status'];
        const csvRows = records.map(rec => [
            rec.id,
            `"${rec.name}"`,
            rec.category,
            `"${rec.assignee || 'Unassigned'}"`,
            rec.date || '-',
            rec.status
        ].join(','));
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Asset_Inventory_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                            Asset Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                            Track company hardware, software licenses, and equipment
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {isManagerial && (
                            <Button 
                                variant="outline" 
                                onClick={handleExportInventory} 
                                disabled={isLoading} 
                                className="gap-2 shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Download size={16} />
                                <span className="hidden sm:inline">Export Inventory</span>
                            </Button>
                        )}
                        {isManagerial && (
                            <Button 
                                variant="outline" 
                                onClick={() => setIsAddModalOpen(true)} 
                                disabled={isLoading}
                                className="gap-2 shadow-sm bg-white dark:bg-gray-900 font-bold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                            >
                                {createAssetMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
                                Add Asset
                            </Button>
                        )}
                        {isManagerial && (
                            <Button 
                                variant="primary" 
                                onClick={() => setIsAssignModalOpen(true)} 
                                disabled={isLoading || isEmpLoading}
                                className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none font-bold ml-1"
                            >
                                {assignAssetMutation.isPending || isEmpLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
                                Assign Asset
                            </Button>
                        )}
                    </div>
                </div>

                {/* Dashboard Stats */}
                {isManagerial && <AssetStats data={stats} isLoading={isAssetsLoading} />}

                {/* Data Table */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300">
                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 mb-2 transition-colors">
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100 transition-colors">
                            {isManagerial ? 'Company Assets List' : 'My Assigned Assets'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-0">
                        <AssetTable
                            assets={records}
                            isLoading={isAssetsLoading}
                            onEdit={(record) => alert(`Edit asset: ${record.name}`)}
                        />
                    </CardContent>
                </Card>

                {/* Modals */}
                <AssignAssetModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    onSubmit={handleAssignAsset}
                    employees={employeesData}
                    availableAssets={availableAssets}
                    isSubmitting={assignAssetMutation.isPending}
                />
                
                <AddAssetModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleAddAsset}
                    isSubmitting={createAssetMutation.isPending}
                />
            </div>
        </div>
    );
}