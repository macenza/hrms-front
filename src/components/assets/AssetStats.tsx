import React from 'react';
import { Laptop, CheckCircle2, UserCheck, Wrench } from 'lucide-react';

export default function AssetStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Assets</p>
                    <p className="text-2xl font-bold text-gray-900">145</p>
                </div>
                <div className="p-3 bg-gray-50 text-gray-600 rounded-xl"><Laptop size={20} /></div>
            </div>
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Assigned</p>
                    <p className="text-2xl font-bold text-gray-900">112</p>
                </div>
                <div className="p-3 bg-blue-50 text-[#4F7CF3] rounded-xl"><UserCheck size={20} /></div>
            </div>
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Available</p>
                    <p className="text-2xl font-bold text-gray-900">28</p>
                </div>
                <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={20} /></div>
            </div>
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Under Maintenance</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
                <div className="p-3 bg-orange-50 text-orange-500 rounded-xl"><Wrench size={20} /></div>
            </div>
        </div>
    );
}