import { employeeService } from '@/services/employeeService';

export interface ProjectManagerOption {
    id: string;
    name: string;
}

const MANAGER_ROLES = new Set(['manager', 'admin', 'hr']);

function isEligibleManagerRole(role: string | undefined | null): boolean {
    if (!role) return false;
    return MANAGER_ROLES.has(role.trim().toLowerCase());
}

/**
 * Load users who can be assigned as project manager (Admin, HR, Manager).
 * Uses a single employees fetch with a high limit and case-insensitive role matching.
 */
export async function fetchProjectManagers(): Promise<ProjectManagerOption[]> {
    const { employees } = await employeeService.getAll(1, 500);
    const seen = new Set<string>();

    return employees
        .filter((emp) => emp.status === 'Active' && isEligibleManagerRole(emp.role))
        .filter((emp) => {
            if (!emp.id || seen.has(emp.id)) return false;
            seen.add(emp.id);
            return true;
        })
        .map((emp) => ({
            id: emp.id,
            name: emp.name,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}
