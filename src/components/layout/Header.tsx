import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

export default function Header() {
    return (
        <header className="h-20 bg-[#F5F7FA] flex items-center justify-between px-8 sticky top-0 z-10">
            {/* Left Greeting */}
            <div>
                <h2 className="text-2xl font-bold text-[#1F2937]">Good Morning, Admin 👋</h2>
                <p className="text-sm text-[#6B7280]">Here's what's happening with your store today.</p>
            </div>

            {/* Center Search - Hidden on small screens */}
            <div className="hidden lg:block w-96">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for employee, project, etc..."
                        className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-gray-600 placeholder-gray-400 shadow-sm"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-6">
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-full transition-all">
                    <Bell size={24} />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#F5F7FA]"></span>
                </button>

                <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                    <div className="flex flex-col items-end hidden md:flex">
                        <span className="text-sm font-bold text-[#1F2937]">Thomas Anree</span>
                        <span className="text-xs text-[#6B7280]">HR Manager</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200 cursor-pointer">
                        TA
                    </div>
                    <ChevronDown size={16} className="text-gray-400 cursor-pointer" />
                </div>
            </div>
        </header>
    );
}