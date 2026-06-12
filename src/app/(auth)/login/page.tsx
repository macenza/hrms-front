import React from 'react';
import LoginTabs from '@/components/auth/LoginTabs';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In | MACENZA HRMS',
    description: 'Sign in to your Macenza HRMS workspace. Access your dashboard, manage employees, and run your HR operations.',
};

export default function LoginPage() {
    return <LoginTabs />;
}