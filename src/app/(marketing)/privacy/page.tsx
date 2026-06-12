import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Privacy Policy | MACENZA HRMS',
    description: 'Understand how MACENZA HRMS collects, stores, and handles your information, including our detailed Cookie Policy.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="py-20 px-6 md:px-12 lg:px-20 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-16 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#6D5DFD] bg-[#6D5DFD]/10 px-3.5 py-1.5 rounded-full">
                    Legal & Privacy
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    Privacy Policy
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                    Last updated: June 11, 2026. This policy describes how we collect, use, and share your personal information when you use our platform.
                </p>
            </div>

            {/* Content */}
            <div className="space-y-10 text-gray-750 dark:text-gray-300 leading-relaxed">
                
                {/* Section 1 */}
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        1. Information We Collect
                    </h2>
                    <p>
                        We collect information to provide better services to all our users. This includes information you provide directly (such as name, email address, and company details during sign-up) and information gathered automatically as you navigate our platform.
                    </p>
                </section>

                {/* Section 2 - COOKIE POLICY */}
                <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        2. Cookie Policy & Tracking Technologies
                    </h2>
                    <p>
                        We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
                    </p>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                        A. Types of Cookies We Use
                    </h3>
                    <div className="space-y-3 pl-4 border-l-2 border-[#6D5DFD]">
                        <div>
                            <p className="font-bold text-gray-850 dark:text-gray-200">
                                Essential / Necessary Cookies
                            </p>
                            <p className="text-sm">
                                These cookies are vital to provide you with services available through our site and to enable you to use some of its features. For example, we use the cookie <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">macenza_cookie_consent</code> to remember whether you accepted or declined our cookie policy. We also use secure token cookies to keep you logged in.
                            </p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-850 dark:text-gray-200">
                                Functionality Cookies
                            </p>
                            <p className="text-sm">
                                These cookies allow our website to remember choices you make when you use our platform, such as remembering your login credentials, preferred language, or system theme (dark/light mode).
                            </p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-850 dark:text-gray-200">
                                Analytics & Performance Cookies
                            </p>
                            <p className="text-sm">
                                These cookies are used to collect information about traffic to our site and how users interact with our platform. The information gathered does not identify individual visitors. It is aggregated and anonymous.
                            </p>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                        B. Third-Party Cookies & Services
                    </h3>
                    <p className="text-sm text-gray-650 dark:text-gray-400">
                        In addition to our first-party cookies, we use trusted third-party integration cookies on our platform to handle analytics and process secure transactions:
                    </p>
                    <div className="space-y-3 pl-4 border-l-2 border-[#8B7BFF] mt-2">
                        <div>
                            <p className="font-bold text-gray-850 dark:text-gray-200">
                                Google Analytics
                            </p>
                            <p className="text-sm">
                                We use Google Analytics cookies to monitor traffic volumes, understand user navigation patterns, and gather performance data. This information is completely anonymous and helps us optimize our website responsiveness.
                            </p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-850 dark:text-gray-200">
                                Stripe & Razorpay (Payment Gateways)
                            </p>
                            <p className="text-sm">
                                As part of our billing system integration, our third-party payment providers (Stripe and Razorpay) set secure cookies. These cookies are required to process payments securely, prevent fraudulent card transactions, and keep track of your checkout session state.
                            </p>
                        </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4">
                        C. Managing and Declining Cookies
                    </h3>
                    <p>
                        You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by selecting your preferences on our <strong>Cookie Consent Banner</strong> when you first visit the site.
                    </p>
                    <p>
                        You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though your access to some functionality and areas of our website may be restricted.
                    </p>
                </section>

                {/* Section 3 */}
                <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        3. How We Use Your Information
                    </h2>
                    <p>
                        We use the information we collect to maintain and improve our services, develop new features, protect our platform and users, and provide customized experiences like dark mode and automated payroll systems.
                    </p>
                </section>

                {/* Section 4 */}
                <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        4. Data Sharing and Transfer
                    </h2>
                    <p>
                        We do not sell, trade, or otherwise transfer your personally identifiable information to third parties. This does not include trusted partners who assist us in operating our website or conducting our business, as long as those parties agree to keep this information confidential.
                    </p>
                </section>

                {/* Contact Section */}
                <section className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-10 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        5. Contact Us
                    </h2>
                    <p className="text-sm">
                        If you have any questions about this Privacy Policy or our cookie practices, please contact our privacy compliance team:
                    </p>
                    <ul className="text-sm space-y-2 mt-2">
                        <li>📧 <strong>Email:</strong> info@macenza.com</li>
                        <li>📞 <strong>Phone:</strong> +91 9414660123</li>
                        <li>📍 <strong>Address:</strong> Siddhart Nagar, Mayo Link Road, Ajmer, Rajasthan, India, 305001</li>
                    </ul>
                </section>

            </div>
        </div>
    );
}
