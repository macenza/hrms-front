'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Loader2, ChevronLeft, ChevronRight, Search, X, RotateCcw, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAppSelector } from '@/store/hooks';
import { useAssetCategoryData, useCreateAssetCategory, useUpdateAssetCategory, useDeleteAssetCategory, AssetCategory } from '@/hooks/api/useAssetCategories';
import { useDebounce } from '@/hooks/useDebounce';
import AssetCategoryTable from '@/components/assets/categories/AssetCategoryTable';
import AddEditAssetCategoryModal from '@/components/assets/categories/AddEditAssetCategoryModal';
import { toast } from 'sonner';

export default function AssetCategoriesPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const role = user?.role?.toLowerCase() || 'employee';
    const isManagerial = role === 'admin' || role === 'hr';

    // Search and Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>(''); // '', 'true' or 'false'
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);

    // React Query Data Layer
    const isActiveFilter = statusFilter === 'true' ? true : statusFilter === 'false' ? false : undefined;
    const { data: categoryData, isLoading: isCategoriesLoading } = useAssetCategoryData(
        currentPage,
        entriesPerPage,
        debouncedSearchTerm,
        isActiveFilter
    );

    const createMutation = useCreateAssetCategory();
    const updateMutation = useUpdateAssetCategory();
    const deleteMutation = useDeleteAssetCategory();

    const records = categoryData?.records || [];
    const pagination = categoryData?.pagination || { currentPage: 1, totalPages: 1, totalEntries: 0 };
    const totalPages = pagination.totalPages || 1;
    const totalEntries = pagination.totalEntries || 0;

    const isLoading = isCategoriesLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    // Reset pagination when page size, status filter, or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [entriesPerPage, statusFilter, debouncedSearchTerm]);

    // UI Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);

    const handleCreateOrUpdate = async (payload: { name: string; description?: string; isActive?: boolean }) => {
        try {
            if (selectedCategory) {
                // Update mode
                await updateMutation.mutateAsync({
                    id: selectedCategory._id,
                    payload
                });
                toast.success('Asset category updated successfully!');
            } else {
                // Create mode
                await createMutation.mutateAsync(payload);
                toast.success('Asset category created successfully!');
            }
            setIsModalOpen(false);
            setSelectedCategory(null);
        } catch (error: any) {
            console.error('Failed to submit asset category:', error);
            // Let the modal itself show the inline validation message
            throw error;
        }
    };

    const handleToggleStatus = async (record: AssetCategory) => {
        if (!isManagerial) {
            toast.error('Access denied. Insufficient permissions.');
            return;
        }
        const actionText = record.isActive ? 'deactivate' : 'reactivate';
        if (confirm(`Are you sure you want to ${actionText} category "${record.name}"?`)) {
            try {
                await updateMutation.mutateAsync({
                    id: record._id,
                    payload: {
                        name: record.name,
                        description: record.description,
                        isActive: !record.isActive
                    }
                });
                toast.success(`Asset category ${record.isActive ? 'deactivated' : 'reactivated'} successfully!`);
            } catch (error) {
                toast.error(`Failed to ${actionText} category.`);
            }
        }
    };

    const handleDelete = async (record: AssetCategory) => {
        if (!isManagerial) {
            toast.error('Access denied. Insufficient permissions.');
            return;
        }
        if (confirm(`Are you sure you want to permanently delete category "${record.name}"? This action cannot be undone.`)) {
            try {
                await deleteMutation.mutateAsync(record._id);
                toast.success('Asset category deleted successfully!');
            } catch (error: any) {
                if (error.response?.status === 400) {
                    toast.error(error.response.data.message || 'Cannot delete category.');
                } else {
                    toast.error('Failed to delete asset category.');
                }
            }
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/assets')}
                            className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all shadow-sm"
                            aria-label="Back to Assets"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">
                                Asset Categories
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
                                Manage asset taxonomy, classification labels, and specifications
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isManagerial && (
                            <Button 
                                variant="primary" 
                                onClick={() => { setSelectedCategory(null); setIsModalOpen(true); }} 
                                disabled={isLoading}
                                className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none font-bold"
                            >
                                {createMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={2.5} />}
                                Add Category
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300">
                    <div className="relative w-full sm:max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
                            <Search size={18} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search category by name..."
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
                                <option value="true">Active Only</option>
                                <option value="false">Inactive Only</option>
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

                {/* Data Table Card */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors duration-300 overflow-hidden">
                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 mb-2 transition-colors">
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100 transition-colors">
                            Asset Categories List
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <AssetCategoryTable
                            categories={records}
                            isLoading={isCategoriesLoading}
                            onEdit={(record) => {
                                setSelectedCategory(record);
                                setIsModalOpen(true);
                            }}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDelete}
                        />
                    </CardContent>

                    {/* Pagination Toolbar */}
                    {!isCategoriesLoading && records.length > 0 && (
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
                                    disabled={currentPage === 1 || isCategoriesLoading}
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
                                    disabled={currentPage === totalPages || isCategoriesLoading}
                                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-900 shadow-sm"
                                    aria-label="Next Page"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </Card>

                {/* Create/Edit Modal Dialog */}
                <AddEditAssetCategoryModal
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setSelectedCategory(null); }}
                    onSubmit={handleCreateOrUpdate}
                    isSubmitting={createMutation.isPending || updateMutation.isPending}
                    editCategory={selectedCategory}
                />
            </div>
        </div>
    );
}
