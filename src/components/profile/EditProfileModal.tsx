'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, User, Phone, MapPin, Briefcase, Calendar, Tag, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { toast } from 'sonner';
import { employeeService } from '@/services/employeeService';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employee: any;
    isAdminOrHR: boolean;
}

export default function EditProfileModal({
    isOpen,
    onClose,
    onSuccess,
    employee,
    isAdminOrHR
}: EditProfileModalProps) {
    const [isSaving, setIsSaving] = useState(false);

    // Deep destructure raw values
    const personal = employee?.profile?.personal || {};
    const employment = employee?.profile?.employment || {};

    // Initial state
    const [form, setForm] = useState({
        name: '',
        role: 'employee',
        isActive: true,
        phone: '',
        address: '',
        fathersName: '',
        dob: '',
        department: '',
        designation: '',
        employmentType: 'Full-Time',
        joiningDate: '',
        workLocation: ''
    });

    useEffect(() => {
        if (employee) {
            setForm({
                name: employee.name || '',
                role: employee.role || 'employee',
                isActive: employee.isActive ?? true,
                phone: personal.phone || '',
                address: personal.address || '',
                fathersName: personal.fathersName || '',
                dob: personal.dob ? new Date(personal.dob).toISOString().split('T')[0] : '',
                department: employment.department || '',
                designation: employee.role || employment.designation || '',
                employmentType: employment.employmentType || 'Full-Time',
                joiningDate: employment.joiningDate ? new Date(employment.joiningDate).toISOString().split('T')[0] : '',
                workLocation: employment.workLocation || ''
            });
        }
    }, [employee]);

    if (!isOpen || !employee) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Reconstruct the deep schema structure for saving
            const updatePayload: any = {
                name: form.name,
                profile: {
                    personal: {
                        phone: form.phone,
                        address: form.address,
                        fathersName: form.fathersName,
                        dob: form.dob || undefined
                    },
                    employment: {
                        department: form.department,
                        designation: form.designation,
                        employmentType: form.employmentType,
                        joiningDate: form.joiningDate || undefined,
                        workLocation: form.workLocation
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
                                        <option value="employee">Employee</option>
                                        <option value="manager">Manager</option>
                                        <option value="hr">HR</option>
                                        <option value="admin">Admin</option>
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
                            <Input
                                label="Phone Number"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                            
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
                                label="Department"
                                value={form.department}
                                onChange={(e) => setForm({ ...form, department: e.target.value })}
                                disabled={!isAdminOrHR}
                            />
                            
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

                            <div className="md:col-span-2">
                                <Input
                                    label="Work Location"
                                    value={form.workLocation}
                                    onChange={(e) => setForm({ ...form, workLocation: e.target.value })}
                                    disabled={!isAdminOrHR}
                                />
                            </div>
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
