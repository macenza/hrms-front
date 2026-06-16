import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { 
  employeeAuthReducer, 
  customerAuthReducer, 
  EmployeeAuthState, 
  CustomerAuthState 
} from './authSlice';
import dashboardReducer from './dashboardSlice';
import settingsReducer from './settingsSlice';
import type { DashboardState } from './dashboardSlice';
import type { SettingsState } from './settingsSlice';

const createNoopStorage = () => {
  return {
    getItem(_key: any) {
      return Promise.resolve(null);
    },
    setItem(_key: any, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: any) {
      return Promise.resolve();
    },
  };
};

const storage = typeof window !== 'undefined' ? createWebStorage('session') : createNoopStorage();

// Persist config for employee credentials
const employeePersistConfig = {
  key: 'employeeAuth',
  storage,
  whitelist: ['user', 'isAuthenticated', 'customerUser', 'isCustomerAuthenticated'],
};

// Persist config for customer credentials
const customerPersistConfig = {
  key: 'customerAuth',
  storage,
  whitelist: ['customer', 'isAuthenticated'],
};

const persistedEmployeeAuthReducer = persistReducer(employeePersistConfig, employeeAuthReducer);
const persistedCustomerAuthReducer = persistReducer(customerPersistConfig, customerAuthReducer);

export const store = configureStore({
  reducer: {
    // 1. Separate isolated store keys
    employeeAuth: persistedEmployeeAuthReducer,
    customerAuth: persistedCustomerAuthReducer,
    
    // 2. Compatibility legacy key mapped to employee auth 
    // to prevent breaking any existing employee dashboard selectors
    auth: persistedEmployeeAuthReducer,
    
    dashboard: dashboardReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = {
  employeeAuth: EmployeeAuthState;
  customerAuth: CustomerAuthState;
  auth: EmployeeAuthState; // legacy key signature
  dashboard: DashboardState;
  settings: SettingsState;
};

export type AppDispatch = typeof store.dispatch;