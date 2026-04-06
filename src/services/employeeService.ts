// src/services/employeeService.ts
import apiClient from './apiClient';
import { Employee, PaginationState } from '@/components/employees/EmployeeTable';

export interface FetchEmployeesResponse {
    employees: Employee[];
    pagination: PaginationState;
}

export const employeeService = {
    getAll: async (page = 1, limit = 10, search = '', filters: any = {}, department = ''): Promise<FetchEmployeesResponse> => {
        try {
            // Your backend currently returns a direct array and doesn't process query params yet
            const response = await apiClient.get('/employees');

            // FIX: Map directly over response.data, not response.data.data
            const rawData = response.data || [];

            // Map the raw backend data first
            let employees: Employee[] = rawData.map((user: any) => ({
                id: user._id,
                empId: user.employeeId || 'N/A',
                name: user.name,
                department: user.profile?.department || 'Unassigned',
                role: user.role,
                email: user.email,
                phone: user.profile?.phone || 'N/A',
                joiningDate: user.profile?.joiningDate
                    ? new Date(user.profile.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'N/A',
                status: user.isActive ? 'Active' : 'Inactive'
            }));

            if (search) {
                const lowerSearch = search.toLowerCase();
                employees = employees.filter(emp => 
                    emp.name.toLowerCase().includes(lowerSearch) || 
                    emp.email.toLowerCase().includes(lowerSearch)
                );
            }
            if (filters.department) {
                employees = employees.filter(emp => emp.department === filters.department);
            }
            if (filters.role) {
                employees = employees.filter(emp => emp.role === filters.role);
            }
            if (filters.status) {
                // Ensure cases match ("Active" vs "active")
                employees = employees.filter(emp => emp.status.toLowerCase() === filters.status.toLowerCase());
            }

            if (department) {
                employees = employees.filter(emp => emp.department === department);
            }
            
            // Return the mapped data and a fallback pagination object
            return {
                employees,
                pagination: {
                    currentPage: 1,
                    totalPages: 1,
                    totalEntries: employees.length,
                    entriesPerPage: employees.length > 0 ? employees.length : 10
                }
            };
        } catch (error) {
            console.error("Error fetching employees:", error);
            throw error;
        }
    },

    create: async (employeeData: any) => {
        try {
            const response = await apiClient.post('/employees', employeeData);
            return response.data;
        } catch (error) {
            console.error("Error creating employee:", error);
            throw error;
        }
    },
    /**
     * Fetch a single employee's profile by ID
     */
    getById: async (id: string) => {
        try {
            const response = await apiClient.get(`/employees/${id}`);
            const user = response.data;
            return {
                ...user,
                id: user._id,
                empId: user.employeeId || 'N/A',
                name: user.name,
                department: user.profile?.department || 'Unassigned',
                role: user.role,
                status: user.isActive ? 'Active' : 'Inactive'
            };
        } catch (error) {
            console.error(`Error fetching employee ${id}:`, error);
            throw error;
        }
    },

    /**
     * Fetch attendance logs for a specific employee
     */
    getAttendanceLogs: async (id: string, month?: string) => {
        try {
            const response = await apiClient.get(`/attendance/employee/${id}`, { params: { month } });
            return response.data;
        } catch (error) {
            console.error(`Error fetching attendance for ${id}:`, error);
            throw error;
        }
    },

    /**
     * Update an employee's details (Used for Bank, Statutory, etc.)
     */
    update: async (id: string, updateData: any) => {
        try {
            // We use a PUT request as defined in your backend
            const response = await apiClient.put(`/employees/${id}`, updateData);
            return response.data;
        } catch (error) {
            console.error(`Error updating employee ${id}:`, error);
            throw error;
        }
    },
};