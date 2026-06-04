'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, User, Phone, MapPin, Briefcase, Calendar, Tag, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { toast } from 'sonner';
import { employeeService } from '@/services/employeeService';
import { useCompanySettings } from '@/hooks/api/useSettings';
import { useActiveEmployees } from '@/hooks/api/useEmployees';
import { useShifts } from '@/hooks/api/useShifts';
import { z } from 'zod';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employee: any;
    isAdminOrHR: boolean;
}

const parsePhoneNumber = (phoneStr: string) => {
    if (!phoneStr) return { countryCode: '+91', rawPhone: '' };
    const parts = phoneStr.trim().split(/\s+/);
    if (parts.length > 1 && parts[0].startsWith('+')) {
        return { countryCode: parts[0], rawPhone: parts.slice(1).join(' ') };
    }
    return { countryCode: '+91', rawPhone: phoneStr };
};

const profileEditSchema = z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    phone: z.string().trim().optional().or(z.literal('')),
    address: z.string().trim().optional(),
    fathersName: z.string().trim().optional(),
    dob: z.string().trim().optional().or(z.literal('')),
    department: z.string().trim().optional(),
    designation: z.string().trim().optional(),
    employmentType: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Internship']),
    joiningDate: z.string().trim().optional().or(z.literal('')),
    workLocation: z.string().trim().optional(),
    reportingManager: z.string().trim().optional().or(z.literal('')),
    shiftId: z.string().trim().optional().or(z.literal('')),
    batchNo: z.string().trim().optional(),
});

