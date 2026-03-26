'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Import components and their strictly-typed interfaces
import EmployeeHeader from '@/components/employees/EmployeeHeader';
import EmployeeFilters, { EmployeeFilterState } from '@/components/employees/EmployeeFilters';
import EmployeeTable, { Employee } from '@/components/employees/EmployeeTable';
import EmployeeDrawer from '@/components/employees/EmployeeDrawer';
import AddEmployeeModal, { EmployeeFormData } from '@/components/employees/AddEmployeeModal';

export default function EmployeesPage() {
    const router = useRouter();

    // 1. Centralized Search & Filter State (Ready to be sent as API query params)
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
    
    // 3. Replaced `any` with the strict `Employee` interface
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // --- Handlers ---

    const handleFilterChange = (key: keyof EmployeeFilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleRowClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        // Wait for the slide-out animation to finish before clearing the data to prevent visual glitching
        setTimeout(() => setSelectedEmployee(null), 300); 
    };

    const handleViewProfile = () => {
        if (selectedEmployee) {
            const employeeId = selectedEmployee.empId || 'EMP001';
            router.push(`/employees/${employeeId}`);
        }
    };

    const handleAddEmployee = (data: EmployeeFormData) => {
        // When backend is ready: await apiClient.post('/employees', data);
        console.log('Submitting new employee payload:', data);
        
        // You would typically trigger a re-fetch of your table data here
        setIsModalOpen(false);
    };

    // In a production environment, your data fetching hook would look something like this:
    // const { data: employees, isLoading } = useEmployees({ search: searchTerm, ...filters });

    return (
        <div className="relative space-y-6 animate-in fade-in duration-300">
            {/* Header now controls the search input */}
            <EmployeeHeader 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onAddClick={() => setIsModalOpen(true)} 
            />
            
            {/* Filters now read and update the central state object */}
            <EmployeeFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
            />
            
            {/* Table displays data and triggers the drawer */}
            <EmployeeTable 
                // data={employees} <-- Pass your API response here
                onRowClick={handleRowClick} 
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