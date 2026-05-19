'use client';
import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import ProfilePhotoUploadStep from '@/components/employees/ProfilePhotoUploadStep';

export interface EmployeeFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    employeeId: string;
    department: string;
    role: 'Employee' | 'Manager' | 'HR' | 'Admin';
    salary: string;
    joiningDate: string;
}

export interface AddEmployeeSubmitMeta {
    profilePhoto: File | null;
}

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (apiPayload: Record<string, unknown>, meta: AddEmployeeSubmitMeta) => void;
    isSubmitting?: boolean;
}

const initialFormState: EmployeeFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    department: 'Engineering',
    role: 'Employee',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0] // Default to today
};

export default function AddEmployeeModal({ isOpen, onClose, onSubmit, isSubmitting = false }: AddEmployeeModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<EmployeeFormData>(initialFormState);
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setError(''); // Clear errors when user types
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        if (isSubmitting) return; 
        setStep(1);
        setFormData(initialFormState);
        setProfilePhoto(null);
        setError('');
        onClose();
    };

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

        const apiPayload = {
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            email: formData.email,
            password: 'TempPassword123!',
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
        };

        if (onSubmit) {
            onSubmit(apiPayload, { profilePhoto });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Employee" className="max-w-3xl">
            <form onSubmit={handleSubmit} className="flex flex-col">
                {/* --- PROGRESS BAR --- */}
                <div className="px-4 pt-2 pb-6">
                    <div className="relative flex items-center justify-between w-full">
                        {/* Background track */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-800 z-0 transition-colors duration-300"></div>
                        
                        {/* Active track */}
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 z-0 transition-all duration-300"
                            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                        ></div>
                        
                        {/* Steps */}
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-gray-900 px-2 transition-colors duration-300">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors border-2",
                                    step >= num 
                                        ? "bg-blue-600 border-blue-600 text-white" 
                                        : "bg-white border-gray-300 text-gray-400 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-500"
                                )}>
                                    {step > num ? <Check size={16} /> : num}
                                </div>
                                <span className={cn(
                                    "text-xs font-semibold uppercase tracking-wider", 
                                    step >= num ? "text-blue-600" : "text-gray-400 dark:text-gray-500"
                                )}>
                                    {num === 1 ? 'Personal Info' : num === 2 ? 'Job Details' : 'Documents'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- FORM CONTENT --- */}
                <div className="flex-1 p-2 min-h-[250px]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 transition-colors">
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
                            {/* Note: The Input component should ideally handle its own disabled/readOnly dark mode styling, but we pass custom classes here just in case */}
                            <Input 
                                label="Employee ID" 
                                name="employeeId" 
                                value={formData.employeeId} 
                                readOnly 
                                className="bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-800" 
                            />    
                            
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Department</label>
                                <select 
                                    disabled={isSubmitting} 
                                    name="department" 
                                    value={formData.department} 
                                    onChange={handleChange} 
                                    className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100 dark:focus:ring-blue-500 transition-colors"
                                >
                                    <option value="Engineering">Engineering</option>
                                    <option value="Design">Design</option>
                                    <option value="Product">Product</option>
                                    <option value="HR">HR</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">System Role</label>
                                <select 
                                    disabled={isSubmitting} 
                                    name="role" 
                                    value={formData.role} 
                                    onChange={handleChange} 
                                    className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100 dark:focus:ring-blue-500 transition-colors"
                                >
                                    <option value="Employee">Employee (Standard Access)</option>
                                    <option value="Manager">Manager</option>
                                    <option value="HR">HR Professional</option>
                                    <option value="Admin">System Admin</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Salary</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">$</span>
                                    <input 
                                        disabled={isSubmitting} 
                                        type="number" 
                                        name="salary" 
                                        value={formData.salary} 
                                        onChange={handleChange} 
                                        placeholder="50000" 
                                        className="w-full h-10 pl-7 pr-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100 dark:focus:ring-blue-500 transition-colors" 
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <Input disabled={isSubmitting} label="Joining Date" type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors">
                                Optional: add a headshot now. It uploads right after the employee account is created.
                            </p>
                            <ProfilePhotoUploadStep
                                disabled={isSubmitting}
                                file={profilePhoto}
                                onFileChange={setProfilePhoto}
                            />
                        </div>
                    )}
                </div>

                {/* --- FOOTER --- */}
                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between transition-colors">
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