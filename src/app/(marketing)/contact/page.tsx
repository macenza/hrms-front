import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import ContactForm from './ContactForm';

export const metadata = {
    title: 'Contact Sales & Support | MACENZA HRMS',
    description: 'Get in touch with the MACENZA team for custom demos, pricing structures, or technical support.',
};

export default function ContactPage() {
    return (
        <div className="py-20 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#6D5DFD] bg-[#6D5DFD]/10 px-3.5 py-1.5 rounded-full">
                    Talk to Us
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    Get in Touch with our <br />
                    <span className="bg-gradient-to-r from-[#6D5DFD] to-[#8B7BFF] bg-clip-text text-transparent">
                        Global HR Platform Experts
                    </span>
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                    Have questions about our custom calculations, team integrations, onboarding flows, or subscription plans? Our sales specialists are here to guide you.
                </p>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                {/* Visual Sales Info Card */}
                <div className="bg-gradient-to-tr from-[#6D5DFD] to-[#8B7BFF] text-white p-8 md:p-12 rounded-3xl flex flex-col justify-between shadow-lg shadow-blue-100 dark:shadow-none">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black tracking-tight">
                            Reach out directly
                        </h2>
                        <p className="text-gray-100 text-sm leading-relaxed max-w-md">
                            Fill out the inquiry form and a dedicated SaaS integration consultant will reach back out to you within 2 business hours.
                        </p>
                    </div>

                    <div className="space-y-6 my-10 border-t border-white/20 pt-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-200">Email us</p>
                                <p className="font-bold text-sm">info@macenza.com</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Phone size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-200">Call us</p>
                                <p className="font-bold text-sm">+91 98765 43210</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-200">Headquarters</p>
                                <p className="font-bold text-sm">123 Business Park, Ahmedabad, India</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-gray-200">
                        &copy; 2026 MACENZA. All rights reserved.
                    </div>
                </div>

                {/* Direct Contact Form */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 md:p-12 rounded-3xl shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Send us a message
                    </h3>
                    <ContactForm />
                </div>
            </div>
        </div>
    );
}
