import React from 'react';
import { IndianRupee, CreditCard, Clock, Activity } from 'lucide-react';

export default function LoanStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Active Loans</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
                <div className="p-3 bg-blue-50 text-[#4F7CF3] rounded-xl"><Activity size={20} /></div>
            </div>
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Pending Requests</p>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><Clock size={20} /></div>
            </div>
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Disbursed</p>
                    <p className="text-2xl font-bold text-gray-900">₹ 8,50,000</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><IndianRupee size={20} /></div>
            </div>
            
            <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Monthly EMI Recovery</p>
                    <p className="text-2xl font-bold text-gray-900">₹ 45,200</p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><CreditCard size={20} /></div>
            </div>
        </div>
    );
}