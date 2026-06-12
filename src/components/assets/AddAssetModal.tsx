// src/components/assets/AddAssetModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Laptop, AlignLeft, Loader2, Hash } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAssetCategoryData } from '@/hooks/api/useAssetCategories';

export interface AddAssetPayload {
    assetTag: string;
    serialNumber: string;
    name: string;
    category: string;
    notes: string;
}

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: AddAssetPayload) => Promise<void>;
    isSubmitting?: boolean; // Synced with React Query from parent
}

const initialFormState: AddAssetPayload = {
    assetTag: '',
    serialNumber: '',
    name: '',
    category: '',
    notes: ''
};

export default function AddAssetModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    isSubmitting = false 
}: AddAssetModalProps) {
    
    const [formData, setFormData] = useState<AddAssetPayload>(initialFormState);

    // Fetch active categories
    const { data: categoryData, isLoading: isCategoriesLoading } = useAssetCategoryData(1, 100, '', true);
    const categoriesList = categoryData?.records || [];

    // Fallback categories for backward compatibility and empty states
    const categories = categoriesList.length > 0
        ? categoriesList.map(c => c.name)
        : ['Laptop', 'Monitor', 'Mobile', 'Peripheral', 'Furniture', 'Software', 'Other', 'Accessories'];

    // Reset form to blank state whenever the modal is opened
    useEffect(() => {
        if (isOpen) {
            setFormData(initialFormState);
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
            // Modal closing is handled by the parent component upon successful mutation
        } catch (error) {
            console.error('Submission failed:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Asset" className="max-w-lg">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 space-y-5 p-2">
                    
                    {/* Asset Tag */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <Tag size={16} className="text-gray-400 dark:text-gray-500" /> 
                            Asset Tag / Serial Number
                        </label>
                        <Input
                            type="text"
                            name="assetTag"
                            value={formData.assetTag}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                            placeholder="e.g., AST-1055 or S/N..."
                            className="uppercase text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* SERIAL NUMBER */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <Hash size={16} className="text-gray-400 dark:text-gray-500" /> 
                            Serial Number
                        </label>
                        <Input
                            type="text"
                            name="serialNumber"
                            value={formData.serialNumber}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                            placeholder="e.g., 5CG1234567"
                            className="uppercase text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* Device Name */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <Laptop size={16} className="text-gray-400 dark:text-gray-500" /> 
                            Device Name
                        </label>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                            placeholder="e.g., MacBook Pro 16 M3"
                            className="text-gray-900 dark:text-gray-100"
                        />
                    </div>
                    
                    {/* Category */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            Category
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting || isCategoriesLoading}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent text-sm bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-600 transition-all cursor-pointer"
                        >
                            <option value="" disabled>Select category...</option>
                            {isCategoriesLoading ? (
                                <option disabled>Loading categories...</option>
                            ) : (
                                categories.map((catName) => (
                                    <option key={catName} value={catName}>
                                        {catName}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    
                    {/* Initial Notes */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <AlignLeft size={16} className="text-gray-400 dark:text-gray-500" /> 
                            Initial Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="Condition, purchase date, warranty info..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent min-h-[100px] resize-y bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all"
                        />
                    </div>
                </div>
                
                {/* Footer Actions */}
                <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 px-2 pb-2 shrink-0 transition-colors">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={onClose} 
                        disabled={isSubmitting}
                        className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary"
                        disabled={isSubmitting || !formData.assetTag || !formData.name || !formData.category}
                        className="min-w-[140px] gap-2 font-semibold shadow-sm shadow-blue-500/25 dark:shadow-none"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                        {isSubmitting ? 'Saving...' : 'Add Asset'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}