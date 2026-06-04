import React from 'react';
import CustomerLoginForm from '@/components/auth/CustomerLoginForm';
import { Metadata } from 'next';
import Link from 'next/link';
import { Home } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Customer Hub Login | MACENZA Workspace',
    description: 'Manage your B2B subscription and organization space.',
};

export default function SaaSBuyerLoginPage() {
    return (
        <div className="flex flex-col items-center w-full gap-4">
            <CustomerLoginForm />
            <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all px-5 py-2.5 shadow-md hover:shadow-lg text-white bg-[#6D5DFD] hover:bg-[#5b4eed] hover:scale-105 active:scale-95 duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5DFD]/50 focus-visible:ring-offset-2 z-20"
            >
                <Home size={16} />
                Back to Home
            </Link>
        </div>
    );
}