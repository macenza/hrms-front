import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: 'Admin' | 'HR' | 'Employee';
    isActive?: boolean;
    joinedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
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
    },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;