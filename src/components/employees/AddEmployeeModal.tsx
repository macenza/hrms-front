'use client';

import React, { useState } from 'react';
import { X, Check, UploadCloud, FileText } from 'lucide-react';
import clsx from 'clsx';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', address: '',
        employeeId: 'EMP-001', department: 'Engineering', role: 'Frontend Developer', salary: '50,000', joiningDate: ''
    });

    // Reset step when modal closes
    const handleClose = () => {
        setStep(1);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal Box */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
                    <button 
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Stepper */}
                <div className="px-8 pt-6 pb-2">
                    <div className="relative flex items-center justify-between w-full">
                        {/* Connecting Lines */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 z-0"></div>
                        <div 
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#4F7CF3] z-0 transition-all duration-300"
                            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                        ></div>

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                            <div className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors border-2",
                                step >= 1 ? "bg-[#4F7CF3] border-[#4F7CF3] text-white" : "bg-white border-gray-300 text-gray-400"
                            )}>
                                {step > 1 ? <Check size={16} /> : "1"}
                            </div>
                            <span className={clsx("text-xs font-semibold uppercase tracking-wider", step >= 1 ? "text-[#4F7CF3]" : "text-gray-400")}>Personal Info</span>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                            <div className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors border-2",
                                step >= 2 ? "bg-[#4F7CF3] border-[#4F7CF3] text-white" : "bg-white border-gray-300 text-gray-400"
                            )}>
                                {step > 2 ? <Check size={16} /> : "2"}
                            </div>
                            <span className={clsx("text-xs font-semibold uppercase tracking-wider", step >= 2 ? "text-[#4F7CF3]" : "text-gray-400")}>Job Details</span>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                            <div className={clsx(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors border-2",
                                step >= 3 ? "bg-[#4F7CF3] border-[#4F7CF3] text-white" : "bg-white border-gray-300 text-gray-400"
                            )}>
                                3
                            </div>
                            <span className={clsx("text-xs font-semibold uppercase tracking-wider", step >= 3 ? "text-[#4F7CF3]" : "text-gray-400")}>Documents</span>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-8">
                    {/* STEP 1: Personal Info */}
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                <input type="text" placeholder="John" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                <input type="text" placeholder="Doe" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <input type="email" placeholder="john@example.com" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Phone</label>
                                <input type="text" placeholder="+1 234 567 890" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none transition-all" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Address</label>
                                <input type="text" placeholder="123 Main St, City, Country" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none transition-all" />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Job Details */}
                    {step === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Employee ID</label>
                                <input type="text" defaultValue="EMP-001" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none text-gray-500" readOnly />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Department</label>
                                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none transition-all bg-white">
                                    <option>Engineering</option>
                                    <option>Design</option>
                                    <option>Product</option>
                                    <option>HR</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Role</label>
                                <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none transition-all bg-white">
                                    <option>Frontend Developer</option>
                                    <option>Backend Developer</option>
                                    <option>UX Designer</option>
                                    <option>QA Engineer</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Salary</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input type="text" placeholder="50,000" className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none transition-all" />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Joining Date</label>
                                <input type="date" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4F7CF3]/20 focus:border-[#4F7CF3] outline-none transition-all text-gray-600" />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Documents */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="p-3 bg-blue-50 text-[#4F7CF3] rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    <UploadCloud size={24} />
                                </div>
                                <p className="text-sm font-semibold text-gray-900">Upload Profile Photo</p>
                                <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-[#4F7CF3] transition-colors cursor-pointer">
                                    <div className="p-2 bg-gray-100 text-gray-500 rounded-lg">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">ID_Proof.pdf</p>
                                        <p className="text-xs text-[#4F7CF3] mt-0.5 font-medium">Tap to upload</p>
                                    </div>
                                </div>
                                <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-[#4F7CF3] transition-colors cursor-pointer">
                                    <div className="p-2 bg-gray-100 text-gray-500 rounded-lg">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Offer_Letter.pdf</p>
                                        <p className="text-xs text-[#4F7CF3] mt-0.5 font-medium">Tap to upload</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    {step === 1 ? (
                        <button 
                            onClick={handleClose}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                    ) : (
                        <button 
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Previous
                        </button>
                    )}

                    {step < 3 ? (
                        <button 
                            onClick={() => setStep(step + 1)}
                            className="px-8 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] transition-colors shadow-sm shadow-blue-500/30"
                        >
                            Next
                        </button>
                    ) : (
                        <button 
                            onClick={handleClose}
                            className="px-8 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] transition-colors shadow-sm shadow-blue-500/30"
                        >
                            Submit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}