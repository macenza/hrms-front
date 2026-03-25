import React from 'react';
import { Calendar, Thermometer, Clock, CheckCircle2 } from 'lucide-react';

export default function LeaveStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Annual Leave</p>
                    <p className="text-2xl font-bold text-gray-900">12 <span className="text-sm font-medium text-gray-500">/ 20 days</span></p>
                </div>
                <div className="p-3 bg-blue-50 text-[#4F7CF3] rounded-xl"><Calendar size={20} /></div>
            </div>
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Sick Leave</p>
                    <p className="text-2xl font-bold text-gray-900">5 <span className="text-sm font-medium text-gray-500">/ 10 days</span></p>
                </div>
                <div className="p-3 bg-red-50 text-red-500 rounded-xl"><Thermometer size={20} /></div>
            </div>
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Pending Requests</p>
                    <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><Clock size={20} /></div>
            </div>
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Approved (YTD)</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={20} /></div>
            </div>
        </div>
    );
}