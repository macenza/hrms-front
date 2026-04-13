'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Save, Building2, Trash2, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

// State
import { useAppSelector } from '@/store/hooks';

// Data Contract for Backend Integration
export interface CompanySettings {
    name: string;
    supportEmail: string;
    phoneNumber: string;
    timezone: string;
    logoUrl?: string | null;
}

interface GeneralSettingsProps {
    initialData?: CompanySettings | null; // Allow null during parent's loading state
    onSave?: (data: CompanySettings) => void;
    onLogoUpload?: (file: File) => void;
    onLogoRemove?: () => void;
}

// Default Fallback (Used only until API loads, replacing static mock)
const defaultSettings: CompanySettings = {
    name: '',
    supportEmail: '',
    phoneNumber: '',
    timezone: 'utc',
    logoUrl: null,
};

export default function GeneralSettings({
    initialData,
    onSave,
    onLogoUpload,
    onLogoRemove
}: GeneralSettingsProps) {
    // Form State
    const [formData, setFormData] = useState<CompanySettings>(initialData || defaultSettings);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // RBAC Implementation
    const { user } = useAppSelector((state) => state.auth);
    // Determine if the user has permission to edit company-wide settings
    const userRole = user?.role?.toLowerCase() || '';
    const canEdit = userRole === 'admin'; // Adjust if 'hr' should also edit this

    // Sync state if parent fetches data asynchronously
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    // Form Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!canEdit) return; // Secondary safeguard
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
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Company Profile</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Update your company's basic information and brand identity.
                    </p>
                </div>
                
                {/* Visual indicator for read-only users */}
                {!canEdit && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold uppercase tracking-wider">
                        <Lock size={14} /> Read Only
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Logo Section */}
                <section className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="relative group">
                        {formData.logoUrl ? (
                            <img
                                src={formData.logoUrl}
                                alt="Company Logo"
                                className={cn(
                                    "w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm",
                                    !canEdit && "opacity-80"
                                )}
                            />
                        ) : (
                            <div className="w-20 h-20 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-2xl font-black text-blue-600 shadow-sm">
                                {formData.name ? formData.name.charAt(0).toUpperCase() : <Building2 size={32} className="text-gray-400" />}
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
                    
                    {/* Hide Logo Actions if user cannot edit */}
                    {canEdit ? (
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogoButtonClick}
                                    className="gap-2 bg-white"
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
                                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 size={16} className="mr-2" />
                                        Remove
                                    </Button>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                                Recommended: 256x256px. Formats: JPG, PNG, SVG (Max 2MB).
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1 text-sm text-gray-500">
                            <p className="font-medium text-gray-700">Active Company Logo</p>
                            <p>Contact an administrator to change company branding.</p>
                        </div>
                    )}
                </section>

                {/* Form Fields Card */}
                <Card className="border-gray-200">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Company Name</label>
                                <Input
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. Acme Corp"
                                    required
                                    disabled={!canEdit}
                                    className={!canEdit ? "bg-gray-50 cursor-not-allowed" : ""}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Support Email</label>
                                <Input
                                    name="supportEmail"
                                    type="email"
                                    value={formData.supportEmail}
                                    onChange={handleChange}
                                    placeholder="support@company.com"
                                    required
                                    disabled={!canEdit}
                                    className={!canEdit ? "bg-gray-50 cursor-not-allowed" : ""}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                <Input
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 000-0000"
                                    disabled={!canEdit}
                                    className={!canEdit ? "bg-gray-50 cursor-not-allowed" : ""}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700">Default Timezone</label>
                                <select
                                    name="timezone"
                                    value={formData.timezone}
                                    onChange={handleChange}
                                    disabled={!canEdit}
                                    className={cn(
                                        "w-full h-10 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white font-medium text-gray-700 transition-colors",
                                        !canEdit && "bg-gray-50 text-gray-500 cursor-not-allowed opacity-90"
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

                {/* Footer Actions - Only render if user can edit */}
                {canEdit && (
                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <Button
                            type="submit"
                            variant="primary"
                            className="gap-2 px-8 shadow-md shadow-blue-500/20"
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