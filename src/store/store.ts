import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import dashboardReducer from './dashboardSlice';
import type { AuthState } from './authSlice';
import type { DashboardState } from './dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
  },
  // Disable devTools in production
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = {
  auth: AuthState;
  dashboard: DashboardState;
};
export type AppDispatch = typeof store.dispatch;