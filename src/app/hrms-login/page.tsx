import React from 'react';
import EmployeeLoginForm from '@/components/auth/EmployeeLoginForm';
import { Metadata } from 'next';
import Link from 'next/link';
import { Home } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Employee Portal Login | MACENZA HRMS',
    description: 'Access your organization employee dashboard.',
};

import { Toaster } from 'sonner';
import ForceLightMode from '@/components/theme/ForceLightMode';

export default function HRMSLoginPage() {
    return (
        <main className="min-h-screen w-full bg-[#F8F9FB] dark:bg-gray-950 flex flex-col items-center justify-center p-4 md:p-8">
            <ForceLightMode />
            <Toaster position="top-center" richColors />
            {/* Background blobs for premium aesthetic */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#6D5DFD]/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50/20 dark:bg-indigo-950/20 blur-[120px]" />
            </div>

            <div className="w-full max-w-[440px] relative z-10">
                {/* Brand Title */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-12 h-12 bg-[#6D5DFD] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
                        <span className="text-white font-black text-2xl tracking-tighter">M</span>
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase">
                        MACENZA <span className="text-[#6D5DFD] dark:text-[#8B7BFF]">HRMS</span>
                    </h2>
                </div>

                <div className="flex flex-col items-center w-full gap-4">
                    <EmployeeLoginForm />
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all px-5 py-2.5 shadow-md hover:shadow-lg text-white bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95 duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/50 focus-visible:ring-offset-2 z-20"
                    >
                        <Home size={16} />
                        Back to Home
                    </Link>
                </div>

                <p className="mt-12 text-center text-gray-400 dark:text-gray-500 text-xs font-medium">
                    &copy; {new Date().getFullYear()} Macenza Tech. All rights reserved.
                </p>
            </div>
        </main>
    );
}
