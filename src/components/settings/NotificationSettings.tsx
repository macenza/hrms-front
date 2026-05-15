// src/components/settings/NotificationSettings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Bell, ShieldCheck, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/store/hooks';

export interface NotificationPreferences {
    email_leave_requests: boolean;
    email_payroll_processing: boolean;
    email_onboarding: boolean;
    system_attendance_summary: boolean;
    system_project_deadlines: boolean;
}

interface NotificationSettingsProps {
    initialData?: NotificationPreferences | null;
    onUpdate?: (data: NotificationPreferences) => void;
}

const defaultPreferences: NotificationPreferences = {
    email_leave_requests: false,
    email_payroll_processing: false,
    email_onboarding: false,
    system_attendance_summary: false,
    system_project_deadlines: false,
};

export default function NotificationSettings({
    initialData,
    onUpdate
}: NotificationSettingsProps) {
    const [prefs, setPrefs] = useState<NotificationPreferences>(initialData || defaultPreferences);
    
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role?.toLowerCase() || '';
    const canManageAlerts = ['admin', 'hr'].includes(userRole);

    useEffect(() => {
        if (initialData) {
            setPrefs(initialData);
        }
    }, [initialData]);

    const handleToggle = (key: keyof NotificationPreferences) => {
        if (!canManageAlerts) return; 
        const updated = { ...prefs, [key]: !prefs[key] };
        setPrefs(updated);
        onUpdate?.(updated);
    };

    const Switch = ({ id, checked, disabled }: { id: keyof NotificationPreferences; checked: boolean; disabled: boolean }) => (
        <button
            type="button"
            onClick={() => handleToggle(id)}
            disabled={disabled}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                checked ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
            )}
            role="switch"
            aria-checked={checked}
            aria-disabled={disabled}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    checked ? "translate-x-5" : "translate-x-0"
                )}
            />
        </button>
    );

    return (
        <div className="animate-in fade-in duration-300 max-w-4xl space-y-10">
            
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Notification Preferences</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">Manage the alerts and emails you receive from the HRMS.</p>
                </div>
                {!canManageAlerts && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors">
                        <Lock size={14} /> Read Only
                    </span>
                )}
            </div>

            {/* Admin Emails Section */}
            <section>
                <div className="flex items-center gap-2 mb-1">
                    <Mail size={18} className="text-gray-400 dark:text-gray-500 transition-colors" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">Administrative Emails</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">Choose what operational events trigger an email to your inbox.</p>
                
                <div className="space-y-3">
                    <NotificationRow
                        title="New Leave Requests"
                        description="Get notified when an employee applies for time off."
                        control={<Switch id="email_leave_requests" checked={prefs.email_leave_requests} disabled={!canManageAlerts} />}
                    />
                    <NotificationRow
                        title="Payroll Processing"
                        description="Alerts regarding payroll generation and approvals."
                        control={<Switch id="email_payroll_processing" checked={prefs.email_payroll_processing} disabled={!canManageAlerts} />}
                    />
                    <NotificationRow
                        title="New Employee Onboarding"
                        description="Alerts when a new profile is added to the system."
                        control={<Switch id="email_onboarding" checked={prefs.email_onboarding} disabled={!canManageAlerts} />}
                    />
                </div>
            </section>

            {/* System Alerts Section */}
            <section className="pt-8 border-t border-gray-100 dark:border-gray-800 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                    <Bell size={18} className="text-gray-400 dark:text-gray-500 transition-colors" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">System Alerts</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">In-app notifications for the admin dashboard.</p>
                
                <div className="space-y-3">
                    <NotificationRow
                        title="Daily Attendance Summary"
                        description="Receive a digest of late check-ins and absences at 10 AM."
                        control={<Switch id="system_attendance_summary" checked={prefs.system_attendance_summary} disabled={!canManageAlerts} />}
                    />
                    <NotificationRow
                        title="Project Deadlines"
                        description="Reminders when a project due date is approaching within 48 hours."
                        control={<Switch id="system_project_deadlines" checked={prefs.system_project_deadlines} disabled={!canManageAlerts} />}
                    />
                </div>
            </section>

            {/* Privacy Note */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl flex items-start gap-3 border border-gray-100 dark:border-gray-800 transition-colors">
                <ShieldCheck size={20} className="text-blue-600 dark:text-blue-500 mt-0.5 shrink-0 transition-colors" />
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed transition-colors">
                    <strong className="text-gray-900 dark:text-gray-100">Privacy Note:</strong> Your notification preferences are private and only apply to your account. Some critical system alerts (like password resets) will always be sent regardless of these settings.
                </p>
            </div>

        </div>
    );
}

function NotificationRow({ title, description, control }: { title: string; description: string; control: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all shadow-sm dark:shadow-none">
            <div className="pr-4">
                <p className="font-bold text-gray-900 dark:text-gray-100 transition-colors">{title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">{description}</p>
            </div>
            {control}
        </div>
    );
}