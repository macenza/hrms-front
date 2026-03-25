import React from 'react';
import { ShieldCheck, Key, Save } from 'lucide-react';

export default function SecuritySettings() {
    return (
        <div className="animate-in fade-in duration-300 space-y-8">
            {/* Change Password Section */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Key size={18} className="text-gray-400" /> Change Password
                </h2>
                <p className="text-sm text-gray-500 mb-6">Ensure your account is using a long, random password to stay secure.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-gray-700">Current Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-900 font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-900 font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Confirm New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-900 font-medium" />
                    </div>
                </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="pt-6 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-gray-400" /> Two-Factor Authentication
                </h2>
                <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your admin account.</p>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50">
                    <div>
                        <p className="font-bold text-gray-900">Authenticator App</p>
                        <p className="text-sm text-gray-500 mt-0.5">Use an app like Google Authenticator to generate verification codes.</p>
                    </div>
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors shadow-sm">
                        Enable 2FA
                    </button>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] shadow-sm transition-colors">
                    <Save size={16} /> Update Security
                </button>
            </div>
        </div>
    );
}