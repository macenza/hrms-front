// src/app/(main)/employees/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import EmployeeHeader from '@/components/employees/EmployeeHeader';
import EmployeeFilters, { EmployeeFilterState } from '@/components/employees/EmployeeFilters';
import EmployeeTable, { Employee, PaginationState } from '@/components/employees/EmployeeTable';

// Lazy load heavy components and modals to speed up initial page render and route transitions
const EmployeeDrawer = dynamic(() => import('@/components/employees/EmployeeDrawer'), { ssr: false });
const AddEmployeeModal = dynamic(() => import('@/components/employees/AddEmployeeModal').then(mod => mod.default), { ssr: false });
const SendCredentialsModal = dynamic(() => import('@/components/employees/SendCredentialsModal'), { ssr: false });
const ImportEmployeesModal = dynamic(() => import('@/components/employees/ImportEmployeesModal'), { ssr: false });

import type { AddEmployeeSubmitMeta } from '@/components/employees/AddEmployeeModal';

import { useEmployees, useCreateEmployee } from '@/hooks/api/useEmployees';
import { employeeService } from '@/services/employeeService';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

function resolveCreatedEmployeeId(data: unknown): string | undefined {
    if (!data || typeof data !== 'object') return undefined;
    const row = data as Record<string, unknown>;
    if (typeof row._id === 'string') return row._id;
    if (typeof row.id === 'string') return row.id;
    const nested = row.data;
    if (nested && typeof nested === 'object') {
        const d = nested as Record<string, unknown>;
        if (typeof d._id === 'string') return d._id;
        if (typeof d.id === 'string') return d.id;
    }
    const user = row.user;
    if (user && typeof user === 'object') {
        const u = user as Record<string, unknown>;
        if (typeof u._id === 'string') return u._id;
        if (typeof u.id === 'string') return u.id;
    }
    return undefined;
}

