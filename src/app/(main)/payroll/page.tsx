'use client';

import React from 'react';
import { Download, FileText, PlayCircle, IndianRupee, Users, Clock, AlertCircle } from 'lucide-react';
import PayrollTable from '@/components/payroll/PayrollTable';

export default function PayrollPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage salaries, deductions and generate payslips</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                        <Download size={16} /> Export Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">
                        <FileText size={16} /> Slip Generator
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-medium hover:bg-[#3A62D7] shadow-sm">
                        <PlayCircle size={16} /> Run Payroll
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2"><IndianRupee size={16} /> <span className="text-sm font-medium">Total Payroll</span></div>
                    <p className="text-2xl font-bold text-gray-900">₹ 24,50,000</p>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2"><Users size={16} /> <span className="text-sm font-medium">Employees Paid</span></div>
                    <p className="text-2xl font-bold text-gray-900">520</p>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2"><Clock size={16} /> <span className="text-sm font-medium">Pending Approvals</span></div>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500 mb-2"><AlertCircle size={16} /> <span className="text-sm font-medium">Total Deductions</span></div>
                    <p className="text-2xl font-bold text-gray-900">₹ 3,20,000</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Employee Payroll List</h2>
                <PayrollTable />
            </div>
        </div>
    );
}