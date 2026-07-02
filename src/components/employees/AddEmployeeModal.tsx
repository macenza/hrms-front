'use client';
import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AddressForm } from '@/components/ui/AddressForm';
import { validatePhone } from '@/components/ui/PhoneNumberInput';
import ProfilePhotoUploadStep from '@/components/employees/ProfilePhotoUploadStep';
import { useAppSelector } from '@/store/hooks';
import { useCompanySettings } from '@/hooks/api/useSettings';
import { useActiveEmployees } from '@/hooks/api/useEmployees';
import { useShifts } from '@/hooks/api/useShifts';
import { z } from 'zod';
import { getEmptyAddressFormData } from '@/types/address';
import { validatePostalCode } from '@/utils/postalCodeValidation';
import type { AddressFormData } from '@/types/address';

export interface EmployeeFormData {
    firstName: string;
    lastName: string;
    email: string;
    addressData: AddressFormData;
    gender: 'Male' | 'Female' | 'Other';
    employeeId: string;
    department: string;
    role: string;
    employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Internship';
    salary: string;
    joiningDate: string;
    reportingManager: string;
    workLocation: string;
    shiftId: string;
    batchNo: string;
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

const getInitialFormState = (settings: any): EmployeeFormData => {
    const roles = settings?.roles || ['employee', 'manager', 'hr', 'admin'];
    const depts = settings?.departments || ['HR', 'Engineering', 'Marketing', 'Sales', 'Finance'];
    return {
        firstName: '',
        lastName: '',
        email: '',
        addressData: getEmptyAddressFormData(),
        gender: 'Male',
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        department: depts[0] || 'Engineering',
        role: roles[0] || 'employee',
        employmentType: 'Full-Time',
        salary: '',
        joiningDate: new Date().toISOString().split('T')[0],
        reportingManager: '',
        workLocation: '',
        shiftId: '',
        batchNo: '',
    };
};

const step1Schema = z.object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    gender: z.enum(['Male', 'Female', 'Other']),
});

const step2Schema = z.object({
    department: z.string().trim().min(1, 'Department is required'),
    role: z.string().trim().min(1, 'System role is required'),
    salary: z.string().trim().optional().refine((val) => {
        if (!val) return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0;
    }, { message: 'Salary must be a non-negative number' }),
    joiningDate: z.string().trim().min(1, 'Joining date is required'),
    employmentType: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Internship']),
    reportingManager: z.string().trim().optional(),
    workLocation: z.string().trim().optional(),
    shiftId: z.string().trim().optional(),
    batchNo: z.string().trim().optional(),
});

