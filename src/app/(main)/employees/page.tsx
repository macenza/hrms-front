'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Using the @/* alias
import EmployeeHeader from '@/components/employees/EmployeeHeader';
import EmployeeFilters from '@/components/employees/EmployeeFilters';
import EmployeeTable from '@/components/employees/EmployeeTable';
import EmployeeDrawer from '@/components/employees/EmployeeDrawer';
import AddEmployeeModal from '@/components/employees/AddEmployeeModal';

export default function EmployeesPage() {
    const router = useRouter();

    const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRowClick = (employee: any) => {
        setSelectedEmployee(employee);
        setIsDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setIsDrawerOpen(false);
        // Wait for the slide-out animation to finish before clearing the data
        setTimeout(() => setSelectedEmployee(null), 300); 
    };

    const handleViewProfile = () => {
        if (selectedEmployee) {
            // Programmatically navigate to the flat profile route
            const employeeId = selectedEmployee.empId || 'EMP001';
            router.push(`/employees/${employeeId}`);
        }
    };

    return (
        <div className="relative space-y-6">
            <EmployeeHeader onAddClick={() => setIsModalOpen(true)} />
            <EmployeeFilters />
            
            {/* The table handles displaying data and triggering the drawer */}
            <EmployeeTable onRowClick={handleRowClick} />

            <EmployeeDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                employee={selectedEmployee}
                onViewProfile={handleViewProfile}
            />

            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}