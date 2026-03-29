import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | MACENZA HRMS',
    description: 'Access your organization dashboard',
};

export default function LoginPage() {
    return (
        <div className="w-full">
            <LoginForm />
            
            {/* Quick Helper Links */}
            <div className="mt-8 flex items-center justify-center gap-6 text-xs font-medium text-gray-400">
                <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <a href="#" className="hover:text-gray-600 transition-colors">Help Center</a>
            </div>
        </div>
    );
}