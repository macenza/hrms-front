import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen w-full bg-[#F8F9FB] dark:bg-gray-950 flex flex-col items-center justify-center p-4 md:p-8">
            {/* Background Decorative Elements (Optional - subtle blobs for a premium feel) */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50 dark:bg-blue-950/40 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-50 dark:bg-indigo-950/40 blur-[120px]" />
            </div>

            <div className="w-full max-w-[440px] relative z-10">
                {/* Branding / Logo Area */}
                <div className="flex flex-col items-center mb-10">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
                        <span className="text-white font-black text-2xl tracking-tighter">M</span>
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase">
                        MACENZA <span className="text-blue-600 dark:text-blue-400">HRMS</span>
                    </h2>
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