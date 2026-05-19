import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employeeService';
import { EmployeeFilterState } from '@/components/employees/EmployeeFilters';

interface UseEmployeesParams {
    page: number;
    limit: number;
    searchTerm: string;
    filters: EmployeeFilterState;
}

export function useEmployees(params: UseEmployeesParams) {
    return useQuery({
        queryKey: ['employees', params.page, params.limit, params.searchTerm, params.filters],
        queryFn: () => employeeService.getAll(
            params.page, 
            params.limit, 
            params.searchTerm, 
            params.filters
        ),
        // Keep previous data on the screen while fetching the next page for smoother UX
        placeholderData: (previousData) => previousData, 
    });
}

export function useCreateEmployee() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: unknown) => employeeService.create(data),
        onSuccess: () => {
            // Invalidates the cache, forcing useEmployees to refetch the fresh list
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });
}

export function useDeleteEmployee() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => employeeService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });
}