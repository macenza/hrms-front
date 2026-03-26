'use client';

import React, { useState } from 'react';
import { Landmark, Hash, CreditCard, Building2, ShieldCheck, Eye, EyeOff, FileText } from 'lucide-react';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

// Data Contracts for Backend Integration
export type VerificationStatus = 'Verified' | 'Pending' | 'Rejected';

export interface BankDetails {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifscCode: string; // Or Routing Number based on your region
    branch: string;
    status: VerificationStatus;
}

export interface StatutoryDetails {
    panNumber: string; // Or SSN / National Tax ID
    aadhaarNumber: string; // Or National ID
    uanNumber: string; // Universal Account Number (Provident Fund)
    pfNumber: string;
    status: VerificationStatus;
}

interface BankComplianceTabProps {
    bankData?: BankDetails;
    statutoryData?: StatutoryDetails;
}

// Mock Data Fallback
const mockBankData: BankDetails = {
    bankName: 'HDFC Bank Ltd.',
    accountName: 'Alice Johnson',
    accountNumber: '5010023498761234',
    ifscCode: 'HDFC0001234',
    branch: 'Tech City, San Francisco',
    status: 'Verified',
};

const mockStatutoryData: StatutoryDetails = {
    panNumber: 'ABCDE1234F',
    aadhaarNumber: '123456789012',
    uanNumber: '100987654321',
    pfNumber: 'MH/BAN/12345/000/76543',
    status: 'Pending',
};

// Dynamic UI Helpers
const getStatusBadgeVariant = (status: VerificationStatus) => {
    switch (status) {
        case 'Verified': return 'success';
        case 'Pending': return 'warning';
        case 'Rejected': return 'error';
        default: return 'default';
    }
};

// Helper to mask sensitive numbers (e.g., turns "1234567890" into "•••• •••• 7890")
const maskNumber = (num: string, visibleDigits: number = 4) => {
    if (!num || num.length <= visibleDigits) return num;
    const maskedLength = num.length - visibleDigits;
    const maskedSection = '•'.repeat(maskedLength).replace(/(.{4})/g, '$1 ').trim();
    const visibleSection = num.slice(-visibleDigits);
    return `${maskedSection} ${visibleSection}`;
};

// Reusable Detail Item Component
const DetailItem = ({
    label,
    value,
    icon: Icon,
    isSensitive = false,
    showSensitive = false
}: {
    label: string,
    value: string,
    icon: any,
    isSensitive?: boolean,
    showSensitive?: boolean
}) => (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="p-2 bg-gray-100/80 text-gray-500 rounded-md shrink-0">
            <Icon size={18} />
        </div>
        <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
            <p className="text-sm font-bold text-gray-900 font-mono tracking-tight">
                {isSensitive && !showSensitive ? maskNumber(value) : value}
            </p>
        </div>
    </div>
);

export default function BankComplianceTab({
    bankData = mockBankData,
    statutoryData = mockStatutoryData
}: BankComplianceTabProps) {

    // State to toggle the visibility of masked numbers
    const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* Top Action Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <span>This information is securely encrypted.</span>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                    className="gap-2 text-gray-600"
                >
                    {showSensitiveInfo ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showSensitiveInfo ? 'Hide Details' : 'Reveal Details'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Bank Details Card */}
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Landmark size={20} className="text-blue-600" />
                            Bank Account Details
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(bankData.status)}>
                            {bankData.status}
                        </Badge>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                        <DetailItem label="Bank Name" value={bankData.bankName} icon={Building2} />
                        <DetailItem label="Account Holder Name" value={bankData.accountName} icon={CreditCard} />
                        <DetailItem
                            label="Account Number"
                            value={bankData.accountNumber}
                            icon={Hash}
                            isSensitive
                            showSensitive={showSensitiveInfo}
                        />
                        <DetailItem label="IFSC / Routing Code" value={bankData.ifscCode} icon={Hash} />
                    </CardContent>
                </Card>

                {/* Statutory & Tax Details Card */}
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText size={20} className="text-purple-600" />
                            Statutory & Tax Info
                        </CardTitle>
                        <Badge variant={getStatusBadgeVariant(statutoryData.status)}>
                            {statutoryData.status}
                        </Badge>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                        <DetailItem
                            label="PAN / Tax ID"
                            value={statutoryData.panNumber}
                            icon={CreditCard}
                            isSensitive
                            showSensitive={showSensitiveInfo}
                        />
                        <DetailItem
                            label="Aadhaar / National ID"
                            value={statutoryData.aadhaarNumber}
                            icon={CreditCard}
                            isSensitive
                            showSensitive={showSensitiveInfo}
                        />
                        <DetailItem
                            label="UAN (Provident Fund)"
                            value={statutoryData.uanNumber}
                            icon={Hash}
                        />
                        <DetailItem
                            label="PF Account Number"
                            value={statutoryData.pfNumber}
                            icon={Hash}
                        />
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}