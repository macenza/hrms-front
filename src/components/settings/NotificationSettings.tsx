'use client';

import React, { useState } from 'react';
import { Mail, Bell, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';

// 1. Data Contract for Backend Integration
export interface NotificationPreferences {
    email_leave_requests: boolean;
    email_payroll_processing: boolean;
    email_onboarding: boolean;
    system_attendance_summary: boolean;
    system_project_deadlines: boolean;
}

interface NotificationSettingsProps {
    initialData?: NotificationPreferences;
    onUpdate?: (data: NotificationPreferences) => void;
}

// 2. Mock Data Fallback
const mockPreferences: NotificationPreferences = {
    email_leave_requests: true,
    email_payroll_processing: true,
    email_onboarding: false,
    system_attendance_summary: true,
    system_project_deadlines: true,
};

export default function NotificationSettings({
    initialData = mockPreferences,
    onUpdate
}: NotificationSettingsProps) {

    const [prefs, setPrefs] = useState<NotificationPreferences>(initialData);

    // 3. Centralized Toggle Handler
    const handleToggle = (key: keyof NotificationPreferences) => {
        const updated = { ...prefs, [key]: !prefs[key] };
        setPrefs(updated);

        // Optional: Auto-save on toggle or wait for a global save button
        onUpdate?.(updated);
    };

    // Internal Toggle UI Component
    const Switch = ({ id, checked }: { id: keyof NotificationPreferences; checked: boolean }) => (
        <button
            type="button"
            onClick={() => handleToggle(id)}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                checked ? "bg-blue-600" : "bg-gray-200"
            )}
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

            {/* Email Notifications Group */}
            <section>
                <div className="flex items-center gap-2 mb-1">
                    <Mail size={18} className="text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-900">Email Notifications</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6">Choose what events trigger an email to your inbox.</p>

                <div className="space-y-3">
                    <NotificationRow
                        title="New Leave Requests"
                        description="Get notified when an employee applies for time off."
                        control={<Switch id="email_leave_requests" checked={prefs.email_leave_requests} />}
                    />
                    <NotificationRow
                        title="Payroll Processing"
                        description="Alerts regarding payroll generation and approvals."
                        control={<Switch id="email_payroll_processing" checked={prefs.email_payroll_processing} />}
                    />
                    <NotificationRow
                        title="New Employee Onboarding"
                        description="Alerts when a new profile is added to the system."
                        control={<Switch id="email_onboarding" checked={prefs.email_onboarding} />}
                    />
                </div>
            </section>

            {/* System Alerts Group */}
            <section className="pt-8 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                    <Bell size={18} className="text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-900">System Alerts</h2>
                </div>
                <p className="text-sm text-gray-500 mb-6">In-app notifications for the admin dashboard.</p>

                <div className="space-y-3">
                    <NotificationRow
                        title="Daily Attendance Summary"
                        description="Receive a digest of late check-ins and absences at 10 AM."
                        control={<Switch id="system_attendance_summary" checked={prefs.system_attendance_summary} />}
                    />
                    <NotificationRow
                        title="Project Deadlines"
                        description="Reminders when a project due date is approaching within 48 hours."
                        control={<Switch id="system_project_deadlines" checked={prefs.system_project_deadlines} />}
                    />
                </div>
            </section>

            {/* Security Disclaimer */}
            <div className="p-4 bg-gray-50 rounded-xl flex items-start gap-3 border border-gray-100">
                <ShieldCheck size={20} className="text-blue-600 mt-0.5" />
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