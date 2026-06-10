import apiClient from './apiClient';
import { Employee, PaginationState } from '@/components/employees/EmployeeTable';

export interface FetchEmployeesResponse {
    employees: Employee[];
    pagination: PaginationState;
    limitReached?: boolean;
    currentCount?: number;
    totalCapacity?: number;
}

export const employeeService = {
    getAll: async (
        page = 1, 
        limit = 10, 
        search = '', 
        filters: any = {}
    ): Promise<FetchEmployeesResponse> => {
        try {
            // 1. Construct query parameters for the backend
            const params: Record<string, any> = {
                page,
                limit,
            };

            // Only attach parameters if they have a value to keep URLs clean
            if (search) params.search = search;
            if (filters.department) params.department = filters.department;
            if (filters.role) params.role = filters.role;
            
            // Map the UI status to the backend's expected format
            if (filters.status) {
                const s = filters.status.toLowerCase();
                if (s === 'past') {
                    params.status = 'past';
                } else {
                    params.status = s === 'active' ? 'true' : 'false';
                }
            }

            // 2. Fetch the paginated and filtered data from the backend
            const response = await apiClient.get('/employees', { params });

            // The upgraded backend now returns { employees: [...], pagination: {...} }
            const { 
                employees: rawEmployees, 
                pagination,
                limitReached,
                currentCount,
                totalCapacity 
            } = response.data;

            // 3. Map the raw backend data to our strict frontend interface
            // Notice the corrected paths aligning exactly with your User.js schema
            const employees: Employee[] = rawEmployees.map((user: any) => ({
                id: user._id,
                empId: user.employeeId || 'N/A',
                name: user.name,
                department: user.profile?.employment?.department || 'Unassigned',
                role: user.role,
                email: user.email,
                phone: user.profile?.personal?.phone || 'N/A',
                dob: user.profile?.personal?.dob || '',
                joiningDate: user.profile?.employment?.joiningDate
                    ? new Date(user.profile.employment.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'N/A',
                status: user.isActive ? 'Active' : 'Inactive',
                shiftId: user.profile?.employment?.shiftId || null,
                batchNo: user.profile?.employment?.batchNo || ''
            }));

            return {
                employees,
                pagination,
                limitReached,
                currentCount,
                totalCapacity
            };
        } catch (error) {
            console.error("Error fetching employees:", error);
            // In a production app, you might want to map this to a custom AppError class here
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

    sendCredentials: async (payload: { name: string; email: string; password: string }) => {
        try {
            const response = await apiClient.post('/employees/send-credentials', payload);
            return response.data;
        } catch (error) {
            console.error("Error sending credentials:", error);
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
                department: user.profile?.employment?.department || 'Unassigned',
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
            const response = await apiClient.put(`/employees/${id}`, updateData);
            return response.data;
        } catch (error) {
            console.error(`Error updating employee ${id}:`, error);
            throw error;
        }
    },

    uploadDocument: async (id: string, formData: FormData) => {
        try {
            const response = await apiClient.post(`/employees/${id}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // Required for file uploads
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error uploading document for employee ${id}:`, error);
            throw error;
        }
    },

    uploadPhoto: async (id: string, formData: FormData) => {
        try {
            const response = await apiClient.post(`/employees/${id}/photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error uploading photo for employee ${id}:`, error);
            throw error;
        }
    },

    uploadCertificate: async (id: string, formData: FormData) => {
        try {
            const response = await apiClient.post(`/employees/${id}/certificates`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Error uploading certificate for employee ${id}:`, error);
            throw error;
        }
    },

    addNote: async (id: string, text: string) => {
        try {
            const response = await apiClient.post(`/employees/${id}/notes`, { text });
            return response.data;
        } catch (error) {
            console.error(`Error adding note for employee ${id}:`, error);
            throw error;
        }
    },

    delete: async (id: string) => {
        try {
            const response = await apiClient.delete(`/employees/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting employee ${id}:`, error);
            throw error;
        }
    },

    deleteDocument: async (id: string, documentId: string) => {
        try {
            const response = await apiClient.delete(`/employees/${id}/documents/${documentId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting document ${documentId} for employee ${id}:`, error);
            throw error;
        }
    },

    deleteCertificate: async (id: string, certificateId: string) => {
        try {
            const response = await apiClient.delete(`/employees/${id}/certificates/${certificateId}`);
            return response.data;
        } catch (error) {
            console.error(`Error deleting certificate ${certificateId} for employee ${id}:`, error);
            throw error;
        }
    },
};