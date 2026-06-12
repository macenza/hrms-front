// src/app/(main)/assets/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Download, Plus, Loader2, ChevronLeft, ChevronRight, Monitor, Smartphone, Laptop as LaptopIcon, Headphones, Search, X, RotateCcw, ChevronDown, Upload, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import AssetStats from '@/components/assets/AssetStats';
import AssetTable, { Asset } from '@/components/assets/AssetTable';
import AssignAssetModal, { AssignAssetPayload } from '@/components/assets/AssignAssetModal';
import AddAssetModal, { AddAssetPayload } from '@/components/assets/AddAssetModal';
import { useAppSelector } from '@/store/hooks';
import { useAssetData, useAssetFormOptions, useAvailableAssets, useCreateAsset, useAssignAsset, useDeleteAsset, useUpdateAssetStatus } from '@/hooks/api/useAssets';
import { useAssetStatusData } from '@/hooks/api/useAssetStatuses';
import { assetService } from '@/services/assetService';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'laptop': return <LaptopIcon size={20} />;
        case 'monitor': return <Monitor size={20} />;
        case 'mobile': return <Smartphone size={20} />;
        case 'accessories': return <Headphones size={20} />;
        default: return <Monitor size={20} />;
    }
};

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Available': return 'success';
        case 'Assigned': return 'info';
        case 'Maintenance':
        case 'In Maintenance': return 'warning';
        default: return 'default';
    }
};

