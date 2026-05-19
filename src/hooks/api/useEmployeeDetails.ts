import { useQuery } from '@tanstack/react-query';
import apiClient from '@/services/apiClient';

export function useEmployeeDetails(employeeId: string) {
    return useQuery({
        // The queryKey includes the ID so React Query caches each employee separately
        queryKey: ['employee', employeeId],
        queryFn: async () => {
            if (!employeeId) throw new Error("Employee ID is required");
            
            // Depending on your routes, this might be `/hr/employees/${employeeId}` 
            // for admins, or just `/employees/${employeeId}`
            const { data } = await apiClient.get(`/employees/${employeeId}`);
            
            console.log("Raw Employee Detail Data:", data);
            
            // Safely unwrap the payload (The double-wrap fix)
            return data.data ? data.data : data;
        },
        // Don't run the query until we actually have an ID from the URL
        enabled: !!employeeId,
        staleTime: 5 * 60 * 1000, 
    });
}