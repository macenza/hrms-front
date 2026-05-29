'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, User, Copy, Check, Loader2, Send } from 'lucide-react';
import { employeeService } from '@/services/employeeService';
import { toast } from 'sonner';

interface SendCredentialsModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeName: string;
    employeeEmail: string;
    password: string;
}

export default function SendCredentialsModal({
    isOpen,
    onClose,
    employeeName,
    employeeEmail,
    password,
}: SendCredentialsModalProps) {
    const [isSending, setIsSending] = useState(false);
    const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

    const handleCopy = async (text: string, field: 'email' | 'password') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            toast.success(`${field === 'email' ? 'Email' : 'Password'} copied to clipboard!`);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            toast.error('Failed to copy credentials.');
        }
    };

    const handleSend = async () => {
        setIsSending(true);
        try {
            await employeeService.sendCredentials({
                name: employeeName,
                email: employeeEmail,
                password: password,
            });
            toast.success('Credentials email sent successfully to the employee!');
            onClose();
        } catch (error: any) {
            console.error(error);
            const errMsg = error.response?.data?.message || 'Failed to send credentials email. Please verify backend SMTP settings.';
            toast.error(errMsg);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Send Credentials to Employee?"
            className="max-w-md"
        >
            <div className="flex flex-col space-y-5">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    The employee account has been created successfully. Would you like to securely email their login credentials now?
                </p>

                {/* Credentials Display Card */}
                <div className="bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800/80 rounded-xl p-4 space-y-4">
                    {/* Full Name */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <User size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">Full Name</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{employeeName}</p>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Mail size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">Email Address</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{employeeEmail}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCopy(employeeEmail, 'email')}
                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors cursor-pointer"
                            title="Copy Email"
                        >
                            {copiedField === 'email' ? <Check size={16} className="text-green-600 dark:text-green-400" /> : <Copy size={16} />}
                        </button>
                    </div>

                    {/* Password */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Lock size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">Temporary Password</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate font-mono bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800/80 px-2 py-0.5 rounded inline-block mt-0.5">
                                {password}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCopy(password, 'password')}
                            className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors cursor-pointer"
                            title="Copy Password"
                        >
                            {copiedField === 'password' ? <Check size={16} className="text-green-600 dark:text-green-400" /> : <Copy size={16} />}
                        </button>
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSending}
                        className="h-10 px-4 font-semibold hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleSend}
                        disabled={isSending}
                        className="h-10 px-5 font-semibold gap-2 cursor-pointer shadow-md shadow-blue-500/20 dark:shadow-none"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send size={15} />
                                Send Credentials
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