export default function EmployeesPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    
    // UI State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [credentialsModalData, setCredentialsModalData] = useState<{
        name: string;
        email: string;
        password: string;
    } | null>(null);

    // Query State
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<EmployeeFilterState>({
        department: '', role: '', status: '', joiningDate: ''
    });

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Data Fetching
    const { data, isLoading, isError } = useEmployees({
        page,
        limit: 10,
        searchTerm: debouncedSearchTerm,
        filters
    });

    const createEmployeeMutation = useCreateEmployee();

    const employees = data?.employees || [];
    const pagination: PaginationState = data?.pagination || {
        currentPage: page, totalPages: 1, totalEntries: 0, entriesPerPage: 10
    };

    const handleFilterChange = (key: keyof EmployeeFilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); 
    };

    const handleRowClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDrawerOpen(true);
    };

    const handleAddEmployee = async (
        payload: Record<string, unknown>,
        meta: AddEmployeeSubmitMeta
    ) => {
        try {
            const created = await createEmployeeMutation.mutateAsync(payload);
            const newId = resolveCreatedEmployeeId(created);
            if (meta.profilePhoto && newId) {
                try {
                    const fd = new FormData();
                    fd.append('photo', meta.profilePhoto);
                    await employeeService.uploadPhoto(newId, fd);
                    toast.success('Employee created and profile photo uploaded successfully!');
                } catch (uploadErr) {
                    console.error('Profile photo upload failed:', uploadErr);
                    toast.warning(
                        'Employee was created, but the profile photo could not be uploaded. You can add documents from their profile page.'
                    );
                }
            } else {
                toast.success('Employee created successfully!');
            }

            // Save details to trigger the Send Credentials modal
            const createdName = payload.name as string;
            const createdEmail = payload.email as string;
            const createdPassword = payload.password as string;

            setCredentialsModalData({
                name: createdName,
                email: createdEmail,
                password: createdPassword
            });

            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Failed to add employee:', error);
            const serverMsg = error.response?.data?.message || 'An error occurred while creating the employee.';
            console.error('❌ Server error details:', error.response?.data);
            toast.error(serverMsg);
        }
    };

    const handleExport = async () => {
        if (employees.length === 0) return toast.info("No data to export");
        
        const exportToastId = toast.loading("Preparing CSV export...");
        try {
            // Fetch all employees matching current filters and search (using high limit to retrieve all matching)
            const allData = await employeeService.getAll(1, 10000, debouncedSearchTerm, filters);
            const exportEmployees = allData?.employees || [];
            
            if (exportEmployees.length === 0) {
                toast.dismiss(exportToastId);
                return toast.info("No data to export");
            }

            const formatDate = (dateStr: string) => {
                if (!dateStr || dateStr === 'N/A') return 'N/A';
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return dateStr;
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            const headers = ["ID", "Name", "Department", "Role", "Email", "Phone", "Joining Date", "Status"];
            const csvRows = [
                headers.join(","),
                ...exportEmployees.map(e => {
                    const row = [
                        e.empId || 'N/A',
                        e.name || '',
                        e.department || '',
                        e.role || '',
                        e.email || '',
                        e.phone || '',
                        formatDate(e.joiningDate),
                        e.status || ''
                    ];
                    return row.map(cell => {
                        const stringVal = cell === undefined || cell === null ? "" : String(cell);
                        if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n")) {
                            return `"${stringVal.replace(/"/g, '""')}"`;
                        }
                        return stringVal;
                    }).join(",");
                })
            ];
            
            const csvContent = csvRows.join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `Employees_Export_${new Date().toLocaleDateString()}.csv`;
            link.click();
            toast.success('Employee list exported successfully!', { id: exportToastId });
        } catch (error) {
            console.error('Failed to export employee data:', error);
            toast.error('Failed to export employee data', { id: exportToastId });
        }
    };

    return (
        /* Premium Layout Wrapper: Handles deep dark mode backgrounds and smooth transitions */
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <EmployeeHeader 
                    searchTerm={searchTerm}
                    onSearchChange={(value) => {
                        setSearchTerm(value);
                        setPage(1);
                    }}
                    onAddClick={() => {
                        console.log("🟢 Add Employee Button Clicked!");
                        if (data?.limitReached) {
                            toast.error(`Employee limit reached! You have used all ${data.totalCapacity} available seats. Please upgrade your subscription or add more slots to add new employees.`);
                            return;
                        }
                        setIsModalOpen(true);
                    }} 
                    onExportClick={handleExport} 
                    onImportClick={() => setIsImportModalOpen(true)}
                />
                
                <EmployeeFilters 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />  
                
                {isError ? (
                    <div className="flex h-[30vh] items-center justify-center">
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                            Failed to load employees. Please try again later.
                        </div>
                    </div>
                ) : (
                    /* Ensure the Table component itself has a premium card wrapper inside its own file */
                    <EmployeeTable 
                        data={employees}
                        pagination={pagination}
                        isLoading={isLoading || createEmployeeMutation.isPending}
                        onRowClick={handleRowClick} 
                        onPageChange={setPage}
                    />
                )}
                
                <EmployeeDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    employee={selectedEmployee}
                    onViewProfile={() => selectedEmployee && router.push(`/employees/${selectedEmployee.id}`)}
                />
                
                <AddEmployeeModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddEmployee}
                    isSubmitting={createEmployeeMutation.isPending}
                />

                {credentialsModalData && (
                    <SendCredentialsModal
                        isOpen={!!credentialsModalData}
                        onClose={() => setCredentialsModalData(null)}
                        employeeName={credentialsModalData.name}
                        employeeEmail={credentialsModalData.email}
                        password={credentialsModalData.password}
                    />
                )}

                <ImportEmployeesModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onImportSuccess={() => queryClient.invalidateQueries({ queryKey: ['employees'] })}
                />
            </div>
        </div>
    );
}