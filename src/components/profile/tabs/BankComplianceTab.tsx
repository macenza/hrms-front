'use client';

import React, { useState } from 'react';
import { Landmark, Hash, CreditCard, Building2, ShieldCheck, Eye, EyeOff, FileText, Edit2, Plus, Loader2, Calculator, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input'; 
import { employeeService } from '@/services/employeeService';
import { useCompanySettings } from '@/hooks/api/useSettings';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export type VerificationStatus = 'Verified' | 'Pending' | 'Rejected';

export interface BankDetails {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
    status: VerificationStatus;
}

export interface StatutoryDetails {
    panNumber: string;
    esicNumber: string;
    pfNumber?: string;
}

export interface SalaryComponent {
    name: string;
    amount: number;
}

export interface SalaryData {
    monthlyCTC?: number;
    basicSalary: number;
    activeAllowances: SalaryComponent[];
    activeDeductions: SalaryComponent[];
}

interface BankComplianceTabProps {
    employeeId: string;
    currentUserRole: string; 
    bankData?: BankDetails | null;
    statutoryData?: StatutoryDetails | null;
    salaryData?: SalaryData | null;
    onRefresh: () => void; 
}

const getStatusBadgeVariant = (status: VerificationStatus) => {
    switch (status) {
        case 'Verified': return 'success';
        case 'Pending': return 'warning';
        case 'Rejected': return 'error';
        default: return 'default';
    }
};

const maskNumber = (num: string, visibleDigits: number = 4) => {
    if (!num || num.length <= visibleDigits) return num;
    const maskedLength = num.length - visibleDigits;
    const maskedSection = '•'.repeat(maskedLength).replace(/(.{4})/g, '$1 ').trim();
    const visibleSection = num.slice(-visibleDigits);
    return `${maskedSection} ${visibleSection}`;
};

const DetailItem = ({ label, value, icon: Icon, isSensitive = false, showSensitive = false }: any) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors w-full overflow-hidden">
        <div className="p-2 bg-gray-100/80 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 rounded-md shrink-0 transition-colors">
            <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5 transition-colors">{label}</p>
            <div className="min-w-0 overflow-x-auto scrollbar-thin">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono tracking-tight transition-colors whitespace-nowrap">
                     {value ? (
                        isSensitive && !showSensitive ? maskNumber(value) : value
                    ) : (
                        <span className="text-gray-400 dark:text-gray-500 font-sans italic font-normal">Not provided</span>
                    )}
                </p>
            </div>
        </div>
    </div>
);

