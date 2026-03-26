import React from 'react';
import MainLayoutWrapper from '@/components/layout/MainLayoutWrapper';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    return (
        <MainLayoutWrapper>
            {children}
        </MainLayoutWrapper>
    );
}