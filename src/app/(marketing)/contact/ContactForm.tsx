"use client";

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';
import { ENDPOINTS } from '@/constants/endpoints';

export default function ContactForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields on the frontend
        if (!name.trim()) {
            toast.error('Name is required.');
            return;
        }
        if (!email.trim()) {
            toast.error('Email is required.');
            return;
        }
        if (!message.trim()) {
            toast.error('Message is required.');
            return;
        }

        setLoading(true);

        try {
            const response = await apiClient.post(ENDPOINTS.INQUIRY, {
                name,
                email,
                phone,
                subject,
                message
            });

            if (response.data.success) {
                toast.success(response.data.message || 'Inquiry submitted successfully');
                // Clear the form fields
                setName('');
                setEmail('');
                setPhone('');
                setSubject('');
                setMessage('');
            } else {
                toast.error(response.data.message || 'Failed to submit inquiry');
            }
        } catch (error: any) {
            console.error('Inquiry Submission Error:', error);
            const errMsg = error.response?.data?.message || 'Failed to submit inquiry';
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Your Full Name</label>
                <Input
                    type="text"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="text-gray-900 dark:text-gray-100"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Work Email</label>
                    <Input
                        type="email"
                        placeholder="john@company.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="text-gray-900 dark:text-gray-100"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Phone Number</label>
                    <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={loading}
                        className="text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Subject (Optional)</label>
                <Input
                    type="text"
                    placeholder="Product Demo, Pricing inquiry, Support, etc."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={loading}
                    className="text-gray-900 dark:text-gray-100"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">How can we help you?</label>
                <textarea
                    rows={4}
                    placeholder="Describe your organizational size, custom needs, or support requests..."
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium"
                />
            </div>

            <div className="pt-2">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full py-5 text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin text-white" size={16} />
                            <span>Submitting Inquiry...</span>
                        </>
                    ) : (
                        <span>Submit Inquiry</span>
                    )}
                </Button>
            </div>
        </form>
    );
}
