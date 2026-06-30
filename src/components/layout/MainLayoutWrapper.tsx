'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

export default function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="flex h-screen bg-white overflow-hidden dark:bg-gray-950">
            {/* Sidebar receives the state */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content Area */}
            {/* We dynamically toggle the ml-[250px] margin on desktop based on whether the sidebar is open */}
            <div 
                className={cn(
                    "flex-1 flex flex-col min-w-0",
                    isSidebarOpen ? "md:translate-x-[250px]" : "translate-x-0"
                )}
                style={{
                    transition: isSidebarOpen 
                        ? 'transform 280ms cubic-bezier(0.25, 1, 0.5, 1)' 
                        : 'transform 750ms cubic-bezier(0.25, 1, 0.5, 1)',
                    willChange: 'transform'
                }}
            >
                {/* Header receives the toggle function */}
                <Header 
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                    isSidebarOpen={isSidebarOpen}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-gray-50/80 dark:bg-gray-950">
                    {children}
                </main>
            </div>
        </div>
    );
}