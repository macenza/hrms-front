import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import dashboardReducer from './dashboardSlice';
import settingsReducer from './settingsSlice';
import type { AuthState } from './authSlice';
import type { DashboardState } from './dashboardSlice';
import type { SettingsState } from './settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    settings: settingsReducer,
  },
  // Disable devTools in production
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = {
  auth: AuthState;
  dashboard: DashboardState;
  settings: SettingsState;
};
export type AppDispatch = typeof store.dispatch;