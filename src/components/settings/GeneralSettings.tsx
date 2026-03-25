import React from 'react';
import { UploadCloud, Save } from 'lucide-react';

export default function GeneralSettings() {
    return (
        <div className="animate-in fade-in duration-300 space-y-8">
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Company Profile</h2>
                <p className="text-sm text-gray-500 mb-6">Update your company's basic information and logo.</p>
                
                {/* Logo Upload */}
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-2xl font-bold text-[#4F7CF3]">
                        M
                    </div>
                    <div>
                        <div className="flex gap-3 mb-2">
                            <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
                                <UploadCloud size={16} /> Change Logo
                            </button>
                            <button className="px-4 py-2 text-red-500 text-sm font-semibold hover:bg-red-50 rounded-lg transition-colors">
                                Remove
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">Recommended size: 256x256px. Formats: JPG, PNG, SVG.</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Company Name</label>
                        <input type="text" defaultValue="MACENZA Tech" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-900 font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Support Email</label>
                        <input type="email" defaultValue="support@macenza.com" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-900 font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Phone Number</label>
                        <input type="text" defaultValue="+1 (555) 123-4567" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-900 font-medium" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Default Timezone</label>
                        <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-700 bg-white font-medium">
                            <option value="pst">Pacific Standard Time (PST)</option>
                            <option value="est">Eastern Standard Time (EST)</option>
                            <option value="utc">Coordinated Universal Time (UTC)</option>
                            <option value="ist">Indian Standard Time (IST)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] shadow-sm transition-colors">
                    <Save size={16} /> Save Changes
                </button>
            </div>
        </div>
    );
}