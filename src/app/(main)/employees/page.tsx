// src/app/(main)/employees/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeHeader from '@/components/employees/EmployeeHeader';
import EmployeeFilters, { EmployeeFilterState } from '@/components/employees/EmployeeFilters';
import EmployeeTable, { Employee, PaginationState } from '@/components/employees/EmployeeTable';
import EmployeeDrawer from '@/components/employees/EmployeeDrawer';
import AddEmployeeModal, { AddEmployeeSubmitMeta } from '@/components/employees/AddEmployeeModal';
import { useEmployees, useCreateEmployee } from '@/hooks/api/useEmployees';
import { employeeService } from '@/services/employeeService';
import { useDebounce } from '@/hooks/useDebounce';

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
    
    // UI State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

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
                    fd.append('document', meta.profilePhoto);
                    await employeeService.uploadDocument(newId, fd);
                } catch (uploadErr) {
                    console.error('Profile photo upload failed:', uploadErr);
                    alert(
                        'Employee was created, but the profile photo could not be uploaded. You can add documents from their profile page.'
                    );
                }
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Failed to add employee:', error);
            alert('An error occurred while creating the employee.');
        }
    };

    const handleExport = () => {
        if (employees.length === 0) return alert("No data to export");
        const headers = ["ID", "Name", "Department", "Role", "Email", "Phone", "Status"];
        const csvContent = [
            headers.join(","),
            ...employees.map(e => `"${e.empId}","${e.name}","${e.department}","${e.role}","${e.email}","${e.phone}","${e.status}"`)
        ].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Employees_Export_${new Date().toLocaleDateString()}.csv`;
        link.click();
    };

    if (isError) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                    Failed to load employees. Please try again later.
                </div>
            </div>
        );
    }

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
                    onAddClick={() => setIsModalOpen(true)} 
                    onExportClick={handleExport} 
                />
                
                <EmployeeFilters 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />  
                
                {/* Ensure the Table component itself has a premium card wrapper inside its own file */}
                <EmployeeTable 
                    data={employees}
                    pagination={pagination}
                    isLoading={isLoading || createEmployeeMutation.isPending}
                    onRowClick={handleRowClick} 
                    onPageChange={setPage}
                />
                
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
            </div>
        </div>
    );
}