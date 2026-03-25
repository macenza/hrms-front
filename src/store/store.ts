import { configureStore } from '@reduxjs/toolkit';
import dashboardReducer from './dashboardSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      dashboard: dashboardReducer,
    },
  });
};

// Infer the types for TypeScript
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];