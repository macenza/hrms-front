// src/components/settings/NotificationSettings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Bell, ShieldCheck, Lock, Webhook, Save, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppSelector } from '@/store/hooks';
import { toast } from 'sonner';

export interface NotificationPrefsState {
    email_leave_requests: boolean;
    email_payroll_processing: boolean;
    email_onboarding: boolean;
    system_attendance_summary: boolean;
    system_project_deadlines: boolean;
    slackTeamsWebhook: string;
    slackTeamsEnabled: boolean;
}

interface NotificationSettingsProps {
    initialData?: { preferences?: NotificationPrefsState } | null;
    onUpdate?: (data: { preferences: NotificationPrefsState }) => Promise<void>;
}

const defaultPrefs: NotificationPrefsState = {
    email_leave_requests: true,
    email_payroll_processing: true,
    email_onboarding: true,
    system_attendance_summary: true,
    system_project_deadlines: true,
    slackTeamsWebhook: '',
    slackTeamsEnabled: false
};

export default function NotificationSettings({
    initialData,
    onUpdate
}: NotificationSettingsProps) {
    const [prefs, setPrefs] = useState<NotificationPrefsState>(defaultPrefs);
    const [isSaving, setIsSaving] = useState(false);

    const { user } = useAppSelector((state) => state.auth);
    const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Employee';

    useEffect(() => {
        if (initialData) {
            const rawPrefs = initialData.preferences || (initialData as any);
            setPrefs({
                email_leave_requests: rawPrefs.email_leave_requests ?? defaultPrefs.email_leave_requests,
                email_payroll_processing: rawPrefs.email_payroll_processing ?? defaultPrefs.email_payroll_processing,
                email_onboarding: rawPrefs.email_onboarding ?? defaultPrefs.email_onboarding,
                system_attendance_summary: rawPrefs.system_attendance_summary ?? defaultPrefs.system_attendance_summary,
                system_project_deadlines: rawPrefs.system_project_deadlines ?? defaultPrefs.system_project_deadlines,
                slackTeamsWebhook: rawPrefs.slackTeamsWebhook ?? defaultPrefs.slackTeamsWebhook,
                slackTeamsEnabled: rawPrefs.slackTeamsEnabled ?? defaultPrefs.slackTeamsEnabled,
            });
        }
    }, [initialData]);

    const handleToggle = (key: keyof Omit<NotificationPrefsState, 'slackTeamsWebhook'>) => {
        setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleWebhookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrefs((prev) => ({ ...prev, slackTeamsWebhook: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation if Slack/Teams enabled
        if (prefs.slackTeamsEnabled && prefs.slackTeamsWebhook.trim() === '') {
            toast.error("Webhook URL cannot be empty if webhook integration is enabled.");
            return;
        }

        if (prefs.slackTeamsWebhook.trim() !== '' && !/^https:\/\//.test(prefs.slackTeamsWebhook)) {
            toast.error("Webhook URL must start with https://");
            return;
        }

        setIsSaving(true);
        try {
            if (onUpdate) {
                await onUpdate({
                    preferences: prefs
                });
            }
        } finally {
            setIsSaving(false);
        }
    };

    const Switch = ({ id, checked }: { id: keyof Omit<NotificationPrefsState, 'slackTeamsWebhook'>; checked: boolean }) => (
        <button
            type="button"
            onClick={() => handleToggle(id)}
            className={cn(
                "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer",
                checked ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-200 dark:bg-gray-700"
            )}
            role="switch"
            aria-checked={checked}
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
        <form onSubmit={handleSubmit} className="animate-in fade-in duration-300 max-w-4xl space-y-10">

            <div className="flex justify-between items-start mb-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-colors">Notification Preferences</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">
                        Manage your personal alerts, digests, and enterprise chat integrations.
                    </p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors">
                    {userRole} Mode
                </span>
            </div>

            {/* Admin Emails Section */}
            {(userRole === 'Admin') && (
                <section className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 transition-colors shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Mail size={18} className="text-blue-500 dark:text-blue-400 transition-colors" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">Administrative Emails</h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">Choose what operational events trigger an email to your inbox.</p>

                    <div className="space-y-3">
                        <NotificationRow
                            title="New Leave Requests"
                            description="Get notified when an employee applies for time off."
                            control={<Switch id="email_leave_requests" checked={prefs.email_leave_requests} />}
                        />
                        <NotificationRow
                            title="Payroll Processing"
                            description="Alerts regarding payroll generation, modifications, and approvals."
                            control={<Switch id="email_payroll_processing" checked={prefs.email_payroll_processing} />}
                        />
                        <NotificationRow
                            title="New Employee Onboarding"
                            description="Alerts when a new employee profile is initialized in the system."
                            control={<Switch id="email_onboarding" checked={prefs.email_onboarding} />}
                        />
                    </div>
                </section>
            )}

            {/* System Alerts Section */}
            <section className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 transition-colors shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                    <Bell size={18} className="text-blue-500 dark:text-blue-400 transition-colors" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">System Alerts</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">In-app notifications for the admin dashboard.</p>

                <div className="space-y-3">
                    <NotificationRow
                        title="Daily Attendance Summary"
                        description="Receive a daily digest of late check-ins and absences at 10 AM."
                        control={<Switch id="system_attendance_summary" checked={prefs.system_attendance_summary} />}
                    />
                    <NotificationRow
                        title="Project Deadlines"
                        description="Reminders when a project due date is approaching within 48 hours."
                        control={<Switch id="system_project_deadlines" checked={prefs.system_project_deadlines} />}
                    />
                </div>
            </section>

            {/* Enterprise Webhook Integration Section */}
            <section className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 transition-colors shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                    <Webhook size={18} className="text-blue-500 dark:text-blue-400 transition-colors" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">Enterprise Webhook Integration</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">
                    Route real-time operational system alerts directly into your team channels (Slack or MS Teams).
                </p>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50/30 dark:bg-gray-950/10">
                        <div className="pr-4">
                            <p className="font-bold text-gray-900 dark:text-gray-100 transition-colors">Slack / Teams Notifications</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">
                                Enable message forwarding of your system alerts to a webhook channel.
                            </p>
                        </div>
                        <Switch id="slackTeamsEnabled" checked={prefs.slackTeamsEnabled} />
                    </div>

                    {prefs.slackTeamsEnabled && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">
                                Slack / Teams Webhook URL
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <MessageSquare size={16} />
                                </div>
                                <Input
                                    type="text"
                                    value={prefs.slackTeamsWebhook}
                                    onChange={handleWebhookChange}
                                    placeholder="https://hooks.slack.com/services/... or https://outlook.office.com/..."
                                    className="pl-10 text-gray-900 dark:text-gray-100 transition-colors"
                                />
                            </div>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                                Webhook integration supports posting rich markdown message payloads directly to channels.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Privacy Note & Save Trigger */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 gap-6 transition-colors">
                <div className="flex items-start gap-3 w-full sm:w-auto">
                    <ShieldCheck size={20} className="text-emerald-500 mt-0.5 shrink-0 transition-colors" />
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-md transition-colors">
                        <strong className="text-gray-900 dark:text-gray-100">Privacy & System Policy:</strong> Your notification preferences are private and only apply to your account. Some critical system alerts (like security audits) will always be sent.
                    </p>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    disabled={isSaving}
                    className="gap-2 font-bold shadow-sm shadow-blue-500/25 dark:shadow-none min-w-[160px] w-full sm:w-auto flex justify-center items-center shrink-0"
                >
                    {isSaving ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Save Preferences
                        </>
                    )}
                </Button>
            </div>

        </form>
    );
}

function NotificationRow({ title, description, control }: { title: string; description: string; control: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-blue-200 dark:hover:border-blue-900/50 transition-all shadow-sm dark:shadow-none">
            <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 dark:text-gray-100 transition-colors">{title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">{description}</p>
            </div>
            <div className="shrink-0">
                {control}
            </div>
        </div>
    );
}