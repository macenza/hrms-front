// src/components/employees/AddEmployeeModal.tsx
'use client';

import React, { useState } from 'react';
import { Check, UploadCloud, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// 1. Flattened UI State (Easier for React to manage)
export interface EmployeeFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    employeeId: string;
    department: string;
    role: 'Employee' | 'Manager' | 'HR' | 'Admin'; // Fixed to match MongoDB Enum
    salary: string;
    joiningDate: string;
}

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    // We expect the parent to handle the API call so we can keep this component pure
    onSubmit?: (apiPayload: any) => void; 
    isSubmitting?: boolean; // Added to handle React Query mutation state
}

const initialFormState: EmployeeFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`, // Simple auto-gen for UI
    department: 'Engineering',
    role: 'Employee', // Default to base role
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0] // Default to today
};

export default function AddEmployeeModal({ isOpen, onClose, onSubmit, isSubmitting = false }: AddEmployeeModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<EmployeeFormData>(initialFormState);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setError(''); // Clear errors when user types
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        if (isSubmitting) return; // Prevent closing while saving
        setStep(1);
        setFormData(initialFormState);
        setError('');
        onClose();
    };

    // Lightweight step validation before moving forward
    const validateStep = () => {
        if (step === 1) {
            if (!formData.firstName || !formData.lastName || !formData.email) {
                setError('Name and Email are required.');
                return false;
            }
        }
        if (step === 2) {
            if (!formData.department || !formData.joiningDate) {
                setError('Department and Joining Date are required.');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep()) return;

        if (step < 3) {
            setStep(prev => prev + 1);
            return;
        }

        // 2. Data Transformation Layer
        // Transform the flat UI state into the nested structure the backend expects
        const apiPayload = {
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            email: formData.email,
            password: 'TempPassword123!', // Standard practice: Set temp password, force change on login
            employeeId: formData.employeeId,
            role: formData.role,
            profile: {
                personal: {
                    phone: formData.phone,
                    address: formData.address,
                },
                employment: {
                    department: formData.department,
                    joiningDate: formData.joiningDate,
                }
            }
            // Note: Salary and Documents would typically have their own specific endpoints 
            // or schema definitions, but this aligns with what we have in User.js so far.
        };

        if (onSubmit) {
            onSubmit(apiPayload);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Employee" className="max-w-3xl">
            <form onSubmit={handleSubmit} className="flex flex-col">
                {/* Stepper Header */}
                <div className="px-4 pt-2 pb-6">
                    <div className="relative flex items-center justify-between w-full">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 z-0"></div>
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 z-0 transition-all duration-300"
                            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                        ></div>
                        
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors border-2",
                                    step >= num ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-400"
                                )}>
                                    {step > num ? <Check size={16} /> : num}
                                </div>
                                <span className={cn("text-xs font-semibold uppercase tracking-wider", step >= num ? "text-blue-600" : "text-gray-400")}>
                                    {num === 1 ? 'Personal Info' : num === 2 ? 'Job Details' : 'Documents'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 p-2 min-h-[250px]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm border border-red-200 rounded-md">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" disabled={isSubmitting} />
                            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" disabled={isSubmitting} />
                            <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" disabled={isSubmitting} />
                            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" disabled={isSubmitting} />
                            <div className="md:col-span-2">
                                <Input label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St, City, Country" disabled={isSubmitting} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Input label="Employee ID" name="employeeId" value={formData.employeeId} readOnly className="bg-gray-50 text-gray-500" />
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Department</label>
                                <select disabled={isSubmitting} name="department" value={formData.department} onChange={handleChange} className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white">
                                    <option value="Engineering">Engineering</option>
                                    <option value="Design">Design</option>
                                    <option value="Product">Product</option>
                                    <option value="HR">HR</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">System Role</label>
                                <select disabled={isSubmitting} name="role" value={formData.role} onChange={handleChange} className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white">
                                    <option value="Employee">Employee (Standard Access)</option>
                                    <option value="Manager">Manager</option>
                                    <option value="HR">HR Professional</option>
                                    <option value="Admin">System Admin</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700">Salary</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                                    <input disabled={isSubmitting} type="number" name="salary" value={formData.salary} onChange={handleChange} placeholder="50000" className="w-full h-10 pl-7 pr-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm" />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <Input disabled={isSubmitting} label="Joining Date" type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                    <UploadCloud size={24} />
                                </div>
                                <p className="text-sm font-semibold text-gray-900">Upload Profile Photo</p>
                                <p className="text-xs text-gray-500 mt-1">Files will be processed after profile creation.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                    {step === 1 ? (
                        <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                    ) : (
                        <Button type="button" variant="outline" onClick={() => setStep(step - 1)} disabled={isSubmitting}>
                            Previous
                        </Button>
                    )}
                    
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : step < 3 ? 'Next' : 'Submit'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}