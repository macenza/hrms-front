import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of our User
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'HR' | 'Employee';
}

// Define the shape of our Auth State
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Action to call when the user successfully logs in
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
        },
        // Action to call when the user logs out
        logOut: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;