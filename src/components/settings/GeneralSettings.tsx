'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Save, Building2, Trash2, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAppSelector } from '@/store/hooks';

export interface CompanySettings {
    name: string;
    supportEmail: string;
    phoneNumber: string;
    timezone: string;
    logoUrl?: string | null;
}

interface GeneralSettingsProps {
    initialData?: CompanySettings | null; 
    onSave?: (data: CompanySettings) => void;
    onLogoUpload?: (file: File) => void;
    onLogoRemove?: () => void;
}

const defaultSettings: CompanySettings = {
    name: '',
    supportEmail: '',
    phoneNumber: '',
    timezone: 'utc',
    logoUrl: null,
};

function normalizeCompanySettings(
    data: Partial<CompanySettings> | null | undefined
): CompanySettings {
    return {
        ...defaultSettings,
        ...data,
        name: data?.name ?? '',
        supportEmail: data?.supportEmail ?? '',
        phoneNumber: data?.phoneNumber ?? '',
        timezone: data?.timezone ?? defaultSettings.timezone,
        logoUrl: data?.logoUrl ?? null,
    };
}

export default function GeneralSettings({
    initialData,
    onSave,
    onLogoUpload,
    onLogoRemove
}: GeneralSettingsProps) {
    const [formData, setFormData] = useState<CompanySettings>(() =>
        normalizeCompanySettings(initialData)
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role?.toLowerCase() || '';
    const canEdit = userRole === 'admin'; 

    useEffect(() => {
        if (initialData) {
            setFormData(normalizeCompanySettings(initialData));
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!canEdit) return; 
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoButtonClick = () => {
        if (!canEdit) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canEdit) return;
        if (e.target.files && e.target.files[0]) {
            onLogoUpload?.(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canEdit) return;
        onSave?.(formData);
    };

    return (
        <div className="animate-in fade-in duration-300 max-w-4xl">
            
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Company Profile</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                        Update your company's basic information and brand identity.
                    </p>
                </div>
                {!canEdit && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors">
                        <Lock size={14} /> Read Only
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Logo Section */}
                <section className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-2xl transition-colors">
                    <div className="relative group">
                        {formData.logoUrl ? (
                            <img
                                src={formData.logoUrl}
                                alt="Company Logo"
                                className={cn(
                                    "w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm transition-opacity",
                                    !canEdit && "opacity-80"
                                )}
                            />
                        ) : (
                            <div className="w-20 h-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-2xl font-black text-blue-600 dark:text-blue-500 shadow-sm transition-colors">
                                {formData.name ? formData.name.charAt(0).toUpperCase() : <Building2 size={32} className="text-gray-400 dark:text-gray-600" />}
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                            disabled={!canEdit}
                        />
                    </div>
                    
                    {canEdit ? (
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogoButtonClick}
                                    className="gap-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <UploadCloud size={16} />
                                    Change Logo
                                </Button>
                                {formData.logoUrl && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={onLogoRemove}
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} className="mr-2" />
                                        Remove
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors">
                                Recommended: 256x256px. Formats: JPG, PNG, SVG (Max 2MB).
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">
                            <p className="font-medium text-gray-700 dark:text-gray-300">Active Company Logo</p>
                            <p>Contact an administrator to change company branding.</p>
                        </div>
                    )}
                </section>

                {/* Form Section */}
                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none transition-colors duration-300">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Company Name</label>
                                <Input
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. Acme Corp"
                                    required
                                    disabled={!canEdit}
                                    className="text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900/50 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Support Email</label>
                                <Input
                                    name="supportEmail"
                                    type="email"
                                    value={formData.supportEmail || ''}
                                    onChange={handleChange}
                                    placeholder="support@company.com"
                                    required
                                    disabled={!canEdit}
                                    className="text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900/50 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Phone Number</label>
                                <Input
                                    name="phoneNumber"
                                    value={formData.phoneNumber || ''}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    disabled={!canEdit}
                                    className="text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900/50 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors"
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Default Timezone</label>
                                <select
                                    name="timezone"
                                    value={formData.timezone || defaultSettings.timezone}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                    className={cn(
                                        "w-full h-10 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 font-medium text-gray-700 dark:text-gray-300 transition-all shadow-sm dark:shadow-none cursor-pointer",
                                        !canEdit && "bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-90"
                                    )}
                                >
                                    <option value="pst">Pacific Standard Time (PST)</option>
                                    <option value="est">Eastern Standard Time (EST)</option>
                                    <option value="utc">Coordinated Universal Time (UTC)</option>
                                    <option value="ist">Indian Standard Time (IST)</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Actions */}
                {canEdit && (
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end transition-colors">
                        <Button
                            type="submit"
                            variant="primary"
                            className="gap-2 px-8 shadow-md shadow-blue-500/25 dark:shadow-none font-semibold"
                        >
                            <Save size={18} />
                            Save Changes
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}