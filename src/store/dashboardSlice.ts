import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../services/apiClient';

// --- 1. Data Types ---
export interface EmployeeSummaryRow {
    _id: string;
    name: string;
    avatar?: string;
    jobTitle: string;
    netSalary: number;
    status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export interface DashboardStats {
    totalUsers: number;
    newUsers?: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<string, number>;
    usersByTeam: Record<string, number>;
    recentEmployees: EmployeeSummaryRow[];
}

export interface DailyAttendance {
    _id: string; // The date string (YYYY-MM-DD)
    present: number;
    absent: number;
}

export interface AttendanceRecord {
    _id: string;
    user: { _id: string; name: string; profile?: { avatar?: string } };
    checkInTime: string;
    checkOutTime: string | null;
    status: string;
}

export interface DashboardAttendance {
    todayPresent: number;
    workingFormat: Record<string, number>;
    overviewChart: DailyAttendance[];
    recentList: AttendanceRecord[];
}


export interface DashboardState {
    activeTab: string;
    isSidebarOpen: boolean;
    stats: DashboardStats | null;
    attendance: DashboardAttendance | null;
    isLoading: boolean;
    error: string | null;
    attendanceTimeframe: 'week' | 'month'; // To track the switch toggle
}

// --- 2. Initial State ---
const initialState: DashboardState = {
    activeTab: 'overview',
    isSidebarOpen: true,
    stats: null,
    attendance: null,
    isLoading: false,
    error: null,
    attendanceTimeframe: 'week',
};

// --- 3. Async Thunks (API Calls) ---
export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/dashboard/stats');
            return response.data as DashboardStats;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
        }
    }
);

export const fetchDashboardAttendance = createAsyncThunk(
    'dashboard/fetchAttendance',
    async (timeframe: 'week' | 'month', { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/dashboard/attendance?timeframe=${timeframe}`);
            return response.data as DashboardAttendance;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance');
        }
    }
);

// --- 4. Slice & Reducers ---
export const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setActiveTab: (state, action: PayloadAction<string>) => {
            state.activeTab = action.payload;
        },
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },
        setAttendanceTimeframe: (state, action: PayloadAction<'week' | 'month'>) => {
            state.attendanceTimeframe = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle Stats Fetching
            .addCase(fetchDashboardStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Handle Attendance Fetching
            .addCase(fetchDashboardAttendance.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDashboardAttendance.fulfilled, (state, action) => {
                state.isLoading = false;
                state.attendance = action.payload;
            })
            .addCase(fetchDashboardAttendance.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setActiveTab, toggleSidebar, setAttendanceTimeframe } = dashboardSlice.actions;
export default dashboardSlice.reducer;