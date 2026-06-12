'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Palette, Layers, Loader2, Info } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AssetStatus } from '@/hooks/api/useAssetStatuses';

interface AddEditAssetStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: { name: string; color?: string; sequence?: number; isDefault?: boolean; isActive?: boolean }) => Promise<void>;
    isSubmitting?: boolean;
    editStatus?: AssetStatus | null;
}

const PRESET_COLORS = [
    { value: '#10b981', label: 'Emerald Green' },
    { value: '#3b82f6', label: 'Blue' },
    { value: '#f97316', label: 'Orange' },
    { value: '#ef4444', label: 'Red' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#64748b', label: 'Slate Gray' },
    { value: '#eab308', label: 'Yellow' },
    { value: '#ec4899', label: 'Pink' }
];

export default function AddEditAssetStatusModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting = false,
    editStatus = null
}: AddEditAssetStatusModalProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [sequence, setSequence] = useState<number>(0);
    const [isDefault, setIsDefault] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editStatus) {
                setName(editStatus.name);
                setColor(editStatus.color || '#3b82f6');
                setSequence(editStatus.sequence || 0);
                setIsDefault(editStatus.isDefault || false);
                setIsActive(editStatus.isActive);
            } else {
                setName('');
                setColor('#3b82f6');
                setSequence(0);
                setIsDefault(false);
                setIsActive(true);
            }
            setValidationError('');
        }
    }, [isOpen, editStatus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        const cleanName = name.trim();
        if (!cleanName) {
            setValidationError('Status name is required.');
            return;
        }

        if (cleanName.length > 100) {
            setValidationError('Status name cannot exceed 100 characters.');
            return;
        }

        try {
            await onSubmit({
                name: cleanName,
                color,
                sequence: Number(sequence),
                isDefault,
                isActive
            });
        } catch (error: any) {
            console.error('Status form submission failed:', error);
            const apiMessage = error.response?.data?.message || 'Failed to save asset status.';
            setValidationError(apiMessage);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={editStatus ? "Edit Asset Status" : "Add Asset Status"} 
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

                    {/* Status Name */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <Tag size={16} className="text-gray-400 dark:text-gray-500" /> 
                            Status Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            maxLength={100}
                            disabled={isSubmitting}
                            placeholder="e.g., Available, In Maintenance, Retired..."
                            className="text-gray-900 dark:text-gray-100"
                        />
                    </div>

                    {/* Status Color */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <Palette size={16} className="text-gray-400 dark:text-gray-500" /> 
                            Theme Color
                        </label>
                        
                        {/* Curated Color Presets */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {PRESET_COLORS.map((preset) => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => setColor(preset.value)}
                                    disabled={isSubmitting}
                                    className="w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center relative cursor-pointer"
                                    style={{ 
                                        backgroundColor: preset.value,
                                        borderColor: color === preset.value ? '#1e293b' : 'transparent',
                                        boxShadow: color === preset.value ? '0 0 0 2px rgba(59, 130, 246, 0.4)' : 'none'
                                    }}
                                    title={preset.label}
                                >
                                    {color === preset.value && (
                                        <span className="w-2 h-2 rounded-full bg-white"></span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Custom Color Selector */}
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                disabled={isSubmitting}
                                className="w-10 h-10 p-0 border border-gray-300 dark:border-gray-800 rounded-md cursor-pointer bg-transparent"
                            />
                            <Input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="#hexcode"
                                maxLength={7}
                                className="w-32 font-mono text-gray-900 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    {/* Sequence */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                            <Layers size={16} className="text-gray-400 dark:text-gray-500" /> 
                            Sort Order / Sequence
                        </label>
                        <Input
                            type="number"
                            value={sequence}
                            onChange={(e) => setSequence(Number(e.target.value))}
                            required
                            min={0}
                            disabled={isSubmitting}
                            placeholder="e.g., 0, 10, 20"
                            className="text-gray-900 dark:text-gray-100"
                        />
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Lower numbers display first in dropdowns and dashboards.
                        </p>
                    </div>

                    {/* Default Status Flag */}
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20">
                        <input
                            type="checkbox"
                            id="isDefault"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            disabled={isSubmitting}
                            className="mt-1 h-4 w-4 rounded border-gray-300 dark:border-gray-800 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex flex-col gap-0.5">
                            <label htmlFor="isDefault" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                                Set as Default Status
                            </label>
                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                <Info size={12} className="shrink-0" />
                                Automatically marks new assets with this status. Only one default allowed.
                            </span>
                        </div>
                    </div>

                    {/* Active Status */}
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
                        {isSubmitting ? 'Saving...' : editStatus ? 'Save Changes' : 'Create Status'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
