import apiClient from './apiClient';
import { ENDPOINTS } from '../constants/endpoints';
import { Leave } from '../types';

// Helper to safely extract arrays from any API response format
const extractArray = (rawData: any): any[] => {
    if (Array.isArray(rawData)) return rawData;
    if (rawData?.data && Array.isArray(rawData.data)) return rawData.data;
    if (rawData?.leaves && Array.isArray(rawData.leaves)) return rawData.leaves;
    if (rawData?.results && Array.isArray(rawData.results)) return rawData.results;
    console.warn("API did not return a recognizable array format:", rawData);
    return [];
};

// For Employees to see their own requests
export const getMyLeaves = async (): Promise<Leave[]> => {
    try {
        const response = await apiClient.get(ENDPOINTS.LEAVE.BASE);
        return extractArray(response.data); 
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch leaves');
    }
};

// For HR/Admin to see all requests in the system
export const getAllLeaves = async (): Promise<Leave[]> => {
    try {
        const response = await apiClient.get(ENDPOINTS.HR.LEAVES.BASE);
        return extractArray(response.data);
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch all leaves');
    }
};

// Fetch stats for the logged-in Employee
export const getLeaveStats = async () => {
    try {
        const response = await apiClient.get(ENDPOINTS.LEAVE.STATS);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch leave stats');
    }
};

// Fetch organization-wide stats for HR/Admin
export const getAllLeaveStats = async () => {
    try {
        const response = await apiClient.get(ENDPOINTS.HR.LEAVES.STATS);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch organization leave stats');
    }
};

export const applyForLeave = async (leaveData: { leaveType: string; startDate: string; endDate: string; reason: string; numberOfDays: number; }) => {
    try {
        const response = await apiClient.post(ENDPOINTS.LEAVE.BASE, leaveData);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to submit leave application');
    }
};