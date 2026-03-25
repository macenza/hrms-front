import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
    activeTab: string;
    isSidebarOpen: boolean;
}

const initialState: DashboardState = {
    activeTab: 'overview',
    isSidebarOpen: true,
};

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
    },
});

export const { setActiveTab, toggleSidebar } = dashboardSlice.actions;
export default dashboardSlice.reducer;