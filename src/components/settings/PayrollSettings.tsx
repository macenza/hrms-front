import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Settings } from 'lucide-react';

interface ComponentItem {
    name: string;
    defaultAmount: number;
    isTaxable?: boolean;
}

interface PayrollSettingsProps {
    initialData: any;
    onSave: (data: any) => Promise<void>;
}

export default function PayrollSettings({ initialData, onSave }: PayrollSettingsProps) {
    const [allowances, setAllowances] = useState<ComponentItem[]>([]);
    const [deductions, setDeductions] = useState<ComponentItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData?.payroll) {
            setAllowances(initialData.payroll.customAllowances || []);
            setDeductions(initialData.payroll.customDeductions || []);
        }
    }, [initialData]);

    const handleAddAllowance = () => {
        setAllowances([...allowances, { name: '', defaultAmount: 0, isTaxable: true }]);
    };

    const handleAddDeduction = () => {
        setDeductions([...deductions, { name: '', defaultAmount: 0 }]);
    };

    const handleRemoveAllowance = (index: number) => {
        setAllowances(allowances.filter((_, i) => i !== index));
    };

    const handleRemoveDeduction = (index: number) => {
        setDeductions(deductions.filter((_, i) => i !== index));
    };

    const handleUpdateAllowance = (index: number, field: string, value: any) => {
        const newAllowances = [...allowances];
        newAllowances[index] = { ...newAllowances[index], [field]: value };
        setAllowances(newAllowances);
    };

    const handleUpdateDeduction = (index: number, field: string, value: any) => {
        const newDeductions = [...deductions];
        newDeductions[index] = { ...newDeductions[index], [field]: value };
        setDeductions(newDeductions);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Reconstruct payroll object
            const payload = {
                ...initialData,
                payroll: {
                    ...initialData.payroll,
                    customAllowances: allowances.filter(a => a.name.trim() !== ''),
                    customDeductions: deductions.filter(d => d.name.trim() !== '')
                }
            };
            await onSave(payload);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Global Payroll Components
                </h2>
                <p className="text-sm text-gray-500 mt-1">Define the custom allowances and deductions available for assignment to employees.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Allowances Section */}
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Custom Allowances</h3>
                        <Button variant="outline" size="sm" onClick={handleAddAllowance} className="h-8 gap-1">
                            <Plus size={14} /> Add
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {allowances.length === 0 ? (
                            <p className="text-sm text-gray-500 italic text-center py-4">No custom allowances defined.</p>
                        ) : (
                            allowances.map((allowance, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <input 
                                        type="text" 
                                        placeholder="Allowance Name" 
                                        value={allowance.name}
                                        onChange={(e) => handleUpdateAllowance(idx, 'name', e.target.value)}
                                        className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                    />
                                    <button 
                                        onClick={() => handleRemoveAllowance(idx)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Deductions Section */}
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Custom Deductions</h3>
                        <Button variant="outline" size="sm" onClick={handleAddDeduction} className="h-8 gap-1">
                            <Plus size={14} /> Add
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {deductions.length === 0 ? (
                            <p className="text-sm text-gray-500 italic text-center py-4">No custom deductions defined.</p>
                        ) : (
                            deductions.map((deduction, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <input 
                                        type="text" 
                                        placeholder="Deduction Name" 
                                        value={deduction.name}
                                        onChange={(e) => handleUpdateDeduction(idx, 'name', e.target.value)}
                                        className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                                    />
                                    <button 
                                        onClick={() => handleRemoveDeduction(idx)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button onClick={handleSave} disabled={isSaving} className="min-w-[120px]">
                    {isSaving ? 'Saving...' : 'Save Payroll Config'}
                </Button>
            </div>
        </div>
    );
}
