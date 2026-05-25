import React from 'react';
import MainLayoutWrapper from '@/components/layout/MainLayoutWrapper';
import { Toaster } from 'sonner';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <MainLayoutWrapper>
            <Toaster />
            {children}
        </MainLayoutWrapper>
    );
}