export default function BankComplianceTab({
    employeeId,
    currentUserRole,
    bankData,
    statutoryData,
    salaryData,
    onRefresh
}: BankComplianceTabProps) {
    const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
    
    const [isEditingBank, setIsEditingBank] = useState(false);
    const [isEditingStat, setIsEditingStat] = useState(false);
    const [isEditingSalary, setIsEditingSalary] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [bankForm, setBankForm] = useState<Partial<BankDetails>>(bankData || {});
    const [statForm, setStatForm] = useState<Partial<StatutoryDetails>>(statutoryData || {});
    const [salaryForm, setSalaryForm] = useState<Partial<SalaryData>>(salaryData || { monthlyCTC: 0, basicSalary: 0, activeAllowances: [], activeDeductions: [] });
    
    const { data: companySettings } = useCompanySettings();

    React.useEffect(() => {
        if (bankData) setBankForm(bankData);
    }, [bankData]);

    React.useEffect(() => {
        if (statutoryData) setStatForm(statutoryData);
    }, [statutoryData]);

    React.useEffect(() => {
        if (salaryData) setSalaryForm(salaryData);
    }, [salaryData]);

    const canEdit = currentUserRole?.toLowerCase() === 'admin' || currentUserRole?.toLowerCase() === 'hr';

    // Calculate Monthly CTC dynamically: basic + allowances + pf + esic
    const basic = Number(salaryForm.basicSalary) || 0;
    const allowancesSum = (salaryForm.activeAllowances || [])
        .filter((a) => (a.name && a.name.trim() !== "") || a.amount !== 0)
        .reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
    const gross = basic + allowancesSum;

    const getDeductionAmountLocal = (list: any[], keys: string[]) => {
        const found = (list || []).find(d => {
            const name = (d.name || '').toLowerCase().trim();
            return keys.some(key => name === key || name.includes(key));
        });
        return found ? (Number(found.amount) || 0) : 0;
    };

    const pf = getDeductionAmountLocal(salaryForm.activeDeductions || [], ['pf', 'epf', 'provident fund']);
    const esic = getDeductionAmountLocal(salaryForm.activeDeductions || [], ['esic', 'esi']);
    const calculatedCTC = gross + pf + esic;

    const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBankForm({ ...bankForm, [e.target.name]: e.target.value });
    };

    const handleStatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStatForm({ ...statForm, [e.target.name]: e.target.value });
    };

    const saveBankDetails = async () => {
        setIsSaving(true);
        try {
            await employeeService.update(employeeId, { 
                'profile.financial.bankDetails': { ...bankForm, status: bankData?.status || 'Pending' } 
            });
            setIsEditingBank(false);
            onRefresh(); 
            toast.success('Bank details saved successfully!');
        } catch (error) {
            toast.error('Failed to save bank details.');
        } finally {
            setIsSaving(false);
        }
    };

    const saveStatutoryDetails = async () => {
        setIsSaving(true);
        try {
            await employeeService.update(employeeId, { 
                'profile.financial.panNumber': statForm.panNumber || '',
                'profile.financial.esicNumber': statForm.esicNumber || '',
                'profile.financial.pfNumber': statForm.pfNumber || ''
            });
            setIsEditingStat(false);
            onRefresh();
            toast.success('Statutory details saved successfully!');
        } catch (error) {
            toast.error('Failed to save statutory details.');
        } finally {
            setIsSaving(false);
        }
    };

    const saveSalaryDetails = async () => {
        // Filter out completely blank/untouched allowance and deduction rows
        const filteredAllowances = (salaryForm.activeAllowances || []).filter(
            (a) => (a.name && a.name.trim() !== "") || a.amount !== 0
        );
        const filteredDeductions = (salaryForm.activeDeductions || []).filter(
            (d) => (d.name && d.name.trim() !== "") || d.amount !== 0
        );

        // Validate that any configured rows have a name and positive amount
        const invalidAllowance = filteredAllowances.find((a) => !a.name || a.name.trim() === "" || a.name === "Select Allowance..." || a.amount <= 0);
        if (invalidAllowance) {
            toast.error('Please specify a valid name and positive amount for all active allowances.');
            return;
        }

        const invalidDeduction = filteredDeductions.find((d) => !d.name || d.name.trim() === "" || d.name === "Select Deduction..." || d.amount <= 0);
        if (invalidDeduction) {
            toast.error('Please specify a valid name and positive amount for all active deductions.');
            return;
        }

        setIsSaving(true);
        try {
            await employeeService.update(employeeId, { 
                'profile.financial.monthlyCTC': calculatedCTC,
                'profile.financial.basicSalary': Number(salaryForm.basicSalary) || 0,
                'profile.financial.activeAllowances': filteredAllowances,
                'profile.financial.activeDeductions': filteredDeductions
            });
            setIsEditingSalary(false);
            onRefresh();
            toast.success('Salary components saved successfully!');
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || 'Failed to save salary details.';
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const addAllowance = () => {
        setSalaryForm({
            ...salaryForm,
            activeAllowances: [...(salaryForm.activeAllowances || []), { name: '', amount: 0 }]
        });
    };

    const addDeduction = () => {
        setSalaryForm({
            ...salaryForm,
            activeDeductions: [...(salaryForm.activeDeductions || []), { name: '', amount: 0 }]
        });
    };

    const removeAllowance = (index: number) => {
        const newArr = [...(salaryForm.activeAllowances || [])];
        newArr.splice(index, 1);
        setSalaryForm({ ...salaryForm, activeAllowances: newArr });
    };

    const removeDeduction = (index: number) => {
        const newArr = [...(salaryForm.activeDeductions || [])];
        newArr.splice(index, 1);
        setSalaryForm({ ...salaryForm, activeDeductions: newArr });
    };

    const handleAllowanceChange = (index: number, field: string, value: any) => {
        const newArr = [...(salaryForm.activeAllowances || [])];
        newArr[index] = { ...newArr[index], [field]: field === 'amount' ? Number(value) : value };
        setSalaryForm({ ...salaryForm, activeAllowances: newArr });
    };

    const handleDeductionChange = (index: number, field: string, value: any) => {
        const newArr = [...(salaryForm.activeDeductions || [])];
        newArr[index] = { ...newArr[index], [field]: field === 'amount' ? Number(value) : value };
        setSalaryForm({ ...salaryForm, activeDeductions: newArr });
    };

    const availableAllowances = companySettings?.payroll?.customAllowances || [];
    const availableDeductions = companySettings?.payroll?.customDeductions || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Security Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none gap-4 transition-colors">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
                    <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                    <span>This information is securely encrypted and role-restricted.</span>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowSensitiveInfo(!showSensitiveInfo)} 
                    className="gap-2 text-gray-600 dark:text-gray-300 w-full sm:w-auto hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors"
                >
                    {showSensitiveInfo ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showSensitiveInfo ? 'Hide Details' : 'Reveal Details'}
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Bank Account Card */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 flex flex-col transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 transition-colors">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Landmark size={20} className="text-blue-600 dark:text-blue-400" />
                            Bank Account
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            {bankData?.status && <Badge variant={getStatusBadgeVariant(bankData.status)}>{bankData.status}</Badge>}
                            {canEdit && !isEditingBank && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setIsEditingBank(true)} 
                                    className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                >
                                    {bankData?.accountNumber ? <Edit2 size={16} /> : <Plus size={16} className="mr-1"/>}
                                    {bankData?.accountNumber ? 'Edit' : 'Add'}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                        {isEditingBank ? (
                            <div className="space-y-4 animate-in fade-in">
                                <Input label="Bank Name" name="bankName" value={bankForm.bankName || ''} onChange={handleBankChange} placeholder="e.g. HDFC Bank" />
                                <Input label="Account Holder Name" name="accountName" value={bankForm.accountName || ''} onChange={handleBankChange} />
                                <Input label="Account Number" name="accountNumber" value={bankForm.accountNumber || ''} onChange={handleBankChange} type={showSensitiveInfo ? "text" : "password"} />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="IFSC / Routing Code" name="ifscCode" value={bankForm.ifscCode || ''} onChange={handleBankChange} />
                                    <Input label="Branch" name="branch" value={bankForm.branch || ''} onChange={handleBankChange} />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditingBank(false)} className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</Button>
                                    <Button variant="primary" size="sm" onClick={saveBankDetails} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Bank Details'}
                                    </Button>
                                </div>
                            </div>
                        ) : !bankData?.accountNumber ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-500 dark:text-gray-400 transition-colors">
                                <Landmark size={40} className="text-gray-200 dark:text-gray-700 mb-3 transition-colors" />
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors">No Bank Details</p>
                                <p className="text-xs mt-1">Information has not been added yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <DetailItem label="Bank Name" value={bankData.bankName} icon={Building2} />
                                <DetailItem label="Account Holder" value={bankData.accountName} icon={CreditCard} />
                                <DetailItem label="Account Number" value={bankData.accountNumber} icon={Hash} isSensitive showSensitive={showSensitiveInfo} />
                                <DetailItem label="IFSC / Routing" value={bankData.ifscCode} icon={Hash} />
                                <DetailItem label="Branch" value={bankData.branch} icon={Building2} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Statutory & Tax Card */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 flex flex-col transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 transition-colors">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <FileText size={20} className="text-purple-600 dark:text-purple-400" />
                            Statutory & Tax
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            {canEdit && !isEditingStat && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setIsEditingStat(true)} 
                                    className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                                >
                                    {(statutoryData?.panNumber || statutoryData?.esicNumber || statutoryData?.pfNumber) ? <Edit2 size={16} /> : <Plus size={16} className="mr-1"/>}
                                    {(statutoryData?.panNumber || statutoryData?.esicNumber || statutoryData?.pfNumber) ? 'Edit' : 'Add'}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                        {isEditingStat ? (
                            <div className="space-y-4 animate-in fade-in">
                                <Input label="PAN / Tax ID" name="panNumber" value={statForm.panNumber || ''} onChange={handleStatChange} placeholder="Enter Tax ID" />
                                <Input label="ESIC Number" name="esicNumber" value={statForm.esicNumber || ''} onChange={handleStatChange} placeholder="Enter ESIC Number" />
                                <Input label="PF Number" name="pfNumber" value={statForm.pfNumber || ''} onChange={handleStatChange} placeholder="Enter PF Number" />
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditingStat(false)} className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</Button>
                                    <Button variant="primary" size="sm" onClick={saveStatutoryDetails} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Tax Details'}
                                    </Button>
                                </div>
                            </div>
                        ) : (!statutoryData?.panNumber && !statutoryData?.esicNumber && !statutoryData?.pfNumber) ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-500 dark:text-gray-400 transition-colors">
                                <FileText size={40} className="text-gray-200 dark:text-gray-700 mb-3 transition-colors" />
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors">No Statutory Details</p>
                                <p className="text-xs mt-1">Tax and compliance info has not been added yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <DetailItem label="PAN / Tax ID" value={statutoryData.panNumber} icon={CreditCard} isSensitive showSensitive={showSensitiveInfo} />
                                <DetailItem label="ESIC Number" value={statutoryData.esicNumber} icon={Hash} isSensitive showSensitive={showSensitiveInfo} />
                                <DetailItem label="PF Number" value={statutoryData.pfNumber} icon={Hash} isSensitive showSensitive={showSensitiveInfo} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Salary Components Card */}
                {canEdit && (
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-white dark:bg-gray-900 flex flex-col transition-colors xl:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 transition-colors">
                        <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100">
                            <Calculator size={20} className="text-emerald-600 dark:text-emerald-400" />
                            Payroll & Salary Components
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            {!isEditingSalary && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setIsEditingSalary(true)} 
                                    className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                >
                                    <Edit2 size={16} /> Edit
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                        {isEditingSalary ? (
                            <div className="space-y-6 animate-in fade-in">
                                <Input 
                                    label="Monthly CTC (Calculated: Gross + PF + ESIC)" 
                                    name="monthlyCTC" 
                                    type="number" 
                                    value={calculatedCTC || ''} 
                                    disabled 
                                    className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed" 
                                />
                                <Input label="Basic Salary (Monthly)" name="basicSalary" type="number" value={salaryForm.basicSalary || ''} onChange={(e) => setSalaryForm({...salaryForm, basicSalary: Number(e.target.value)})} placeholder="e.g. 50000" />
                                
                                {/* Allowances */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Active Allowances</h4>
                                        <Button variant="outline" size="sm" onClick={addAllowance} className="h-7 text-xs px-2 gap-1"><Plus size={12}/> Add</Button>
                                    </div>
                                    <div className="space-y-2">
                                        {salaryForm.activeAllowances?.map((allowance, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <select
                                                    value={allowance.name}
                                                    onChange={(e) => handleAllowanceChange(idx, 'name', e.target.value)}
                                                    className="flex-1 h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 px-2"
                                                >
                                                    <option value="" className="bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-100">Select Allowance...</option>
                                                    {availableAllowances.map((a: any) => (
                                                        <option key={a.name} value={a.name} className="bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-100">{a.name}</option>
                                                    ))}
                                                    <option value="Other" className="bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-100">Other (Custom)</option>
                                                </select>
                                                <Input 
                                                    name={`allowanceAmount_${idx}`} 
                                                    type="number" 
                                                    value={allowance.amount} 
                                                    onChange={(e) => handleAllowanceChange(idx, 'amount', e.target.value)}
                                                    placeholder="Amount"
                                                />
                                                <Button variant="ghost" size="sm" onClick={() => removeAllowance(idx)} className="text-red-500 hover:bg-red-50 p-2"><Trash2 size={16}/></Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Deductions */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Active Deductions</h4>
                                        <Button variant="outline" size="sm" onClick={addDeduction} className="h-7 text-xs px-2 gap-1"><Plus size={12}/> Add</Button>
                                    </div>
                                    <div className="space-y-2">
                                        {salaryForm.activeDeductions?.map((deduction, idx) => (
                                            <div key={idx} className="flex gap-2 items-center">
                                                <select
                                                    value={deduction.name}
                                                    onChange={(e) => handleDeductionChange(idx, 'name', e.target.value)}
                                                    className="flex-1 h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 px-2"
                                                >
                                                    <option value="" className="bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-100">Select Deduction...</option>
                                                    {availableDeductions.map((d: any) => (
                                                        <option key={d.name} value={d.name} className="bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-100">{d.name}</option>
                                                    ))}
                                                    <option value="Other" className="bg-white dark:bg-gray-900 text-gray-950 dark:text-gray-100">Other (Custom)</option>
                                                </select>
                                                <Input 
                                                    name={`deductionAmount_${idx}`} 
                                                    type="number" 
                                                    value={deduction.amount} 
                                                    onChange={(e) => handleDeductionChange(idx, 'amount', e.target.value)}
                                                    placeholder="Amount"
                                                />
                                                <Button variant="ghost" size="sm" onClick={() => removeDeduction(idx)} className="text-red-500 hover:bg-red-50 p-2"><Trash2 size={16}/></Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditingSalary(false)} className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</Button>
                                    <Button variant="primary" size="sm" onClick={saveSalaryDetails} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Salary Details'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Monthly CTC</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">${salaryData?.monthlyCTC || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Basic Salary</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">${salaryData?.basicSalary || 0}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Allowances</h4>
                                        {salaryData?.activeAllowances?.length ? (
                                            <div className="space-y-2">
                                                {salaryData.activeAllowances.map((a, i) => (
                                                    <div key={i} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{a.name}</span>
                                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+${a.amount}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="text-xs text-gray-400 italic">None</p>}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Deductions</h4>
                                        {salaryData?.activeDeductions?.length ? (
                                            <div className="space-y-2">
                                                {salaryData.activeDeductions.map((d, i) => (
                                                    <div key={i} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{d.name}</span>
                                                        <span className="text-sm font-bold text-red-600 dark:text-red-400">-${d.amount}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="text-xs text-gray-400 italic">None</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                )}
            </div>
        </div>
    );
}