import React from 'react';
import LoginForm from '@/components/auth/loginform';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Employee Portal Login | MACENZA HRMS',
    description: 'Access your organization employee dashboard.',
};

import { Toaster } from 'sonner';

export default function HRMSLoginPage() {
    return (
        <main className="min-h-screen w-full bg-[#F8F9FB] dark:bg-gray-950 flex flex-col items-center justify-center p-4 md:p-8">
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

                <LoginForm />

                <p className="mt-12 text-center text-gray-400 dark:text-gray-500 text-xs font-medium">
                    &copy; {new Date().getFullYear()} Macenza Tech. All rights reserved.
                </p>
            </div>
        </main>
    );
}
