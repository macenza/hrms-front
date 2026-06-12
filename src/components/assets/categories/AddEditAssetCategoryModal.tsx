'use client';

import React, { useState, useEffect } from 'react';
import { Tag, AlignLeft, Loader2, CheckSquare } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AssetCategory } from '@/hooks/api/useAssetCategories';

interface AddEditAssetCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: { name: string; description?: string; isActive?: boolean }) => Promise<void>;
    isSubmitting?: boolean;
    editCategory?: AssetCategory | null;
}

export default function AddEditAssetCategoryModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting = false,
    editCategory = null
}: AddEditAssetCategoryModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editCategory) {
                setName(editCategory.name);
                setDescription(editCategory.description || '');
                setIsActive(editCategory.isActive);
            } else {
                setName('');
                setDescription('');
                setIsActive(true);
            }
            setValidationError('');
        }
    }, [isOpen, editCategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        const cleanName = name.trim();
        if (!cleanName) {
            setValidationError('Category name is required.');
            return;
        }

        if (cleanName.length > 100) {
            setValidationError('Category name cannot exceed 100 characters.');
            return;
        }

        if (description.length > 500) {
            setValidationError('Description cannot exceed 500 characters.');
            return;
        }

        try {
            await onSubmit({
                name: cleanName,
                description: description.trim(),
                isActive
            });
        } catch (error: any) {
            console.error('Category form submission failed:', error);
            const apiMessage = error.response?.data?.message || 'Failed to save asset category.';
            setValidationError(apiMessage);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={editCategory ? "Edit Asset Category" : "Add Asset Category"} 
            className="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 space-y-5 p-2">
                    
                    {/* Validation Error Message Alert */}
                    {validationError && (
                        <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50 font-medium animate-in fade-in slide-in-from-top-1">
                            {validationError}
                        </div>
                    )}

                    {/* Category Name */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <Tag size={16} className="text-gray-400 dark:text-gray-500" /> 
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={100}
                            disabled={isSubmitting}
                            placeholder="e.g., Laptops, Tablets, Office Chairs..."
                            className="text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <AlignLeft size={16} className="text-gray-400 dark:text-gray-500" /> 
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            disabled={isSubmitting}
                            placeholder="Description of the category assets, guidelines..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500/40 focus:border-transparent min-h-[100px] resize-y bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-500 dark:disabled:text-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all"
                        />
                        <div className="text-right text-xs text-gray-400 dark:text-gray-500">
                            {description.length} / 500 characters
                        </div>
                    </div>

                    {/* Is Active Status (Only shown on Edit to toggle status) */}
                    {editCategory && (
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                disabled={isSubmitting}
                                className="h-4 w-4 rounded border-gray-300 dark:border-gray-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                                Active Status
                            </label>
                        </div>
                    )}
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
                        disabled={isSubmitting || !name.trim()}
                        className="min-w-[140px] gap-2 font-semibold shadow-sm shadow-blue-500/25 dark:shadow-none"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                        {isSubmitting ? 'Saving...' : editCategory ? 'Save Changes' : 'Create Category'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
