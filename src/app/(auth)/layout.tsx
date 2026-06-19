import React from 'react';
import ForceLightMode from '@/components/theme/ForceLightMode';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen w-full bg-[#F8F9FB] dark:bg-gray-950 flex flex-col items-center justify-center p-4 md:p-8">
            <ForceLightMode />
            {/* Background Decorative Elements (Optional - subtle blobs for a premium feel) */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50 dark:bg-blue-950/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50 dark:bg-indigo-950/40 blur-[120px]" />
            </div>

            <div className="w-full max-w-7xl relative z-10">
                {/* Branding / Logo Area */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-[#6D5DFD] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none mb-2 animate-pulse">
                        <span className="text-white font-black text-2xl tracking-tighter">M</span>
                    </div>
                </div>

                {/* The Login/Signup Form gets injected here */}
                {children}

                {/* Footer Copyright */}
                <p className="mt-12 text-center text-gray-400 dark:text-gray-500 text-xs font-medium">
                    &copy; {new Date().getFullYear()} Macenza Tech. All rights reserved.
                </p>
            </div>
        </main>
    );
}