'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePathname } from 'next/navigation';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    if (pathname === '/change-password') {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                {children}
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-white overflow-hidden dark:bg-gray-950">
            {/* Sidebar receives the state */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            {/* We add md:ml-[250px] here to permanently push the content over on desktop, preventing it from hiding behind the fixed sidebar */}
            <div className="flex-1 flex flex-col min-w-0 md:ml-[250px] transition-all duration-300">
                {/* Header receives the toggle function */}
                <Header onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50/80 dark:bg-gray-950">
                    {children}
                </main>
            </div>
        </div>
    );
}