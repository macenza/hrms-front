import React from 'react';
import CustomerLoginForm from '@/components/auth/CustomerLoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Customer Hub Login | MACENZA Workspace',
    description: 'Manage your B2B subscription and organization space.',
};

export default function SaaSBuyerLoginPage() {
    return <CustomerLoginForm />;
}