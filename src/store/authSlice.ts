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

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    customerUser: any | null;
    isCustomerAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    customerUser: null,
    isCustomerAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User }> // Removed token payload
        ) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
        logOut: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        setCustomerCredentials: (
            state,
            action: PayloadAction<{ user: any }>
        ) => {
            state.customerUser = action.payload.user;
            state.isCustomerAuthenticated = true;
        },
        logOutCustomer: (state) => {
            state.customerUser = null;
            state.isCustomerAuthenticated = false;
        },
    },
});

export const { setCredentials, logOut, setCustomerCredentials, logOutCustomer } = authSlice.actions;
export default authSlice.reducer;