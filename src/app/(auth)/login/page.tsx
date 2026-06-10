import React from 'react';
import UnifiedLoginForm from '@/components/auth/UnifiedLoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sign In | MACENZA HRMS',
    description: 'Sign in to your Macenza HRMS workspace. Access your dashboard, manage employees, and run your HR operations.',
};

export default function LoginPage() {
    return <UnifiedLoginForm />;
}