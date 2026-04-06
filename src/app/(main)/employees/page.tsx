'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import EmployeeHeader from '@/components/employees/EmployeeHeader';
import EmployeeFilters, { EmployeeFilterState } from '@/components/employees/EmployeeFilters';
import EmployeeTable, { Employee, PaginationState } from '@/components/employees/EmployeeTable';
import EmployeeDrawer from '@/components/employees/EmployeeDrawer';
import AddEmployeeModal, { EmployeeFormData } from '@/components/employees/AddEmployeeModal';

// API Service
import { employeeService } from '@/services/employeeService';

export default function EmployeesPage() {
    const router = useRouter();

    // 1. Centralized State
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        totalPages: 1,
        totalEntries: 0,
        entriesPerPage: 10
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<EmployeeFilterState>({
        department: '', 
        role: '', 
        status: '', 
        joiningDate: ''
    });

    // 2. UI Visibility State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // --- API Fetching Logic ---
    const fetchEmployees = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            // Pass the entire filters object so the service can process all dropdowns
            const response = await employeeService.getAll(
                page, 
                pagination.entriesPerPage, 
                searchTerm, 
                filters 
            );
            setEmployees(response.employees);
            setPagination(response.pagination);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
        } finally {
            setIsLoading(false);
        }
    // Include every single filter key in the dependency array so the table updates instantly
    }, [searchTerm, filters.department, filters.role, filters.status, filters.joiningDate, pagination.entriesPerPage]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEmployees(1);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchEmployees]); // Cleaned up dependencies

    // --- Handlers ---
    const handleFilterChange = (key: keyof EmployeeFilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handlePageChange = (newPage: number) => {
        fetchEmployees(newPage);
    };

    const handleRowClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedEmployee(null), 300); 
    };

    const handleViewProfile = () => {
        if (selectedEmployee) {
            router.push(`/employees/${selectedEmployee.id}`);
        }
    };

    const handleAddEmployee = async (data: EmployeeFormData) => {
        try {
            await employeeService.create(data);    
            setIsModalOpen(false);
            fetchEmployees(1);
        } catch (error) {
            console.error('Failed to add employee:', error);
            alert('An error occurred while creating the employee.');
        }
    };

    // Added CSV Export functionality to make the export button work
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

    return (
        <div className="relative space-y-6 animate-in fade-in duration-300">
            <EmployeeHeader 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddClick={() => setIsModalOpen(true)} 
                onExportClick={handleExport} // Pass the export handler down
            />
            
            <EmployeeFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
            /> 
            
            <EmployeeTable 
                data={employees}
                pagination={pagination}
                isLoading={isLoading}
                onRowClick={handleRowClick} 
                onPageChange={handlePageChange}
            />
            
            <EmployeeDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                employee={selectedEmployee}
                onViewProfile={handleViewProfile}
            />

            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddEmployee}
            />
        </div>
    );
}