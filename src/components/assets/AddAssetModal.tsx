'use client';

import React, { useState } from 'react';
import { Tag, Laptop, AlignLeft, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface AddAssetPayload {
    assetTag: string;
    name: string;
    category: string;
    notes: string;
}

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: AddAssetPayload) => Promise<void>;
}

const initialFormState: AddAssetPayload = {
    assetTag: '',
    name: '',
    category: '',
    notes: ''
};

export default function AddAssetModal({ isOpen, onClose, onSubmit }: AddAssetModalProps) {
    const [formData, setFormData] = useState<AddAssetPayload>(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setFormData(initialFormState);
        setIsSubmitting(false);
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            handleClose();
        } catch (error) {
            console.error('Submission failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Asset" className="max-w-lg">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="flex-1 space-y-5 p-2">
                    
                    {/* Asset Tag */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Tag size={16} className="text-gray-400" /> Asset Tag / Serial Number
                        </label>
                        <Input
                            type="text"
                            name="assetTag"
                            value={formData.assetTag}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                            placeholder="e.g., AST-1055 or S/N..."
                            className="uppercase"
                        />
                    </div>

                    {/* Asset Name */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Laptop size={16} className="text-gray-400" /> Device Name
                        </label>
                        <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                            placeholder="e.g., MacBook Pro 16 M3"
                        />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-700">Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white disabled:bg-gray-50"
                        >
                            <option value="" disabled>Select category...</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Monitor">Monitor</option>
                            <option value="Mobile">Mobile Device</option>
                            <option value="Accessories">Accessories & Peripherals</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <AlignLeft size={16} className="text-gray-400" /> Initial Notes
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            placeholder="Condition, purchase date, warranty info..."
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent min-h-[100px] resize-y bg-white disabled:bg-gray-50"
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3 px-2 pb-2 shrink-0">
                    <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="primary"
                        disabled={isSubmitting || !formData.assetTag || !formData.name || !formData.category}
                        className="min-w-[140px] gap-2"
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                        {isSubmitting ? 'Saving...' : 'Add Asset'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}