export default function AssetsPage() {
    const router = useRouter();
    // 1. Strict RBAC Enforcement
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isManagerial = role === 'admin' || role === 'hr';

    // 2. Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // 3. Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    // 4. React Query Data Layer
    const { data: assetData, isLoading: isAssetsLoading } = useAssetData(currentPage, entriesPerPage, statusFilter, debouncedSearchTerm);
    const { data: employeesData = [], isLoading: isEmpLoading } = useAssetFormOptions(isAuthenticated && isManagerial);
    const { data: availableAssets = [] } = useAvailableAssets(isAuthenticated && isManagerial);
    const { data: statusData } = useAssetStatusData(1, 100, '', true);
    
    const createAssetMutation = useCreateAsset();
    const assignAssetMutation = useAssignAsset();
    const deleteAssetMutation = useDeleteAsset();
    const updateAssetStatusMutation = useUpdateAssetStatus();

    const activeStatuses = statusData?.records || [];
    const defaultStatusName = activeStatuses.find(s => s.isDefault)?.name || 'Available';

    const stats = assetData?.stats || null;
    const records: Asset[] = assetData?.records || [];
    const pagination = assetData?.pagination || { currentPage: 1, totalPages: 1, totalEntries: 0 };
    const totalPages = pagination.totalPages || 1;
    const totalEntries = pagination.totalEntries || 0;

    const isLoading = isAssetsLoading || createAssetMutation.isPending || assignAssetMutation.isPending || deleteAssetMutation.isPending || updateAssetStatusMutation.isPending;

    // Reset pagination when page size, status filter, or search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [entriesPerPage, statusFilter, debouncedSearchTerm]);

    // 5. Local UI State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAssetForView, setSelectedAssetForView] = useState<Asset | null>(null);
    const [selectedAssetIdForAssign, setSelectedAssetIdForAssign] = useState<string>('');

    const handleAddAsset = async (payload: AddAssetPayload) => {
        try {
            await createAssetMutation.mutateAsync(payload);
            setIsAddModalOpen(false);
            toast.success('Asset added successfully!');
        } catch (error: any) {
            if (error.response?.status === 400) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to add asset.');
            }
        }
    };

    const handleAssignAsset = async (payload: AssignAssetPayload) => {
        try {
            await assignAssetMutation.mutateAsync(payload);
            setIsAssignModalOpen(false);
            toast.success('Asset assigned successfully!');
        } catch (error) {
            toast.error('Failed to assign asset.');
        }
    };

    const handleDeleteAsset = async (record: Asset) => {
        if (confirm(`Are you sure you want to delete the asset "${record.name}" (${record.id})?`)) {
            try {
                await deleteAssetMutation.mutateAsync(record.dbId);
                toast.success('Asset deleted successfully!');
            } catch (error) {
                toast.error('Failed to delete asset.');
            }
        }
    };

    const handleUnassignAsset = async (record: Asset) => {
        if (confirm(`Are you sure you want to unassign "${record.name}" from ${record.assignee}?`)) {
            try {
                await updateAssetStatusMutation.mutateAsync({ id: record.dbId, status: defaultStatusName });
                toast.success('Asset unassigned successfully!');
            } catch (error) {
                toast.error('Failed to unassign asset.');
            }
        }
    };

    const handleExportInventory = async () => {
        try {
            // Fetch all assets (up to 1000) for a full inventory export matching current filters
            const data = await assetService.getDashboardData(1, 1000, statusFilter, debouncedSearchTerm);
            const allRecords = data.records.map((rec: any) => ({
                id: rec.assetTag,
                name: rec.name,
                category: rec.category,
                assignee: rec.assignee?.name || 'Unassigned',
                date: rec.assignedDate ? new Date(rec.assignedDate).toLocaleDateString() : '-',
                status: rec.status
            }));

            if (allRecords.length === 0) return toast.info("No records to export.");
            
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
            toast.success('Inventory exported successfully!');
        } catch (error) {
            toast.error('Failed to export full inventory.');
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
                        <Button 
                            variant="outline" 
                            onClick={() => router.push('/assets/categories')} 
                            disabled={isLoading} 
                            className="gap-2 shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold"
                        >
                            Asset Categories
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => router.push('/assets/statuses')} 
                            disabled={isLoading} 
                            className="gap-2 shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold"
                        >
                            Asset Statuses
                        </Button>
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
                            <div className="flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => router.push('/assets/import/history')} 
                                    disabled={isLoading}
                                    className="gap-2 shadow-sm bg-white dark:bg-gray-900 font-bold text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                                >
                                    <History size={16} />
                                    <span className="hidden sm:inline">Import History</span>
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => router.push('/assets/import')} 
                                    disabled={isLoading}
                                    className="gap-2 shadow-sm bg-white dark:bg-gray-900 font-bold text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                >
                                    <Upload size={16} />
                                    <span className="hidden sm:inline">Import Assets</span>
                                </Button>
                            </div>
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
                                onClick={() => { setSelectedAssetIdForAssign(''); setIsAssignModalOpen(true); }} 
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

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300">
                    <div className="relative w-full sm:max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search asset, tag, category, assignee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-end">
                        <div className="relative w-full sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-3 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 outline-none focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer font-medium appearance-none"
                            >
                                <option value="">All Statuses</option>
                                {activeStatuses.length > 0 ? (
                                    activeStatuses.map(s => (
                                        <option key={s.name} value={s.name}>{s.name}</option>
                                    ))
                                ) : (
                                    <>
                                        <option value="Available">Available</option>
                                        <option value="Assigned">Assigned</option>
                                        <option value="In Maintenance">In Maintenance</option>
                                    </>
                                )}
                            </select>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
                                <ChevronDown size={16} />
                            </span>
                        </div>

                        {(searchTerm || statusFilter) && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('');
                                }}
                                className="w-full sm:w-auto gap-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors shrink-0 font-bold"
                            >
                                <RotateCcw size={14} />
                                <span>Reset Filters</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Data Table */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
                    <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800 transition-colors">
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100 transition-colors">
                            {isManagerial ? 'Company Assets List' : 'My Assigned Assets'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-0">
                        <AssetTable
                            assets={records}
                            isLoading={isAssetsLoading}
                            defaultStatusName={defaultStatusName}
                            onView={(record) => {
                                setSelectedAssetForView(record);
                                setIsViewModalOpen(true);
                            }}
                            onAssign={isManagerial ? (record) => {
                                setSelectedAssetIdForAssign(record.dbId);
                                setIsAssignModalOpen(true);
                            } : undefined}
                            onUnassign={isManagerial ? handleUnassignAsset : undefined}
                            onDelete={isManagerial ? handleDeleteAsset : undefined}
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
                    selectedAssetId={selectedAssetIdForAssign}
                />
                
                <AddAssetModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSubmit={handleAddAsset}
                    isSubmitting={createAssetMutation.isPending}
                />

                {/* Asset Details Modal */}
                <Modal isOpen={isViewModalOpen} onClose={() => { setIsViewModalOpen(false); setSelectedAssetForView(null); }} title="Asset Details" className="max-w-2xl">
                    {selectedAssetForView && (
                        <div className="space-y-6 p-2">
                            <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
                                    {getCategoryIcon(selectedAssetForView.category)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{selectedAssetForView.name}</h3>
                                    <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-0.5">{selectedAssetForView.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Category</span>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">{selectedAssetForView.category}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Status</span>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <Badge variant={getStatusBadgeVariant(selectedAssetForView.status)}>
                                            {selectedAssetForView.status}
                                        </Badge>
                                        {isManagerial && (
                                            selectedAssetForView.status.toLowerCase() === defaultStatusName.toLowerCase() || 
                                            selectedAssetForView.status.toLowerCase() === 'available' || 
                                            selectedAssetForView.status.toLowerCase() === 'in maintenance'
                                        ) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={updateAssetStatusMutation.isPending}
                                                onClick={async () => {
                                                    const isCurrentlyAvailable = 
                                                        selectedAssetForView.status.toLowerCase() === 'available' ||
                                                        selectedAssetForView.status.toLowerCase() === defaultStatusName.toLowerCase();
                                                     const nextStatus = isCurrentlyAvailable ? 'In Maintenance' : defaultStatusName;
                                                    try {
                                                        await updateAssetStatusMutation.mutateAsync({
                                                            id: selectedAssetForView.dbId,
                                                            status: nextStatus
                                                        });
                                                        toast.success(`Asset status updated to ${nextStatus}!`);
                                                        setSelectedAssetForView((prev) => prev ? { ...prev, status: nextStatus as any } : null);
                                                    } catch (error) {
                                                        toast.error('Failed to update asset status.');
                                                    }
                                                }}
                                                className="px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-blue-200 dark:border-blue-900/50 rounded transition-all gap-1 h-7 shrink-0"
                                            >
                                                {updateAssetStatusMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
                                                Send to {selectedAssetForView.status.toLowerCase() === 'available' || selectedAssetForView.status.toLowerCase() === defaultStatusName.toLowerCase() ? 'In Maintenance' : defaultStatusName}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Model</span>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">{(selectedAssetForView as any).model || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Manufacturer</span>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">{(selectedAssetForView as any).manufacturer || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Serial Number</span>
                                    <p className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200 mt-0.5">{(selectedAssetForView as any).serialNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Procurement Cost</span>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">${(selectedAssetForView as any).cost || 0}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Condition</span>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">{(selectedAssetForView as any).condition || 'New'}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Assigned To</span>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">{selectedAssetForView.assignee || 'Unassigned'}</p>
                                </div>
                                {selectedAssetForView.assignee && (
                                    <>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Assignment Date</span>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">{selectedAssetForView.date || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Expected Return</span>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">{(selectedAssetForView as any).expectedReturnDate || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Assigned By</span>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-0.5">{(selectedAssetForView as any).assignedBy || 'N/A'}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {selectedAssetForView.notes && (
                                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Condition Notes</span>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 bg-gray-50 dark:bg-gray-950 p-3 rounded-lg border border-gray-200 dark:border-gray-800">
                                        {selectedAssetForView.notes}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button variant="primary" onClick={() => { setIsViewModalOpen(false); setSelectedAssetForView(null); }}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </div>
    );
}