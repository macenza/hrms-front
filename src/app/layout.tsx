import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';



import { ThemeProvider } from '@/components/theme/ThemeProvider';
import StoreProvider from '@/store/StoreProvider';
import AuthInitializer from '@/components/auth/AuthInitializer';
import { SettingsProvider } from '@/providers/SettingsProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'HRMS Portal',
    description: 'Human Resource Management System',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // suppressHydrationWarning is REQUIRED here for next-themes to work properly
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider>
                    <StoreProvider>
                        <AuthInitializer>
                            <SettingsProvider>
                                {children}
                            </SettingsProvider>
                        </AuthInitializer>
                    </StoreProvider>
                </ThemeProvider>
               
            </body>

        </html>
    );
}