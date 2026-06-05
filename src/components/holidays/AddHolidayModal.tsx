'use client';

import React, { useState, useEffect } from 'react';
import { X, CalendarPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCreateHoliday, useUpdateHoliday } from '@/hooks/api/useHolidays';
import type { Holiday } from '@/services/holidayService';

interface AddHolidayModalProps {
    isOpen: boolean;
    onClose: () => void;
    editHoliday?: Holiday | null;
}

const HOLIDAY_TYPES = ['National', 'Regional', 'Optional', 'Company', 'Religious'];
const COUNTRIES = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
];

export default function AddHolidayModal({ isOpen, onClose, editHoliday }: AddHolidayModalProps) {
    const isEditMode = !!editHoliday;

    const createHoliday = useCreateHoliday();
    const updateHoliday = useUpdateHoliday();

    const [formData, setFormData] = useState({
        name: '',
        date: '',
        country: 'IN',
        state: '',
        type: 'National',
        description: '',
        status: 'Active'
    });

    // Populate form when editing
    useEffect(() => {
        if (editHoliday) {
            const date = editHoliday.date ? new Date(editHoliday.date).toISOString().split('T')[0] : '';
            setFormData({
                name: editHoliday.name || '',
                date,
                country: editHoliday.country || 'IN',
                state: editHoliday.state || '',
                type: editHoliday.type || 'National',
                description: editHoliday.description || '',
                status: editHoliday.status || 'Active'
            });
        } else {
            setFormData({ name: '', date: '', country: 'IN', state: '', type: 'National', description: '', status: 'Active' });
        }
    }, [editHoliday, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            state: formData.state || undefined,
        } as Partial<Holiday>;

        try {
            if (isEditMode && editHoliday) {
                await updateHoliday.mutateAsync({ id: editHoliday._id, data: payload });
            } else {
                await createHoliday.mutateAsync(payload);
            }
            onClose();
        } catch {
            // Error toast handled by mutation hook
        }
    };

    const isSubmitting = createHoliday.isPending || updateHoliday.isPending;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <CalendarPlus className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                            {isEditMode ? 'Edit Holiday' : 'Add Holiday'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Holiday Name *</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Republic Day"
                            className="w-full h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 placeholder:text-gray-400 transition-all"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Date *</label>
                        <input
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Country + State Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Country *</label>
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer transition-all"
                            >
                                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">State / Region</label>
                            <input
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="Optional"
                                className="w-full h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 outline-none focus:ring-2 focus:ring-blue-600/20 placeholder:text-gray-400 transition-all"
                            />
                        </div>
                    </div>

                    {/* Type + Status Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer transition-all"
                            >
                                {HOLIDAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full h-10 px-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer transition-all"
                            >
                                <option value="Active">Active</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Brief description of the holiday..."
                            maxLength={500}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 outline-none focus:ring-2 focus:ring-blue-600/20 placeholder:text-gray-400 resize-none transition-all"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                    <Button type="button" variant="ghost" onClick={onClose} className="font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="gap-2 font-bold shadow-sm shadow-blue-500/25 dark:shadow-none"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                        {isEditMode ? 'Save Changes' : 'Create Holiday'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
