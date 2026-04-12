'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Bell, ShieldCheck, Lock } from 'lucide-react';
import { cn } from '@/utils/cn';

// State
import { useAppSelector } from '@/store/hooks';

// Data Contract for Backend Integration
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

// Clean Default State
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
    // Form State
    const [prefs, setPrefs] = useState<NotificationPreferences>(initialData || defaultPreferences);

    // RBAC Implementation
    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role?.toLowerCase() || '';
    // Only Admin and HR should manage system-wide operational alerts
    const canManageAlerts = ['admin', 'hr'].includes(userRole);

    // Sync state when parent dynamically fetches data
    useEffect(() => {
        if (initialData) {
            setPrefs(initialData);
        }
    }, [initialData]);

    // Centralized Toggle Handler with Security Guard
    const handleToggle = (key: keyof NotificationPreferences) => {
        if (!canManageAlerts) return; // Prevent state update if unauthorized

        const updated = { ...prefs, [key]: !prefs[key] };
        setPrefs(updated);
        onUpdate?.(updated);
    };

    // Internal Toggle UI Component
    const Switch = ({ id, checked, disabled }: { id: keyof NotificationPreferences; checked: boolean; disabled: boolean }) => (
        <button
            type="button"
            onClick={() => handleToggle(id)}
            disabled={disabled}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                checked ? "bg-blue-600" : "bg-gray-200"
            )}
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
            {/* Header section with RBAC visual indicator */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Notification Preferences</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage the alerts and emails you receive from the HRMS.</p>
                </div>
                {!canManageAlerts && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold uppercase tracking-wider">
                        <Lock size={14} /> Read Only
                    </span>
                )}
            </div>

            {/* Email Notifications Group */}
            <section>
                <div className="flex items-center gap-2 mb-1">
                    <Mail size={18} className="text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-900">Administrative Emails</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">Choose what operational events trigger an email to your inbox.</p>

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

            {/* System Alerts Group */}
            <section className="pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                    <Bell size={18} className="text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-900">System Alerts</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">In-app notifications for the admin dashboard.</p>

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

            {/* Security Disclaimer */}
            <div className="p-4 bg-gray-50 rounded-xl flex items-start gap-3 border border-gray-100">
                <ShieldCheck size={20} className="text-blue-600 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600 leading-relaxed">
                    <strong>Privacy Note:</strong> Your notification preferences are private and only apply to your account. Some critical system alerts (like password resets) will always be sent regardless of these settings.
                </p>
            </div>
        </div>
    );
}

// Sub-component for clean layout
function NotificationRow({ title, description, control }: { title: string; description: string; control: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 transition-all shadow-sm">
            <div className="pr-4">
                <p className="font-bold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            </div>
            {control}
        </div>
    );
}