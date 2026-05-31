import React from 'react';
import MainLayoutWrapper from '@/components/layout/MainLayoutWrapper';
import { Toaster } from 'sonner';
import AuthInitializer from '@/components/auth/AuthInitializer';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <AuthInitializer>
            <MainLayoutWrapper>
                <Toaster />
                {children}
            </MainLayoutWrapper>
        </AuthInitializer>
    );
}