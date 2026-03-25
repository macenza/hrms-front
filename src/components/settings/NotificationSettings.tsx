import React from 'react';

// Reusable toggle switch component for the UI
const ToggleSwitch = ({ defaultChecked }: { defaultChecked: boolean }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F7CF3]"></div>
    </label>
);

export default function NotificationSettings() {
    return (
        <div className="animate-in fade-in duration-300 space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Email Notifications</h2>
                <p className="text-sm text-gray-500 mb-6">Choose what events trigger an email to your inbox.</p>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div>
                            <p className="font-bold text-gray-900">New Leave Requests</p>
                            <p className="text-sm text-gray-500 mt-0.5">Get notified when an employee applies for time off.</p>
                        </div>
                        <ToggleSwitch defaultChecked={true} />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div>
                            <p className="font-bold text-gray-900">Payroll Processing</p>
                            <p className="text-sm text-gray-500 mt-0.5">Alerts regarding payroll generation and approvals.</p>
                        </div>
                        <ToggleSwitch defaultChecked={true} />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div>
                            <p className="font-bold text-gray-900">New Employee Onboarding</p>
                            <p className="text-sm text-gray-500 mt-0.5">Alerts when a new profile is added to the system.</p>
                        </div>
                        <ToggleSwitch defaultChecked={false} />
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">System Alerts</h2>
                <p className="text-sm text-gray-500 mb-6">In-app notifications for the admin dashboard.</p>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div>
                            <p className="font-bold text-gray-900">Daily Attendance Summary</p>
                            <p className="text-sm text-gray-500 mt-0.5">Receive a digest of late check-ins and absences at 10 AM.</p>
                        </div>
                        <ToggleSwitch defaultChecked={true} />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                        <div>
                            <p className="font-bold text-gray-900">Project Deadlines</p>
                            <p className="text-sm text-gray-500 mt-0.5">Reminders when a project due date is approaching within 48 hours.</p>
                        </div>
                        <ToggleSwitch defaultChecked={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}