// src/components/payroll/PayslipModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Download, Printer, IndianRupee, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PayrollRecord } from './PayrollTable';
import { cn } from '@/utils/cn';

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
            
            // PDF HTML always remains strictly light-themed for printing consistency
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
                            <td style="width: 4%;"></td> 
                            <td style="width: 48%; vertical-align: top; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0;">
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
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-colors">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 transition-colors">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 transition-colors">
                        <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                        Payslip Preview
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Body (UI Preview) */}
                <div className="p-6 md:p-8">
                    <div className="text-center border-b border-gray-200 dark:border-gray-800 pb-6 mb-6 transition-colors">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase transition-colors">Macenza Inc.</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">Payslip for the month of {currentMonth}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-4 text-sm mb-8">
                        <div><span className="text-gray-500 dark:text-gray-400">Employee Name:</span> <span className="font-bold text-gray-900 dark:text-gray-100">{record.name}</span></div>
                        <div className="text-right"><span className="text-gray-500 dark:text-gray-400">Employee ID:</span> <span className="font-bold text-gray-900 dark:text-gray-100">{record.id}</span></div>
                        <div><span className="text-gray-500 dark:text-gray-400">Department:</span> <span className="font-bold text-gray-900 dark:text-gray-100">{record.department}</span></div>
                        <div className="text-right"><span className="text-gray-500 dark:text-gray-400">Status:</span> <span className="font-bold text-blue-600 dark:text-blue-400">{record.status}</span></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden mb-6 transition-colors">
                        {/* Earnings Section */}
                        <div className="bg-gray-50 dark:bg-gray-800/20 p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 transition-colors">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2 mb-3 transition-colors">Earnings</h3>
                            <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300 transition-colors">
                                <span>Basic Salary</span><span>{formatINR(record.basicSalary)}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300 transition-colors">
                                <span>House Rent</span><span>{formatINR(record.grossSalary - record.basicSalary)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-gray-100 pt-3 border-t border-gray-200 dark:border-gray-800 mt-4 transition-colors">
                                <span>Gross Earnings</span><span>{formatINR(record.grossSalary)}</span>
                            </div>
                        </div>
                        
                        {/* Deductions Section */}
                        <div className="p-4 bg-white dark:bg-transparent">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-2 mb-3 transition-colors">Deductions</h3>
                            <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300 transition-colors">
                                <span>Provident Fund</span><span>{formatINR((record.grossSalary - record.netPayable) * 0.8)}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2 text-gray-700 dark:text-gray-300 transition-colors">
                                <span>Prof. Tax</span><span>{formatINR((record.grossSalary - record.netPayable) * 0.2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-red-600 dark:text-red-400 pt-3 border-t border-gray-200 dark:border-gray-800 mt-4 transition-colors">
                                <span>Total Deductions</span><span>{formatINR(record.grossSalary - record.netPayable)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Net Payable Banner */}
                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg p-4 flex items-center justify-between transition-colors">
                        <span className="font-bold text-gray-700 dark:text-gray-300 text-lg transition-colors">Net Payable</span>
                        <div className="flex items-center text-2xl font-black text-blue-700 dark:text-blue-400 transition-colors">
                            <IndianRupee size={24} strokeWidth={3} className="mr-1" />
                            {record.netPayable.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
                
                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 transition-colors">
                    <Button 
                        variant="outline" 
                        onClick={() => window.print()} 
                        className="gap-2 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        disabled={isDownloading}
                    >
                        <Printer size={16} /> Print
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={handleDownloadReceipt} 
                        className="gap-2 font-semibold"
                        disabled={isDownloading}
                    >
                        {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        {isDownloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                </div>
            </div>
        </div>
    );
}