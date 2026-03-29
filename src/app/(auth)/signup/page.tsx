import React from 'react';
import SignupForm from '@/components/auth/SignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create Account | MACENZA HRMS',
    description: 'Register your organization with MACENZA',
};

export default function SignupPage() {
    return (
        <div className="w-full">
            <SignupForm />
            
            {/* Trust Badges / Info */}
            <div className="mt-8 text-center">
                <p className="text-xs text-gray-400 leading-relaxed">
                    By creating an account, you agree to our terms. <br />
                    All data is encrypted with enterprise-grade SSL security.
                </p>
            </div>
        </div>
    );
}