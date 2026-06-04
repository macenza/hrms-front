import React from 'react';
import { Shield, CreditCard } from 'lucide-react';

export const metadata = {
    title: 'Privacy Policy | MACENZA HRMS',
    description: 'Privacy Policy, data processing disclosures, and compliance mandates for MACENZA HRMS.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="py-16 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="text-center max-w-4xl mx-auto mb-16 space-y-4">
                <span className="text-sm font-bold uppercase tracking-widest text-[#6D5DFD] bg-[#6D5DFD]/10 px-4 py-2 rounded-full">
                    Data Protection & Security
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    Privacy Policy
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400 font-semibold">
                    Last Updated: June 2, 2026
                </p>
            </div>

            {/* Intro Alert Box */}
            <div className="mb-12 p-6 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl flex items-start gap-4">
                <Shield className="w-6 h-6 text-[#6D5DFD] shrink-0 mt-1" />
                <div className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    At <strong>MACENZA Tech</strong>, we value the trust you place in us when sharing your corporate, financial, and employee information. This Privacy Policy outlines our strict practices regarding data collection, processing, storage, sharing, security, and statutory compliance. It is designed to meet the rigorous verification criteria of premium merchant providers like Razorpay.
                </div>
            </div>

            {/* Layout with a Sidebar for Navigation and Main Content Column */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-3 lg:sticky lg:top-24 h-fit">
                    <p className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
                        Document Sections
                    </p>
                    <a href="#introduction" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        1. Introduction
                    </a>
                    <a href="#information-collection" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        2. Information Collection
                    </a>
                    <a href="#data-usage" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        3. How We Use Data
                    </a>
                    <a href="#processor-controller" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        4. Processor vs. Controller
                    </a>
                    <a href="#razorpay-payments" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        5. Razorpay Payments
                    </a>
                    <a href="#data-security" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        6. Technical Security
                    </a>
                    <a href="#cookies-tracking" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        7. Cookies Policy
                    </a>
                    <a href="#data-sharing" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        8. Information Sharing
                    </a>
                    <a href="#retention-deletion" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        9. Retention & Deletion
                    </a>
                    <a href="#legal-compliance" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        10. Legal Compliance
                    </a>
                    <a href="#grievance-contact" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        11. Contact & Grievance
                    </a>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-12 text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                    
                    {/* Section 1 */}
                    <section id="introduction" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            1. Introduction
                        </h2>
                        <p>
                            Macenza Tech (referred to as "MACENZA", "we", "us", or "our") operates the MACENZA HRMS software-as-a-service application. This Privacy Policy describes how we collect, store, share, use, and manage personal data of workspace owners (our "Customers") and the employees, staff, contractors, and agents whose details are logged into the system (our "End Users").
                        </p>
                        <p>
                            By registering an administrative company account or logging into the Employee Portal, you signify your agreement to the terms outlined herein. If you do not agree with this policy, please discontinue access and use of the platform immediately.
                        </p>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 2 */}
                    <section id="information-collection" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            2. Information We Collect
                        </h2>
                        <p>
                            We collect multiple types of data to operate our HRMS dashboard accurately:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Employer Registration Details:</strong> Legal business entity names, corporate address, Tax IDs (GSTIN/PAN), billing address, phone contact numbers, and corporate email accounts.
                            </li>
                            <li>
                                <strong>User Credentials:</strong> Full name, verified business email, phone number, encrypted password hashes, profile photos, and role categories (Administrator, HR Manager, Employee).
                            </li>
                            <li>
                                <strong>Employee Records:</strong> Information inputted by the employer, including employee IDs, full names, job titles, department names, joining dates, salary structures, attendance logs, punch-in/out times, leave logs, active loan balances, equipment/asset assignments, and emergency contact details.
                            </li>
                            <li>
                                <strong>Financial Information:</strong> Bank account numbers, IFSC codes, and transaction histories necessary to compute payroll slips and direct salary deposits.
                            </li>
                            <li>
                                <strong>Automated System Logs:</strong> Device IP addresses, browser types, screen dimensions, log records of user dashboard interactions, and operating system types collected during active sessions.
                            </li>
                        </ul>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 3 */}
                    <section id="data-usage" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            3. How We Use Collected Data
                        </h2>
                        <p>
                            All collected data is utilized to maintain, analyze, and optimize HR processes. Specific usage parameters include:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                Providing, managing, and maintaining your organization's custom HRMS workspace.
                            </li>
                            <li>
                                Executing asynchronous background calculations for monthly payroll structures, dynamic employee allowance allocations, and tax deductions.
                            </li>
                            <li>
                                Logging daily attendance punch-ins, clock logs, leave applications, and calculating paid/unpaid leaves.
                            </li>
                            <li>
                                Distributing notice board updates, automated system alerts, and notifications about pending loan requests or leave approvals.
                            </li>
                            <li>
                                Processing subscription renewal billing, license expansion billing, and tracking transaction invoices.
                            </li>
                            <li>
                                Mitigating security risks, preventing unauthorized login attempts, and running system audits.
                            </li>
                        </ul>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 4 */}
                    <section id="processor-controller" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            4. Data Processor vs. Data Controller Disclosures
                        </h2>
                        <p>
                            Under standard data protection rules (including GDPR and the India Digital Personal Data Protection Act, 2023):
                        </p>
                        <p>
                            MACENZA Tech acts strictly as a **Data Processor** for the employee records, timesheets, payroll math inputs, and bank account listings uploaded by the subscribing organization. The subscribing company acts as the **Data Controller** and maintains sole legal ownership over the collection consent, accuracy, and termination parameters of their workforce data.
                        </p>
                        <p>
                            Employees seeking to request access, correction, or erasure of their employee profiles should submit their request directly to their employer's HR administrator.
                        </p>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 5 */}
                    <section id="razorpay-payments" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            5. Razorpay Payments & Financial Security
                        </h2>
                        <p>
                            We offer tier-based premium subscription packages. To process payments securely, we integrate with the **Razorpay** payment gateway (operated by Razorpay Software Private Limited).
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-lg">
                                <CreditCard className="w-5 h-5 text-[#6D5DFD]" />
                                Payment Compliance & Data Governance
                            </div>
                            <div className="space-y-3 text-sm">
                                <p>
                                    <strong>Payment Execution:</strong> All credit card, debit card, UPI, corporate net-banking, and wallet transaction inputs are typed directly into Razorpay's overlay form. The processing of payment metrics is fully PCI-DSS compliant.
                                </p>
                                <p>
                                    <strong>Transaction Data Storage:</strong> Our servers only receive and log payment confirmation metadata, including: Razorpay Order ID, Razorpay Payment ID, transaction date, plan identifier, currency, billing name, email, payment status (Success/Failed), and amount paid. We do not store card PINs, CVVs, expiration dates, or bank net banking credentials.
                                </p>
                                <p>
                                    <strong>Security Assurance:</strong> Razorpay secures all network connections with TLS 1.3 encryption and uses advanced fraud detection engines.
                                </p>
                                <p>
                                    <strong>Payment Liability Limit:</strong> Macenza Tech does not control the payment processing infrastructure. Any transaction failures, double debits, bank delays, or breaches on Razorpay's end are subject to Razorpay's own Terms of Service. Macenza Tech shall not be liable for losses arising from gateway processing errors.
                                </p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 6 */}
                    <section id="data-security" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            6. Technical & Operational Security
                        </h2>
                        <p>
                            Our platform utilizes layered defensive mechanisms to ensure data security:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Encryption Standard:</strong> All active network traffic is encrypted using SSL/TLS 1.2 or higher. Databases are stored behind private subnets with volume-level AES-256 encryption at-rest.
                            </li>
                            <li>
                                <strong>Server Isolation:</strong> Customer database schemas are logically isolated. Administrative actions are logged to immutable logs to track audits.
                            </li>
                            <li>
                                <strong>Regular Backups:</strong> Automated daily server snapshots are taken, encrypted, and stored in redundant regions to ensure disaster recovery.
                            </li>
                        </ul>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 7 */}
                    <section id="cookies-tracking" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            7. Cookies & Session Tracking
                        </h2>
                        <p>
                            We use cookies to maintain active login contexts and cache preferences:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Strictly Necessary Cookies:</strong> Required to keep users logged in. These include `hrms_token`, `customer_token`, and role cache identifiers. Without them, users would have to retype logins on every page.
                            </li>
                            <li>
                                <strong>Analytics Cookies:</strong> Optional cookies that help us count traffic, detect browser crashes, and monitor performance.
                            </li>
                        </ul>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 8 */}
                    <section id="data-sharing" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            8. Information Sharing & Disclosure
                        </h2>
                        <p>
                            We disclose personal and organizational details under very specific circumstances:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Payment Gateways:</strong> To Razorpay to process payments.
                            </li>
                            <li>
                                <strong>Legal Mandates:</strong> If required by court orders, search warrants, or government requests under the IT Act, 2000.
                            </li>
                            <li>
                                <strong>Service Providers:</strong> To hosting providers, database backups, email distribution servers, and SMS verification gateways under strict data protection agreements.
                            </li>
                        </ul>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 9 */}
                    <section id="retention-deletion" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            9. Data Retention & Deletion
                        </h2>
                        <p>
                            We retain organizational records as long as your workspace account remains active. If a customer cancels their subscription:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                Workspace records will remain stored for a grace period of 30 days to facilitate recovery.
                            </li>
                            <li>
                                After 30 days, all employee databases, notice logs, leave logs, and payroll calculations will be permanently deleted from our live production databases, and will fade out from encrypted tape backups within 90 days.
                            </li>
                        </ul>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 10 */}
                    <section id="legal-compliance" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            10. Legal & Statutory Compliance
                        </h2>
                        <p>
                            We process all customer and employee information in full conformity with local Indian legislations including the **Information Technology Act, 2000**, the **Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011**, and the **Digital Personal Data Protection Act, 2023** (DPDP Act).
                        </p>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 11 */}
                    <section id="grievance-contact" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            11. Contact & Grievance Redressal
                        </h2>
                        <p>
                            In case of grievances, query requests, billing dispute notifications, or data protection questions, please contact our designated Grievance Officer:
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2 text-sm">
                            <p className="font-bold text-gray-900 dark:text-white text-lg">MACENZA Support Office</p>
                            <p><strong>Merchant/Entity Name:</strong> Macenza Tech</p>
                            <p><strong>Contact Person:</strong> Grievance Officer</p>
                            <p><strong>Email:</strong> info@macenza.com</p>
                            <p><strong>Phone:</strong> +91 9414660123</p>
                            <p><strong>Physical Address:</strong> Siddhart Nagar, Mayo Link Road, Ajmer, Rajasthan, India, 305001</p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
