import React from 'react';
import Navbar from '@/components/marketing/shared/Navbar';
import Footer from '@/components/marketing/shared/Footer';
import CustomerAuthInitializer from '@/components/auth/CustomerAuthInitializer';
import ForceLightMode from '@/components/theme/ForceLightMode';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <CustomerAuthInitializer>
            <ForceLightMode />
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow bg-white dark:bg-gray-950 transition-colors duration-300">
                    {children}
                </main>
                <Footer />
            </div>
        </CustomerAuthInitializer>
    );
}
