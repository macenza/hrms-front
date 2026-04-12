'use client';

import React, { useState, useEffect } from 'react';
import { Download, Plus } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

// Feature Components
import AssetStats, { AssetStatsData } from '@/components/assets/AssetStats';
import AssetTable, { Asset } from '@/components/assets/AssetTable';
import AssignAssetModal, { AssignAssetPayload, SelectOption } from '@/components/assets/AssignAssetModal';
import AddAssetModal, { AddAssetPayload } from '@/components/assets/AddAssetModal';

// Services
import { assetService } from '@/services/assetService';
import { employeeService } from '@/services/employeeService';

export default function AssetsPage() {
    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Data States
    const [stats, setStats] = useState<AssetStatsData | null>(null);
    const [records, setRecords] = useState<Asset[]>([]);

    // Modal Dropdown States
    const [employees, setEmployees] = useState<SelectOption[]>([]);
    const [availableAssets, setAvailableAssets] = useState<SelectOption[]>([]);

    // Role Simulation (Replace with your actual Auth Context)
    const currentUserRole = 'Admin';
    const isManagerial = ['Admin', 'HR'].includes(currentUserRole);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Asset Data
            const data = await assetService.getDashboardData();
            setStats(data.stats);

            // Map backend data to frontend interface
            const mappedRecords: Asset[] = data.records.map((rec: any) => ({
                id: rec.assetTag,
                name: rec.name,
                category: rec.category,
                assignee: rec.assignee?.name || null,
                date: rec.assignedDate ? new Date(rec.assignedDate).toLocaleDateString() : null,
                status: rec.status,
                dbId: rec._id
            }));

            setRecords(mappedRecords);

            // 2. Populate Modal Dropdowns (Only if Admin/HR)
            if (isManagerial) {
                // Get Employees
                const empResponse = await employeeService.getAll(1, 100);
                console.log("First employee from API:", empResponse.employees[0]);
                const empOptions = empResponse.employees.map((emp: any) => {
                    return {
                        id: emp.id, 
                        label: `${emp.name || 'Unknown'} (${emp.empId || 'No ID'})`
                    };
                });
                setEmployees(empOptions);

                // Filter Available Assets from the records we just fetched
                const availableOptions = mappedRecords
                    .filter((rec: any) => rec.status === 'Available')
                    .map((rec: any) => ({
                        id: rec.dbId,
                        label: `${rec.name} (${rec.id})`
                    }));
                setAvailableAssets(availableOptions);
            }

        } catch (error) {
            console.error("Failed to load asset data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAsset = async (payload: AddAssetPayload) => {
        try {
            await assetService.createAsset(payload);
            alert('Asset added successfully!');
            await fetchData(); // Refresh the table and stats
        } catch (error: any) {
            // If the backend catches a duplicate asset tag, alert the user
            if (error.response?.status === 400) {
                alert(error.response.data.message);
            } else {
                alert('Failed to add asset.');
            }
            throw error;
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handlers
    const handleAssignAsset = async (payload: AssignAssetPayload) => {
        try {
            await assetService.assignAsset(payload);
            alert('Asset assigned successfully!');
            await fetchData(); // Refresh data to update table, stats, and dropdowns
        } catch (error) {
            alert('Failed to assign asset.');
            throw error; // Pass error up to the modal
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

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Asset Management</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                        Track company hardware, software licenses, and equipment
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isManagerial && (
                        <Button variant="outline" onClick={handleExportInventory} disabled={isLoading} className="gap-2 shadow-sm bg-white">
                            <Download size={16} />
                            <span className="hidden sm:inline">Export Inventory</span>
                        </Button>
                    )}
                    {isManagerial && (
                        <Button variant="outline" onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-sm bg-white font-bold text-blue-600 border-blue-200 hover:bg-blue-50">
                            <Plus size={18} strokeWidth={2.5} />
                            Add Asset
                        </Button>
                    )}
                    {isManagerial && (
                        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="gap-2 shadow-sm shadow-blue-500/30 font-bold">
                            <Plus size={18} strokeWidth={2.5} />
                            Assign Asset
                        </Button>
                    )}
                </div>
            </div>

            {/* Statistics Cards (Only shown to admins) */}
            {isManagerial && <AssetStats data={stats} isLoading={isLoading} />}

            {/* Main Data Table */}
            <Card className="border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-4 border-b border-gray-100 mb-2">
                    <CardTitle className="text-lg">
                        {isManagerial ? 'Company Assets List' : 'My Assigned Assets'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-0">
                    <AssetTable
                        assets={records}
                        isLoading={isLoading}
                        onEdit={(record) => alert(`Edit asset: ${record.name}`)}
                    />
                </CardContent>
            </Card>

            {/* Application Modal */}
            <AssignAssetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAssignAsset}
                employees={employees}
                availableAssets={availableAssets}
            />
            <AddAssetModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddAsset}
            />
        </div>
    );
}