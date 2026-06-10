// src/app/(main)/employees/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeHeader from '@/components/employees/EmployeeHeader';
import EmployeeFilters, { EmployeeFilterState } from '@/components/employees/EmployeeFilters';
import EmployeeTable, { Employee, PaginationState } from '@/components/employees/EmployeeTable';
import EmployeeDrawer from '@/components/employees/EmployeeDrawer';
import AddEmployeeModal, { AddEmployeeSubmitMeta } from '@/components/employees/AddEmployeeModal';
import SendCredentialsModal from '@/components/employees/SendCredentialsModal';
import { useEmployees, useCreateEmployee } from '@/hooks/api/useEmployees';
import { employeeService } from '@/services/employeeService';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';

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

const calculateDaysToBirthday = (dobString?: string) => {
    if (!dobString) return undefined;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return undefined;
    const today = new Date();
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    if (todayZero > nextBirthday) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = nextBirthday.getTime() - todayZero.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default function EmployeesPage() {
    const router = useRouter();
    
    // UI State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const upcomingBirthdays = employees.map(emp => {
        const days = calculateDaysToBirthday(emp.dob);
        return { emp, days };
    }).filter(item => item.days !== undefined && item.days <= 10)
      .sort((a, b) => (a.days ?? 0) - (b.days ?? 0));

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

    const handleExport = () => {
        if (employees.length === 0) return toast.info("No data to export");
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
        toast.success('Employee list exported successfully!');
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
                />

                {upcomingBirthdays.length > 0 && (
                    <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 dark:from-pink-500/20 dark:via-purple-500/20 dark:to-blue-500/20 rounded-xl p-5 border border-pink-500/20 dark:border-pink-500/30 shadow-sm animate-in slide-in-from-top duration-300">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">🎉</span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                Upcoming Birthdays (Within 10 Days)
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {upcomingBirthdays.map(({ emp, days }) => {
                                const dayText = days === 0 ? "Today! 🎂" : days === 1 ? "Tomorrow!" : `in ${days} days`;
                                return (
                                    <div 
                                        key={emp.id} 
                                        onClick={() => router.push(`/employees/${emp.id}`)}
                                        className="flex items-center gap-3 p-3 bg-white/60 dark:bg-gray-900/60 hover:bg-white dark:hover:bg-gray-900 border border-gray-100 dark:border-gray-800/80 rounded-lg shadow-sm cursor-pointer hover:shadow transition-all duration-200"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center font-bold text-pink-600 dark:text-pink-400 text-sm shrink-0">
                                            {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{emp.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                {emp.department} · <span className="font-bold text-pink-600 dark:text-pink-400">{dayText}</span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
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
            </div>
        </div>
    );
}