export default function AddEmployeeModal({ isOpen, onClose, onSubmit, isSubmitting = false }: AddEmployeeModalProps) {
    console.log("🔵 AddEmployeeModal render, isOpen =", isOpen);
    const { user } = useAppSelector((state) => state.auth);
    const { data: companySettings } = useCompanySettings();
    const { data: activeEmployees } = useActiveEmployees();
    const { data: shifts = [] } = useShifts();

    const dynamicRoles = companySettings?.roles || ['employee', 'manager', 'hr', 'admin'];
    const dynamicDepartments = companySettings?.departments || ['HR', 'Engineering', 'Marketing', 'Sales', 'Finance'];

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<EmployeeFormData>(() => getInitialFormState(companySettings));
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (companySettings) {
            setFormData(prev => ({
                ...prev,
                role: prev.role ? prev.role : (companySettings.roles?.[0] || 'employee'),
                department: prev.department ? prev.department : (companySettings.departments?.[0] || 'Engineering'),
            }));
        }
    }, [companySettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setError(''); // Clear errors when user types
        const { name, value } = e.target;
        if (name === 'salary') {
            const numVal = Number(value);
            if (numVal < 0 || isNaN(numVal)) return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setStep(1);
        setFormData(getInitialFormState(companySettings));
        setProfilePhoto(null);
        setError('');
        onClose();
    };

    const validateStep = () => {
        try {
            if (step === 1) {
                step1Schema.parse(formData);
                // Validate address fields
                const ad = formData.addressData;
                if (!ad.addressLine1?.trim()) {
                    setError('Address Line 1 is required');
                    return false;
                }
                if (!ad.countryCode) {
                    setError('Please select a country');
                    return false;
                }
                if (!ad.stateCode) {
                    setError('Please select a state / province');
                    return false;
                }
                if (!ad.city) {
                    setError('Please select a city');
                    return false;
                }
                if (!ad.postalCode?.trim()) {
                    setError('Postal / ZIP code is required');
                    return false;
                }
                const postalResult = validatePostalCode(ad.postalCode, ad.countryCode);
                if (!postalResult.valid) {
                    setError(postalResult.message);
                    return false;
                }
                if (!ad.phoneNumber) {
                    setError('Phone number is required');
                    return false;
                }
                if (!validatePhone(ad.phoneNumber)) {
                    setError('Please enter a valid phone number');
                    return false;
                }
                if (ad.alternatePhoneNumber && !validatePhone(ad.alternatePhoneNumber)) {
                    setError('Please enter a valid alternate phone number');
                    return false;
                }
            } else if (step === 2) {
                step2Schema.parse(formData);
            }
            setError('');
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                setError(err.issues[0]?.message || 'Validation error');
            } else {
                setError('Validation error occurred');
            }
            return false;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep()) return;

        if (step < 3) {
            setStep(prev => prev + 1);
            return;
        }

        const firstName = formData.firstName.trim();
        const capitalizedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const generatedPassword = `Hrms${capitalizedFirstName}@${randomNum}`;

        const ad = formData.addressData;
        const apiPayload = {
            name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
            email: formData.email,
            gender: formData.gender,
            password: generatedPassword,
            employeeId: formData.employeeId,
            role: formData.role.toLowerCase(),
            profile: {
                personal: {
                    phone: ad.phoneNumber || '',
                    phoneCountryCode: ad.phoneCountryCode || '',
                    alternatePhone: ad.alternatePhoneNumber || '',
                    address: {
                        addressLine1: ad.addressLine1?.trim() || '',
                        addressLine2: ad.addressLine2?.trim() || '',
                        country: ad.country || '',
                        countryCode: ad.countryCode || '',
                        state: ad.state || '',
                        stateCode: ad.stateCode || '',
                        city: ad.city || '',
                        district: ad.district?.trim() || '',
                        postalCode: ad.postalCode?.trim() || '',
                        landmark: ad.landmark?.trim() || '',
                    },
                },
                employment: {
                    department: formData.department,
                    joiningDate: formData.joiningDate,
                    employmentType: formData.employmentType,
                    batchNo: formData.batchNo.trim(),
                    ...(formData.reportingManager ? { reportingManager: formData.reportingManager } : {}),
                    ...(formData.workLocation ? { workLocation: formData.workLocation } : {}),
                    ...(formData.shiftId ? {
                        shiftId: formData.shiftId,
                        shiftName: shifts.find((s: any) => s._id === formData.shiftId)?.name || '',
                        shiftTiming: (() => {
                            const found = shifts.find((s: any) => s._id === formData.shiftId);
                            return found ? `${found.startTime} - ${found.endTime}` : '';
                        })()
                    } : {}),
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
                {/* Step indicator removed per design request — form still uses 3-step flow */}

                {/* --- FORM CONTENT --- */}
                <div className="flex-1 p-2 min-h-[250px]">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 transition-colors">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" disabled={isSubmitting} />
                                <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" disabled={isSubmitting} />
                                <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" disabled={isSubmitting} />
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Gender</label>
                                    <select
                                        disabled={isSubmitting}
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100 dark:focus:ring-blue-500 transition-colors"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Address & Contact — using the reusable AddressForm */}
                            <div className="border-t border-gray-100 dark:border-gray-800 pt-5 transition-colors">
                                <AddressForm
                                    value={formData.addressData}
                                    onChange={(data) => {
                                        setError('');
                                        setFormData(prev => ({ ...prev, addressData: data }));
                                    }}
                                    disabled={isSubmitting}
                                />
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
                                    {dynamicDepartments.map((dept: string) => (
                                        <option key={dept} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
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
                                    {dynamicRoles.map((r: string) => {
                                        const isTargetAdmin = r.toLowerCase() === 'admin';
                                        if (isTargetAdmin && user?.role?.toLowerCase() !== 'admin') {
                                            return null;
                                        }
                                        const formatRoleLabel = (roleStr: string) => {
                                            if (roleStr.toLowerCase() === 'hr') return 'HR Professional';
                                            if (roleStr.toLowerCase() === 'admin') return 'System Admin';
                                            return roleStr.charAt(0).toUpperCase() + roleStr.slice(1);
                                        };
                                        return (
                                            <option key={r} value={r.toLowerCase()}>
                                                {formatRoleLabel(r)}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Employment Type</label>
                                <select
                                    disabled={isSubmitting}
                                    name="employmentType"
                                    value={formData.employmentType}
                                    onChange={handleChange}
                                    className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100 dark:focus:ring-blue-500 transition-colors"
                                >
                                    <option value="Full-Time">Full-Time</option>
                                    <option value="Part-Time">Part-Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
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
                                        min="0"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        placeholder="50000"
                                        className="w-full h-10 pl-7 pr-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100 dark:focus:ring-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <Input disabled={isSubmitting} label="Joining Date" type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Reporting Manager</label>
                                <select
                                    disabled={isSubmitting}
                                    name="reportingManager"
                                    value={formData.reportingManager}
                                    onChange={handleChange}
                                    className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100 dark:focus:ring-blue-500 transition-colors"
                                >
                                    <option value="">No Manager Assigned</option>
                                    {activeEmployees?.map((emp: any) => (
                                        <option key={emp._id || emp.id} value={emp._id || emp.id}>
                                            {emp.name} ({emp.role?.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                disabled={isSubmitting}
                                label="Work Location"
                                name="workLocation"
                                value={formData.workLocation}
                                onChange={handleChange}
                                placeholder="e.g. Head Office, Remote"
                            />

                            <Input
                                disabled={isSubmitting}
                                label="Batch No."
                                name="batchNo"
                                value={formData.batchNo}
                                onChange={handleChange}
                                placeholder="e.g. 101, 102"
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">Shift Timing</label>
                                <select
                                    disabled={isSubmitting}
                                    name="shiftId"
                                    value={formData.shiftId}
                                    onChange={handleChange}
                                    className="h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm bg-white dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100 dark:focus:ring-blue-500 transition-colors"
                                >
                                    <option value="">No Shift Assigned</option>
                                    {shifts?.map((shift: any) => (
                                        <option key={shift._id} value={shift._id}>
                                            {shift.name} ({shift.startTime} - {shift.endTime})
                                        </option>
                                    ))}
                                </select>
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