'use client';

import React from 'react';
import { Save, AlertTriangle, Trash2 } from 'lucide-react';

export default function ProjectSettingsTab() {
    return (
        <div className="max-w-4xl animate-in fade-in duration-300 space-y-8">
            
            {/* General Settings */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">General Details</h2>
                
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Project Name</label>
                            <input 
                                type="text" 
                                defaultValue="Website Redesign" 
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-900 font-medium" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Project Manager</label>
                            <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-700 bg-white font-medium">
                                <option>Alice Johnson</option>
                                <option>Bob Smith</option>
                                <option>Sarah Lee</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Description</label>
                        <textarea 
                            defaultValue="Revamp the corporate website with new branding and improved accessibility."
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none min-h-[100px] resize-none text-gray-700" 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Status</label>
                            <select className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-700 bg-white font-medium">
                                <option>In Progress</option>
                                <option>Completed</option>
                                <option>On Hold</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Due Date</label>
                            <input 
                                type="date" 
                                defaultValue="2023-12-15"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none text-gray-600 font-medium" 
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] transition-colors shadow-sm">
                            <Save size={16} /> Save Changes
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 rounded-2xl border border-red-100 p-6">
                <h2 className="text-lg font-bold text-red-700 mb-2 flex items-center gap-2">
                    <AlertTriangle size={20} /> Danger Zone
                </h2>
                <p className="text-sm text-red-600 mb-6">Irreversible actions regarding this project.</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-red-100 rounded-xl">
                    <div>
                        <h3 className="font-bold text-gray-900">Delete Project</h3>
                        <p className="text-sm text-gray-500 mt-1">Once deleted, it will be gone forever. Please be certain.</p>
                    </div>
                    <button className="shrink-0 flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-colors">
                        <Trash2 size={16} /> Delete Project
                    </button>
                </div>
            </div>

        </div>
    );
}