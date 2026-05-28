import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: 'Admin' | 'HR' | 'Employee';
    isActive?: boolean;
    profile?: any;
    joinedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface EmployeeAuthState {
    user: User | null;
    isAuthenticated: boolean;
}

export interface CustomerAuthState {
    customer: any | null;
    isAuthenticated: boolean;
}

// Initial state for employees
const initialEmployeeState: EmployeeAuthState = {
    user: null,
    isAuthenticated: false,
};

// Initial state for B2B Customers
const initialCustomerState: CustomerAuthState = {
    customer: null,
    isAuthenticated: false,
};

// 1. Employee Auth Slice
export const employeeAuthSlice = createSlice({
    name: 'employeeAuth',
    initialState: initialEmployeeState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User }>
        ) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
        logOut: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

// 2. B2B Customer Auth Slice
export const customerAuthSlice = createSlice({
    name: 'customerAuth',
    initialState: initialCustomerState,
    reducers: {
        setCustomerCredentials: (
            state,
            action: PayloadAction<{ user: any }>
        ) => {
            state.customer = action.payload.user;
            state.isAuthenticated = true;
        },
        logOutCustomer: (state) => {
            state.customer = null;
            state.isAuthenticated = false;
        },
    },
});

// Export isolated actions
export const { setCredentials, logOut } = employeeAuthSlice.actions;
export const { setCustomerCredentials, logOutCustomer } = customerAuthSlice.actions;

// Export separate reducers
export const employeeAuthReducer = employeeAuthSlice.reducer;
export const customerAuthReducer = customerAuthSlice.reducer;

// Maintain a combined default export mapping to employee auth reducer 
// as compatibility fallback for standard auth Slice imports if needed
export default employeeAuthReducer;