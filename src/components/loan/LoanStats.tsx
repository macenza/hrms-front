import React from 'react';
import { IndianRupee, CreditCard, Clock, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

// Data Contract for Backend Integration
export interface LoanStatsData {
    activeLoans: number;
    pendingRequests: number;
    totalDisbursed: number;
    monthlyRecovery: number;
}

interface LoanStatsProps {
    data?: LoanStatsData;
}

// Mock Data Fallback
const mockLoanStats: LoanStatsData = {
    activeLoans: 24,
    pendingRequests: 5,
    totalDisbursed: 850000,
    monthlyRecovery: 45200,
};

// Currency Formatter for Indian Rupees
const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0, // Removes the .00 at the end
    }).format(amount);
};

export default function LoanStats({ data = mockLoanStats }: LoanStatsProps) {

    // Structure the data for easy rendering
    const statCards = [
        {
            title: "Total Active Loans",
            value: data.activeLoans.toString(),
            icon: <Activity size={20} />,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            title: "Pending Requests",
            value: data.pendingRequests.toString(),
            icon: <Clock size={20} />,
            iconBg: "bg-yellow-50",
            iconColor: "text-yellow-600",
        },
        {
            title: "Total Disbursed",
            value: formatINR(data.totalDisbursed),
            icon: <IndianRupee size={20} />,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
        },
        {
            title: "Monthly EMI Recovery",
            value: formatINR(data.monthlyRecovery),
            icon: <CreditCard size={20} />,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
            {/* Map over the array using the standardized Card component */}
            {statCards.map((stat, index) => (
                <Card key={index} className="border-gray-100 hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-5 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900 tracking-tight">
                                {stat.value}
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.iconColor}`}>
                            {stat.icon}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}