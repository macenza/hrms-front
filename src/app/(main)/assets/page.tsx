// src/app/(main)/assets/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Download, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import AssetStats from '@/components/assets/AssetStats';
import AssetTable, { Asset } from '@/components/assets/AssetTable';
import AssignAssetModal, { AssignAssetPayload } from '@/components/assets/AssignAssetModal';
import AddAssetModal, { AddAssetPayload } from '@/components/assets/AddAssetModal';
import { useAppSelector } from '@/store/hooks';
import { useAssetData, useAssetFormOptions, useAvailableAssets, useCreateAsset, useAssignAsset } from '@/hooks/api/useAssets';
import { assetService } from '@/services/assetService';

export default function AssetsPage() {
    // 1. Strict RBAC Enforcement
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isManagerial = role === 'admin' || role === 'hr';

    // 2. Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    // 3. React Query Data Layer
    const { data: assetData, isLoading: isAssetsLoading } = useAssetData(currentPage, entriesPerPage);
    const { data: employeesData = [], isLoading: isEmpLoading } = useAssetFormOptions(isAuthenticated && isManagerial);
    const { data: availableAssets = [] } = useAvailableAssets(isAuthenticated && isManagerial);
    
    const createAssetMutation = useCreateAsset();
    const assignAssetMutation = useAssignAsset();

    const stats = assetData?.stats || null;
    const records: Asset[] = assetData?.records || [];
    const pagination = assetData?.pagination || { currentPage: 1, totalPages: 1, totalEntries: 0 };
    const totalPages = pagination.totalPages || 1;
    const totalEntries = pagination.totalEntries || 0;

    const isLoading = isAssetsLoading || createAssetMutation.isPending || assignAssetMutation.isPending;

    // Reset pagination when page size changes
    useEffect(() => {
        setCurrentPage(1);
    }, [entriesPerPage]);

    // 4. Local UI State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

    const handleExportInventory = async () => {
        try {
            // Fetch all assets (up to 1000) for a full inventory export
            const data = await assetService.getDashboardData(1, 1000);
            const allRecords = data.records.map((rec: any) => ({
                id: rec.assetTag,
                name: rec.name,
                category: rec.category,
                assignee: rec.assignee?.name || 'Unassigned',
                date: rec.assignedDate ? new Date(rec.assignedDate).toLocaleDateString() : '-',
                status: rec.status
            }));

            if (allRecords.length === 0) return alert("No records to export.");
            
            const headers = ['Asset Tag', 'Name', 'Category', 'Assignee', 'Assigned Date', 'Status'];
            const csvRows = allRecords.map((rec: any) => [
                rec.id,
                `"${rec.name}"`,
                rec.category,
                `"${rec.assignee}"`,
                rec.date,
                rec.status
            ].join(','));
            
            const csvContent = [headers.join(','), ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Asset_Inventory_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (error) {
            alert('Failed to export full inventory.');
        }
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
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
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

                    {/* Pagination Toolbar */}
                    {!isAssetsLoading && records.length > 0 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors font-medium">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                                <span>Show</span>
                                <select 
                                    value={entriesPerPage} 
                                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                    className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-sm dark:shadow-none cursor-pointer font-semibold"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <span>entries</span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 transition-colors">
                                Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1}</span> to <span className="font-semibold text-gray-900 dark:text-gray-100">{Math.min(currentPage * entriesPerPage, totalEntries)}</span> of <span className="font-semibold text-gray-900 dark:text-gray-100">{totalEntries}</span> entries
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1 || isAssetsLoading}
                                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-900 shadow-sm"
                                    aria-label="Previous Page"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2 transition-colors">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || isAssetsLoading}
                                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-900 shadow-sm"
                                    aria-label="Next Page"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
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