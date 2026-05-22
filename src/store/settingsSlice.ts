import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CompanySettings {
    companyName: string;
    companyLogoUrl: string;
    brandColor: string;
    currency: string;
    dateFormat: string;
    lastCompanyUpdate?: string | null;
    roles?: string[];
    departments?: string[];
}

export interface SettingsState {
    company: CompanySettings | null;
    isLoading: boolean;
}

const initialState: SettingsState = {
    company: null,
    isLoading: false,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setCompanySettings: (state, action: PayloadAction<CompanySettings>) => {
            state.company = action.payload;
        },
        updateCompanyBranding: (state, action: PayloadAction<{ name: string; brandColor: string; logoUrl?: string | null; lastCompanyUpdate?: string | null }>) => {
            if (state.company) {
                state.company.companyName = action.payload.name;
                state.company.brandColor = action.payload.brandColor;
                if (action.payload.logoUrl !== undefined) {
                    state.company.companyLogoUrl = action.payload.logoUrl || '';
                }
                if (action.payload.lastCompanyUpdate !== undefined) {
                    state.company.lastCompanyUpdate = action.payload.lastCompanyUpdate;
                }
            }
        },
        clearCompanySettings: (state) => {
            state.company = null;
        }
    }
});

export const { setCompanySettings, updateCompanyBranding, clearCompanySettings } = settingsSlice.actions;
export default settingsSlice.reducer;
