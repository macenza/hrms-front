'use client';

import React, { useState } from 'react';
import { Download, Plus } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

// Feature Components
import LoanStats from '@/components/loan/LoanStats';
import LoanTable from '@/components/loan/LoanTable';
import ApplyLoanModal, { LoanApplicationPayload } from '@/components/loan/ApplyLoanModal';

export default function LoanPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // In the future, this is where you will fetch your data hooks:
    // const { data: stats, isLoading: statsLoading } = useLoanStats();
    // const { data: loanRecords, isLoading: loansLoading } = useLoanRecords();

    const handleApplyLoan = (payload: LoanApplicationPayload) => {
        // When backend is ready:
        // await apiClient.post('/loans/request', payload);
        console.log('Submitting new loan request:', payload);
        
        // You would typically trigger a re-fetch of your loan data here
        // mutate('/api/loans');
        
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Loan & Advances</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage employee salary advances and loan requests
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 shadow-sm">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export Report</span>
                    </Button>
                    
                    <Button 
                        variant="primary" 
                        onClick={() => setIsModalOpen(true)}
                        className="gap-2 shadow-sm shadow-blue-500/30"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        New Loan Request
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            {/* When your API is ready, pass the data: <LoanStats data={stats} /> */}
            <LoanStats />

            {/* Main Data Table */}
            <Card className="border-gray-200">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Active Loans & Requests</CardTitle>
                </CardHeader>
                {/* Removed internal padding to let the table sit flush against the edges */}
                <CardContent className="p-0 sm:p-0">
                    {/* When your API is ready, pass the data: <LoanTable data={loanRecords} /> */}
                    <LoanTable 
                        onViewDetails={(record) => {
                            // Example: Open a detail modal or route to a specific loan page
                            console.log("Viewing details for:", record.id);
                        }}
                    />
                </CardContent>
            </Card>

            {/* Application Modal */}
            <ApplyLoanModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleApplyLoan}
                // employees={employeeList} <-- Pass dynamic employee list here when API is ready
            />
        </div>
    );
}