export default function EditProfileModal({
    isOpen,
    onClose,
    onSuccess,
    employee,
    isAdminOrHR
}: EditProfileModalProps) {
    const [isSaving, setIsSaving] = useState(false);
    const { data: companySettings } = useCompanySettings();
    const { data: activeEmployees } = useActiveEmployees();
    const { data: shifts = [] } = useShifts();

    const dynamicRoles = companySettings?.roles || ['employee', 'manager', 'hr', 'admin'];
    const dynamicDepartments = companySettings?.departments || ['HR', 'Engineering', 'Marketing', 'Sales', 'Finance'];

    // Deep destructure raw values
    const personal = employee?.profile?.personal || {};
    const employment = employee?.profile?.employment || {};

    // Initial state
    const [form, setForm] = useState({
        name: '',
        role: 'employee',
        isActive: true,
        countryCode: '+91',
        phone: '',
        address: '',
        fathersName: '',
        dob: '',
        department: '',
        designation: '',
        employmentType: 'Full-Time',
        joiningDate: '',
        workLocation: '',
        reportingManager: '',
        shiftId: '',
        batchNo: ''
    });

    useEffect(() => {
        if (employee) {
            const { countryCode, rawPhone } = parsePhoneNumber(personal.phone);
            
            let managerId = '';
            if (employment.reportingManager) {
                managerId = typeof employment.reportingManager === 'object'
                    ? (employment.reportingManager._id || employment.reportingManager.id || '')
                    : employment.reportingManager;
            }

            setForm({
                name: employee.name || '',
                role: employee.role || 'employee',
                isActive: employee.isActive ?? true,
                countryCode,
                phone: rawPhone,
                address: personal.address || '',
                fathersName: personal.fathersName || '',
                dob: personal.dob ? new Date(personal.dob).toISOString().split('T')[0] : '',
                department: employment.department || '',
                designation: employee.role || employment.designation || '',
                employmentType: employment.employmentType || 'Full-Time',
                joiningDate: employment.joiningDate ? new Date(employment.joiningDate).toISOString().split('T')[0] : '',
                workLocation: employment.workLocation || '',
                reportingManager: managerId,
                shiftId: employment.shiftId || '',
                batchNo: employment.batchNo || ''
            });
        }
    }, [employee]);

    if (!isOpen || !employee) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            profileEditSchema.parse(form);
        } catch (err) {
            if (err instanceof z.ZodError) {
                toast.error(err.issues[0]?.message || 'Validation error');
            } else {
                toast.error('Validation error');
            }
            return;
        }

        setIsSaving(true);

        try {
            // Reconstruct the deep schema structure for saving
            const updatePayload: any = {
                name: form.name,
                profile: {
                    personal: {
                        phone: form.phone ? `${form.countryCode} ${form.phone.trim()}` : '',
                        address: form.address,
                        fathersName: form.fathersName,
                        dob: form.dob || undefined
                    },
                    employment: {
                        department: form.department,
                        designation: form.designation,
                        employmentType: form.employmentType,
                        joiningDate: form.joiningDate || undefined,
                        workLocation: form.workLocation,
                        reportingManager: form.reportingManager || null,
                        batchNo: form.batchNo,
                        ...(form.shiftId ? {
                            shiftId: form.shiftId,
                            shiftName: shifts.find((s: any) => s._id === form.shiftId)?.name || '',
                            shiftTiming: (() => {
                                const found = shifts.find((s: any) => s._id === form.shiftId);
                                return found ? `${found.startTime} - ${found.endTime}` : '';
                            })()
                        } : {
                            shiftId: null,
                            shiftName: '',
                            shiftTiming: ''
                        })
                    }
                }
            };

            // Only Admin/HR can modify role and active status
            if (isAdminOrHR) {
                updatePayload.role = form.role;
                updatePayload.isActive = form.isActive;
            }

            await employeeService.update(employee._id || employee.id, updatePayload);
            toast.success("Profile details updated successfully!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to update profile details.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div 
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-300 transform scale-100 flex flex-col"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Profile Details</h2>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* Section 1: Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b pb-1">
                            Basic Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                disabled={!isAdminOrHR}
                            />
                            
                            {isAdminOrHR ? (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">System Role</label>
                                    <select
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        className="w-full h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all cursor-pointer"
                                    >
                                        {dynamicRoles.map((r: string) => {
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
                            ) : (
                                <Input
                                    label="System Role"
                                    value={form.role.toUpperCase()}
                                    disabled
                                />
                            )}

                            {isAdminOrHR && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Employment Status</label>
                                    <select
                                        value={form.isActive ? "true" : "false"}
                                        onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                                        className="w-full h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            )}

                            <Input
                                label="Father's Name"
                                value={form.fathersName}
                                onChange={(e) => setForm({ ...form, fathersName: e.target.value })}
                            />
                            
                            <Input
                                label="Date of Birth"
                                type="date"
                                value={form.dob}
                                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                disabled={!isAdminOrHR}
                            />
                        </div>
                    </div>

                    {/* Section 2: Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b pb-1">
                            Contact Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Phone Number</label>
                                <div className="flex gap-2">
                                    <select
                                        value={form.countryCode}
                                        onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                                        className="w-24 h-10 px-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="+91">+91 (IN)</option>
                                        <option value="+1">+1 (US)</option>
                                        <option value="+44">+44 (UK)</option>
                                        <option value="+61">+61 (AU)</option>
                                        <option value="+81">+81 (JP)</option>
                                        <option value="+49">+49 (DE)</option>
                                        <option value="+33">+33 (FR)</option>
                                        <option value="+971">+971 (AE)</option>
                                    </select>
                                    <div className="flex-1">
                                        <Input 
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            placeholder="12345 67890" 
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="md:col-span-2">
                                <Input
                                    label="Current Address"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Employment Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b pb-1">
                            Employment Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Employee ID"
                                value={employee.employeeId || 'N/A'}
                                disabled
                                className="bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-800 cursor-not-allowed"
                            />

                            {isAdminOrHR ? (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Department</label>
                                    <select
                                        value={form.department}
                                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                                        className="w-full h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all cursor-pointer"
                                    >
                                        {dynamicDepartments.map((dept: string) => (
                                            <option key={dept} value={dept}>
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <Input
                                    label="Department"
                                    value={form.department}
                                    disabled
                                />
                            )}
                            
                            <Input
                                label="Designation"
                                value={form.designation}
                                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                                disabled={!isAdminOrHR}
                            />

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Employment Type</label>
                                <select
                                    value={form.employmentType}
                                    onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                                    disabled={!isAdminOrHR}
                                    className="w-full h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <option value="Full-Time">Full-Time</option>
                                    <option value="Part-Time">Part-Time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>

                            <Input
                                label="Date of Joining"
                                type="date"
                                value={form.joiningDate}
                                onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                                disabled={!isAdminOrHR}
                            />

                            {isAdminOrHR && (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reporting Manager</label>
                                    <select
                                        value={form.reportingManager}
                                        onChange={(e) => setForm({ ...form, reportingManager: e.target.value })}
                                        className="w-full h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="">No Manager (None)</option>
                                        {activeEmployees
                                            ?.filter((emp: any) => emp.id !== employee.id && emp._id !== employee.id && emp.id !== employee._id && emp._id !== employee._id)
                                            ?.map((emp: any) => (
                                                <option key={emp.id} value={emp.id}>
                                                    {emp.name} ({emp.role.toUpperCase()})
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}

                            <Input
                                label="Work Location"
                                value={form.workLocation}
                                onChange={(e) => setForm({ ...form, workLocation: e.target.value })}
                                disabled={!isAdminOrHR}
                            />

                            <Input
                                label="Batch No."
                                value={form.batchNo}
                                onChange={(e) => setForm({ ...form, batchNo: e.target.value })}
                                disabled={!isAdminOrHR}
                                placeholder="e.g. 101, 102"
                            />

                            {isAdminOrHR ? (
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Shift Timing</label>
                                    <select
                                        value={form.shiftId}
                                        onChange={(e) => setForm({ ...form, shiftId: e.target.value })}
                                        className="w-full h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all cursor-pointer"
                                    >
                                        <option value="">No Shift Assigned</option>
                                        {shifts?.map((shift: any) => (
                                            <option key={shift._id} value={shift._id}>
                                                {shift.name} ({shift.startTime} - {shift.endTime})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="md:col-span-2">
                                    <Input
                                        label="Shift Timing"
                                        value={employee?.profile?.employment?.shiftName ? `${employee.profile.employment.shiftName} (${employee.profile.employment.shiftTiming})` : 'No Shift Assigned'}
                                        disabled
                                        className="bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-800 cursor-not-allowed"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isSaving}
                            className="gap-2 font-bold shadow-sm shadow-blue-500/25 dark:shadow-none"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Details
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
}
