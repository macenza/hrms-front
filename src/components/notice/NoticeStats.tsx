import React from 'react';
import { Megaphone, Pin, CalendarDays, BellRing } from 'lucide-react';

export default function NoticeStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Notices</p>
                    <p className="text-2xl font-bold text-gray-900">42</p>
                </div>
                <div className="p-3 bg-blue-50 text-[#4F7CF3] rounded-xl"><Megaphone size={20} /></div>
            </div>
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Pinned / Important</p>
                    <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
                <div className="p-3 bg-red-50 text-red-500 rounded-xl"><Pin size={20} /></div>
            </div>
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Upcoming Events</p>
                    <p className="text-2xl font-bold text-gray-900">4</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CalendarDays size={20} /></div>
            </div>
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><BellRing size={20} /></div>
            </div>
        </div>
    );
}