'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Save, Building2, Trash2, Lock, Palette, Calendar, Globe, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAppSelector } from '@/store/hooks';

export interface CompanySettings {
    companyName: string;
    companyLogoUrl: string;
    timezone: string;
    currency: string;
    brandColor: string;
    dateFormat: string;
    lastCompanyUpdate?: string | null;
}

interface GeneralSettingsProps {
    initialData?: CompanySettings | null; 
    onSave?: (data: FormData) => void;
}

const defaultSettings: CompanySettings = {
    companyName: '',
    companyLogoUrl: '',
    timezone: 'UTC',
    currency: 'USD',
    brandColor: '#3B82F6',
    dateFormat: 'MM/DD/YYYY',
    lastCompanyUpdate: null,
};

const popularColors = [
    { name: 'Corporate Blue', hex: '#3B82F6' },
    { name: 'Emerald Green', hex: '#10B981' },
    { name: 'Indigo Elegance', hex: '#6366F1' },
    { name: 'Crimson Red', hex: '#EF4444' },
    { name: 'Deep Purple', hex: '#8B5CF6' },
    { name: 'Amber Gold', hex: '#F59E0B' },
];

export default function GeneralSettings({
    initialData,
    onSave
}: GeneralSettingsProps) {
    const [name, setName] = useState('');
    const [timezone, setTimezone] = useState('UTC');
    const [currency, setCurrency] = useState('USD');
    const [brandColor, setBrandColor] = useState('#3B82F6');
    const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
    const [lastCompanyUpdate, setLastCompanyUpdate] = useState<string | null>(null);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role?.toLowerCase() || '';
    const isUserAdmin = userRole === 'admin';

    // Cooldown state
    const [cooldownDaysLeft, setCooldownDaysLeft] = useState(0);
    const [isBrandingLocked, setIsBrandingLocked] = useState(false);

    useEffect(() => {
        if (initialData) {
            setName(initialData.companyName || '');
            setTimezone(initialData.timezone || 'UTC');
            setCurrency(initialData.currency || 'USD');
            setBrandColor(initialData.brandColor || '#3B82F6');
            setDateFormat(initialData.dateFormat || 'MM/DD/YYYY');
            setLastCompanyUpdate(initialData.lastCompanyUpdate || null);

            if (initialData.companyLogoUrl) {
                const fullUrl = initialData.companyLogoUrl.startsWith('http') || initialData.companyLogoUrl.startsWith('/')
                    ? initialData.companyLogoUrl
                    : `http://localhost:4000/${initialData.companyLogoUrl}`;
                setLogoPreview(fullUrl);
            } else {
                setLogoPreview(null);
            }

            // Check if updates are locked (30 days lock)
            if (initialData.lastCompanyUpdate) {
                const cooldownPeriod = 30 * 24 * 60 * 60 * 1000;
                const cooldownEnd = new Date(new Date(initialData.lastCompanyUpdate).getTime() + cooldownPeriod);
                const now = new Date();
                if (now < cooldownEnd) {
                    const diffTime = Math.abs(cooldownEnd.getTime() - now.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    setCooldownDaysLeft(diffDays);
                    setIsBrandingLocked(true);
                } else {
                    setIsBrandingLocked(false);
                }
            } else {
                setIsBrandingLocked(false);
            }
        }
    }, [initialData]);

    const handleLogoButtonClick = () => {
        if (!isUserAdmin || isBrandingLocked) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isUserAdmin || isBrandingLocked) return;
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveLogo = () => {
        if (!isUserAdmin || isBrandingLocked) return;
        setLogoFile(null);
        setLogoPreview(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isUserAdmin) return;

        const formData = new FormData();
        formData.append('companyName', name);
        formData.append('timezone', timezone);
        formData.append('currency', currency);
        formData.append('brandColor', brandColor);
        formData.append('dateFormat', dateFormat);

        if (logoFile) {
            formData.append('logo', logoFile);
        } else if (logoPreview === null) {
            // Logo removed
            formData.append('removeLogo', 'true');
        }

        onSave?.(formData);
    };

    const canEditGeneral = isUserAdmin;
    const canEditBranding = isUserAdmin && !isBrandingLocked;

    return (
        <div className="animate-in fade-in duration-300 max-w-4xl">
            
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Company Workspace Settings</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                        Configure regional localization, currency properties, and company brand visual identity.
                    </p>
                </div>
                {!canEditGeneral ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors">
                        <Lock size={14} /> Read Only
                    </span>
                ) : isBrandingLocked ? (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors">
                        <Clock size={14} /> Branding Locked
                    </span>
                ) : null}
            </div>

            {/* 30-day Lock Alert Timer */}
            {isUserAdmin && isBrandingLocked && (
                <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 flex items-start gap-3 transition-all duration-300">
                    <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Branding Cooldown Active</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400/90 mt-1 leading-relaxed">
                            To ensure interface consistency across all user dashboards, company profile details (Company Name, Logo, and Brand Color) can only be updated once every 30 days. 
                            <strong> Updates unlocked in {cooldownDaysLeft} days.</strong>
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Logo & Brand Color Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Logo Segment */}
                    <section className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl transition-colors">
                        <div className="relative group shrink-0">
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Company Logo"
                                    className={cn(
                                        "w-24 h-24 rounded-2xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm transition-opacity",
                                        !canEditBranding && "opacity-80"
                                    )}
                                />
                            ) : (
                                <div className="w-24 h-24 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center text-3xl font-black text-primary shadow-sm transition-colors">
                                    {name ? name.charAt(0).toUpperCase() : <Building2 size={36} className="text-gray-400 dark:text-gray-600" />}
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/*"
                                disabled={!canEditBranding}
                            />
                        </div>
                        
                        <div className="space-y-2 text-center sm:text-left">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100">Company Logo</h3>
                            {canEditBranding ? (
                                <div className="space-y-2">
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleLogoButtonClick}
                                            className="gap-2 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 transition-colors"
                                        >
                                            <UploadCloud size={16} />
                                            Upload Logo
                                        </Button>
                                        {logoPreview && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleRemoveLogo}
                                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                        PNG, JPG, SVG up to 2MB.
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] leading-relaxed">
                                    {isBrandingLocked ? "Branding logo is locked due to cooldown timer." : "Requires administrator role to modify branding."}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Brand Color Segment */}
                    <section className="flex flex-col p-6 bg-gray-50/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl justify-between transition-colors">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Palette size={18} className="text-gray-400 dark:text-gray-500" />
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Primary Brand Color</h3>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Set the base theme color used across sidebar highlights, action buttons, and loading bars.
                            </p>
                        </div>
                        
                        <div className="mt-4 flex flex-col gap-3">
                            <div className="flex flex-wrap gap-2">
                                {popularColors.map((color) => (
                                    <button
                                        key={color.hex}
                                        type="button"
                                        disabled={!canEditBranding}
                                        onClick={() => setBrandColor(color.hex)}
                                        className={cn(
                                            "w-7 h-7 rounded-lg border transition-all relative flex items-center justify-center cursor-pointer",
                                            brandColor.toLowerCase() === color.hex.toLowerCase()
                                                ? "border-gray-900 dark:border-white scale-110 shadow-sm"
                                                : "border-gray-200 dark:border-gray-800 hover:scale-105",
                                            !canEditBranding && "cursor-not-allowed opacity-75"
                                        )}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    >
                                        {brandColor.toLowerCase() === color.hex.toLowerCase() && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={brandColor}
                                    onChange={(e) => setBrandColor(e.target.value)}
                                    disabled={!canEditBranding}
                                    className={cn(
                                        "w-8 h-8 rounded-lg cursor-pointer border border-gray-200 dark:border-gray-800 bg-transparent shrink-0",
                                        !canEditBranding && "cursor-not-allowed opacity-50"
                                    )}
                                />
                                <Input
                                    value={brandColor}
                                    onChange={(e) => setBrandColor(e.target.value)}
                                    disabled={!canEditBranding}
                                    placeholder="#2563EB"
                                    className="max-w-[120px] text-xs h-8 text-gray-900 dark:text-gray-100 disabled:bg-gray-100/50 dark:disabled:bg-gray-950/20"
                                />
                            </div>
                        </div>
                    </section>
                </div>

                {/* General Profile Configurations */}
                <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm dark:shadow-none transition-colors duration-300">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            
                            {/* Company Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Company Name</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Macenza Corp"
                                    required
                                    disabled={!canEditBranding}
                                    className="text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900/50 disabled:text-gray-500 dark:disabled:text-gray-400 transition-colors font-medium"
                                />
                            </div>
                            
                            {/* Regional Localization (Timezone) */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Default Timezone</label>
                                <div className="relative flex items-center">
                                    <Globe className="w-4 h-4 text-gray-400 absolute left-3 z-10" />
                                    <select
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        disabled={!canEditGeneral}
                                        className={cn(
                                            "w-full h-10 pl-9 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 font-medium text-gray-700 dark:text-gray-300 transition-all shadow-sm dark:shadow-none cursor-pointer",
                                            !canEditGeneral && "bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-90"
                                        )}
                                    >
                                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                                        <option value="Asia/Kolkata">India Standard Time (IST - Asia/Kolkata)</option>
                                        <option value="America/New_York">Eastern Time (EST/EDT - America/New_York)</option>
                                        <option value="Europe/London">London Time (GMT/BST - Europe/London)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Currency (Tied to Payroll) */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Default Payroll Currency</label>
                                <div className="relative flex items-center">
                                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 z-10" />
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        disabled={!canEditGeneral}
                                        className={cn(
                                            "w-full h-10 pl-9 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 font-medium text-gray-700 dark:text-gray-300 transition-all shadow-sm dark:shadow-none cursor-pointer",
                                            !canEditGeneral && "bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-90"
                                        )}
                                    >
                                        <option value="USD">United States Dollar (USD - $)</option>
                                        <option value="INR">Indian Rupee (INR - ₹)</option>
                                        <option value="EUR">Euro (EUR - €)</option>
                                        <option value="GBP">British Pound (GBP - £)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Date Format (Tied to Attendance) */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">Default Date Format</label>
                                <div className="relative flex items-center">
                                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 z-10" />
                                    <select
                                        value={dateFormat}
                                        onChange={(e) => setDateFormat(e.target.value)}
                                        disabled={!canEditGeneral}
                                        className={cn(
                                            "w-full h-10 pl-9 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 font-medium text-gray-700 dark:text-gray-300 transition-all shadow-sm dark:shadow-none cursor-pointer",
                                            !canEditGeneral && "bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-90"
                                        )}
                                    >
                                        <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 12/25/2026)</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 25/12/2026)</option>
                                    </select>
                                </div>
                            </div>

                        </div>
                    </CardContent>
                </Card>

                {/* Footer Save Action */}
                {canEditGeneral && (
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end transition-colors">
                        <Button
                            type="submit"
                            variant="primary"
                            className="gap-2 px-8 shadow-md shadow-primary/20 font-semibold h-11"
                        >
                            <Save size={18} />
                            Save Configuration
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
}