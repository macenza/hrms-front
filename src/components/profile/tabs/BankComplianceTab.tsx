'use client';

import React, { useState } from 'react';
import { Landmark, Hash, CreditCard, Building2, ShieldCheck, Eye, EyeOff, FileText, Edit2, Plus, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input'; 
import { employeeService } from '@/services/employeeService';
import { cn } from '@/utils/cn';

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
    aadhaarNumber: string;
    uanNumber: string;
    pfNumber: string;
    status: VerificationStatus;
}

interface BankComplianceTabProps {
    employeeId: string;
    currentUserRole: string; 
    bankData?: BankDetails | null;
    statutoryData?: StatutoryDetails | null;
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
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className="p-2 bg-gray-100/80 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 rounded-md shrink-0 transition-colors">
            <Icon size={18} />
        </div>
        <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5 transition-colors">{label}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono tracking-tight transition-colors">
                {value ? (
                    isSensitive && !showSensitive ? maskNumber(value) : value
                ) : (
                    <span className="text-gray-400 dark:text-gray-500 font-sans italic">Not provided</span>
                )}
            </p>
        </div>
    </div>
);

export default function BankComplianceTab({
    employeeId,
    currentUserRole,
    bankData,
    statutoryData,
    onRefresh
}: BankComplianceTabProps) {
    const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
    
    const [isEditingBank, setIsEditingBank] = useState(false);
    const [isEditingStat, setIsEditingStat] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [bankForm, setBankForm] = useState<Partial<BankDetails>>(bankData || {});
    const [statForm, setStatForm] = useState<Partial<StatutoryDetails>>(statutoryData || {});
    
    const canEdit = currentUserRole === 'Admin' || currentUserRole === 'HR';

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
                'profile.bankDetails': { ...bankForm, status: bankData?.status || 'Pending' } 
            });
            setIsEditingBank(false);
            onRefresh(); 
        } catch (error) {
            alert('Failed to save bank details.');
        } finally {
            setIsSaving(false);
        }
    };

    const saveStatutoryDetails = async () => {
        setIsSaving(true);
        try {
            await employeeService.update(employeeId, { 
                'profile.statutoryDetails': { ...statForm, status: statutoryData?.status || 'Pending' } 
            });
            setIsEditingStat(false);
            onRefresh();
        } catch (error) {
            alert('Failed to save statutory details.');
        } finally {
            setIsSaving(false);
        }
    };

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
                            {statutoryData?.status && <Badge variant={getStatusBadgeVariant(statutoryData.status)}>{statutoryData.status}</Badge>}
                            {canEdit && !isEditingStat && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setIsEditingStat(true)} 
                                    className="h-8 px-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                                >
                                    {statutoryData?.panNumber ? <Edit2 size={16} /> : <Plus size={16} className="mr-1"/>}
                                    {statutoryData?.panNumber ? 'Edit' : 'Add'}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                        {isEditingStat ? (
                            <div className="space-y-4 animate-in fade-in">
                                <Input label="PAN / Tax ID" name="panNumber" value={statForm.panNumber || ''} onChange={handleStatChange} placeholder="Enter Tax ID" />
                                <Input label="National ID" name="aadhaarNumber" value={statForm.aadhaarNumber || ''} onChange={handleStatChange} placeholder="Enter National ID" />
                                <Input label="UAN (Provident Fund)" name="uanNumber" value={statForm.uanNumber || ''} onChange={handleStatChange} />
                                <Input label="PF Account Number" name="pfNumber" value={statForm.pfNumber || ''} onChange={handleStatChange} />
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditingStat(false)} className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</Button>
                                    <Button variant="primary" size="sm" onClick={saveStatutoryDetails} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Tax Details'}
                                    </Button>
                                </div>
                            </div>
                        ) : !statutoryData?.panNumber ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-8 text-gray-500 dark:text-gray-400 transition-colors">
                                <FileText size={40} className="text-gray-200 dark:text-gray-700 mb-3 transition-colors" />
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 transition-colors">No Statutory Details</p>
                                <p className="text-xs mt-1">Tax and compliance info has not been added yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <DetailItem label="PAN / Tax ID" value={statutoryData.panNumber} icon={CreditCard} isSensitive showSensitive={showSensitiveInfo} />
                                <DetailItem label="National ID" value={statutoryData.aadhaarNumber} icon={CreditCard} isSensitive showSensitive={showSensitiveInfo} />
                                <DetailItem label="UAN Number" value={statutoryData.uanNumber} icon={Hash} />
                                <DetailItem label="PF Account Number" value={statutoryData.pfNumber} icon={Hash} />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}