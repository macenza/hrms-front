'use client';

import React, { useState } from 'react';
import { X, Download, Printer, IndianRupee, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PayrollRecord } from './PayrollTable';

interface PayslipModalProps {
    isOpen: boolean;
    record: PayrollRecord | null;
    onClose: () => void;
}

const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
};

export default function PayslipModal({ isOpen, record, onClose }: PayslipModalProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen || !record) return null;

    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    const handleDownloadReceipt = async () => {
        setIsDownloading(true);
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            
            const pdfHtmlString = `
                <div style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111827; background-color: #ffffff;">
                    <div style="text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="font-size: 28px; font-weight: 900; margin: 0; text-transform: uppercase; color: #111827;">Macenza Inc.</h1>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">Payslip for the month of ${currentMonth}</p>
                    </div>

                    <table style="width: 100%; margin-bottom: 30px; font-size: 14px;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Employee Name:</td>
                            <td style="padding: 8px 0; font-weight: bold;">${record.name}</td>
                            <td style="padding: 8px 0; color: #6b7280; text-align: right;">Employee ID:</td>
                            <td style="padding: 8px 0; font-weight: bold; text-align: right;">${record.id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Department:</td>
                            <td style="padding: 8px 0; font-weight: bold;">${record.department}</td>
                            <td style="padding: 8px 0; color: #6b7280; text-align: right;">Status:</td>
                            <td style="padding: 8px 0; font-weight: bold; color: #2563eb; text-align: right;">${record.status}</td>
                        </tr>
                    </table>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <tr>
                            <td style="width: 48%; vertical-align: top; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0;">
                                <div style="background: #f9fafb; padding: 15px; border-bottom: 1px solid #e5e7eb;">
                                    <h3 style="margin: 0; font-size: 16px; font-weight: bold;">Earnings</h3>
                                </div>
                                <div style="padding: 15px; font-size: 14px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span style="color: #4b5563;">Basic Salary</span>
                                        <span>${formatINR(record.basicSalary)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span style="color: #4b5563;">House Rent</span>
                                        <span>${formatINR(record.grossSalary - record.basicSalary)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-weight: bold;">
                                        <span>Gross Earnings</span>
                                        <span>${formatINR(record.grossSalary)}</span>
                                    </div>
                                </div>
                            </td>
                            <td style="width: 4%;"></td> <td style="width: 48%; vertical-align: top; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0;">
                                <div style="background: #f9fafb; padding: 15px; border-bottom: 1px solid #e5e7eb;">
                                    <h3 style="margin: 0; font-size: 16px; font-weight: bold;">Deductions</h3>
                                </div>
                                <div style="padding: 15px; font-size: 14px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span style="color: #4b5563;">Provident Fund</span>
                                        <span>${formatINR((record.grossSalary - record.netPayable) * 0.8)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                        <span style="color: #4b5563;">Prof. Tax</span>
                                        <span>${formatINR((record.grossSalary - record.netPayable) * 0.2)}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-weight: bold; color: #dc2626;">
                                        <span>Total Deductions</span>
                                        <span>${formatINR(record.grossSalary - record.netPayable)}</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 18px; font-weight: bold; color: #374151;">Net Payable</span>
                        <span style="font-size: 24px; font-weight: 900; color: #1d4ed8;">${formatINR(record.netPayable)}</span>
                    </div>
                </div>
            `;
        
            const opt = {
                margin: 0.5,
                filename: `Payslip_${record.name.replace(/\s+/g, '_')}_${currentMonth}.pdf`,
                image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as 'portrait' }
            };
        
            await html2pdf().set(opt).from(pdfHtmlString).save();
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText size={20} className="text-blue-600" />
                        Payslip Preview
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* React UI Content (What the user sees on screen) */}
                <div className="p-8 bg-white">
                    <div className="text-center border-b border-gray-200 pb-6 mb-6">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Macenza Inc.</h1>
                        <p className="text-sm text-gray-500 font-medium">Payslip for the month of {currentMonth}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-4 text-sm mb-8">
                        <div><span className="text-gray-500">Employee Name:</span> <span className="font-bold text-gray-900">{record.name}</span></div>
                        <div className="text-right"><span className="text-gray-500">Employee ID:</span> <span className="font-bold text-gray-900">{record.id}</span></div>
                        <div><span className="text-gray-500">Department:</span> <span className="font-bold text-gray-900">{record.department}</span></div>
                        <div className="text-right"><span className="text-gray-500">Status:</span> <span className="font-bold text-blue-600">{record.status}</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border border-gray-200 rounded-lg overflow-hidden mb-6">
                        <div className="bg-gray-50 p-4 border-r border-gray-200">
                            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">Earnings</h3>
                            <div className="flex justify-between text-sm mb-2 text-gray-700">
                                <span>Basic Salary</span><span>{formatINR(record.basicSalary)}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2 text-gray-700">
                                <span>House Rent</span><span>{formatINR(record.grossSalary - record.basicSalary)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-gray-900 pt-3 border-t border-gray-200 mt-4">
                                <span>Gross Earnings</span><span>{formatINR(record.grossSalary)}</span>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">Deductions</h3>
                            <div className="flex justify-between text-sm mb-2 text-gray-700">
                                <span>Provident Fund</span><span>{formatINR((record.grossSalary - record.netPayable) * 0.8)}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2 text-gray-700">
                                <span>Prof. Tax</span><span>{formatINR((record.grossSalary - record.netPayable) * 0.2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-red-600 pt-3 border-t border-gray-200 mt-4">
                                <span>Total Deductions</span><span>{formatINR(record.grossSalary - record.netPayable)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
                        <span className="font-bold text-gray-700 text-lg">Net Payable</span>
                        <div className="flex items-center text-2xl font-black text-blue-700">
                            <IndianRupee size={24} strokeWidth={3} className="mr-1" />
                            {record.netPayable.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => window.print()} className="gap-2 bg-white shadow-sm text-gray-600">
                        <Printer size={16} /> Print
                    </Button>
                </div>
            </div>
        </div>
    );
}