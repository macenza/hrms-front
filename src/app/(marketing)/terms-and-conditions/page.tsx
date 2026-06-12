import React from 'react';
import { FileText, CreditCard, AlertCircle } from 'lucide-react';

export const metadata = {
    title: 'Terms & Conditions | MACENZA HRMS',
    description: 'Terms of Service, subscription billing rules, cancellation policies, and licensing terms for MACENZA HRMS.',
};

export default function TermsAndConditionsPage() {
    return (
        <div className="py-16 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full">
            {/* Page Header */}
            <div className="text-center max-w-4xl mx-auto mb-16 space-y-4">
                <span className="text-sm font-bold uppercase tracking-widest text-[#6D5DFD] bg-[#6D5DFD]/10 px-4 py-2 rounded-full">
                    SaaS Service Agreement
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    Terms & Conditions
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400 font-semibold">
                    Last Updated: June 2, 2026
                </p>
            </div>

            {/* Intro Alert Box */}
            <div className="mb-12 p-6 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/50 rounded-2xl flex items-start gap-4">
                <FileText className="w-6 h-6 text-[#6D5DFD] shrink-0 mt-1" />
                <div className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    Welcome to <strong>MACENZA HRMS</strong>. These Terms & Conditions constitute a legally binding service level agreement between your organization and <strong>Macenza Tech</strong>. By registering an account, purchasing license subscriptions, or using the platform resources, you agree to comply with all terms detailed below.
                </div>
            </div>

            {/* Layout with a Sidebar for Navigation and Main Content Column */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-3 lg:sticky lg:top-24 h-fit">
                    <p className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
                        Document Sections
                    </p>
                    <a href="#service-scope" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        1. Scope of Services
                    </a>
                    <a href="#account-security" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        2. Account & Security
                    </a>
                    <a href="#billing-plans" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        3. Pricing & Subscriptions
                    </a>
                    <a href="#razorpay-payments" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        4. Razorpay Gateway Terms
                    </a>
                    <a href="#refund-cancellation" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        5. Refund & Cancellation
                    </a>
                    <a href="#acceptable-use" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        6. Acceptable Use Policy
                    </a>
                    <a href="#data-license" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        7. Intellectual Property
                    </a>
                    <a href="#sla-uptime" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        8. Availability & Uptime
                    </a>
                    <a href="#limitation-liability" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        9. Limitation of Liability
                    </a>
                    <a href="#governing-law" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        10. Law & Jurisdiction
                    </a>
                    <a href="#merchant-contact" className="block text-base font-semibold text-gray-600 dark:text-gray-400 hover:text-[#6D5DFD] transition-colors">
                        11. Contact Details
                    </a>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-12 text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                    
                    {/* Section 1 */}
                    <section id="service-scope" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            1. Scope of Services
                        </h2>
                        <p>
                            MACENZA HRMS provides cloud-hosted HR management software, including employee registers, attendance check-in recorders, leaves request routers, internal announcement boards, salary slip generators, loan request sheets, and administrative department tools.
                        </p>
                        <p>
                            Macenza Tech reserves the right to modify, update, enhance, or discontinue specific features of the SaaS application at any time to comply with local regulations, improve system performance, or update UI parameters.
                        </p>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 2 */}
                    <section id="account-security" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            2. Account Onboarding & Security Obligations
                        </h2>
                        <p>
                            To utilize MACENZA HRMS, subscribing entities must create an administrative corporate account:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Onboarding Information:</strong> You must supply authentic registration details, Tax details, active corporate emails, and legitimate contact coordinates.
                            </li>
                            <li>
                                <strong>Credential Integrity:</strong> Workspace administrators are solely responsible for protecting all passwords and API tokens. You are fully liable for all logs, database modifications, and billing calculations run under your credentials.
                            </li>
                            <li>
                                <strong>Access Suspensions:</strong> Macenza Tech reserves the right to suspend or block company accounts if there is suspected credential sharing, unauthorized penetration attempts, or violation of these terms.
                            </li>
                        </ul>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 3 */}
                    <section id="billing-plans" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            3. Pricing, Subscriptions, and Billing Cycles
                        </h2>
                        <p>
                            Paid subscriptions are billed on a recurring monthly or annual basis:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                <strong>Subscription Tiers:</strong> Fees are calculated based on your selected plan tier and the active number of employee profiles in your database.
                            </li>
                            <li>
                                <strong>Price Alterations:</strong> We reserve the right to alter pricing plans. Subscribed organizations will receive a minimum of 30 days' advance notice via email before price changes are applied on their next renewal.
                            </li>
                            <li>
                                <strong>Tax Mandates:</strong> All prices published are exclusive of statutory taxes (such as GST in India), which will be itemized on the final Razorpay checkout invoice.
                            </li>
                        </ul>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 4 */}
                    <section id="razorpay-payments" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            4. Razorpay Gateway Terms & Conditions
                        </h2>
                        <p>
                            All paid license bills, auto-renewals, and add-on employee fees are processed via the secure **Razorpay** payment gateway.
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-lg">
                                <CreditCard className="w-5 h-5 text-[#6D5DFD]" />
                                Payment Gateway Protocols & Liabilities
                            </div>
                            <div className="space-y-3 text-sm">
                                <p>
                                    <strong>Payment Execution:</strong> By completing a purchase, you agree to provide Razorpay with valid card or bank info, and authorize them to deduct subscription fees on recurring intervals.
                                </p>
                                <p>
                                    <strong>Processing Failures:</strong> Macenza Tech is not liable for failed checkouts, bank declines, net banking delays, or fraudulent charges processed on Razorpay's end.
                                </p>
                                <p>
                                    <strong>Suspension for Non-payment:</strong> If Razorpay is unable to auto-debit your subscription fee on your renewal date, we provide a 7-day grace period. After 7 days, your HRMS workspace will be locked until outstanding invoices are settled.
                                </p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 5 */}
                    <section id="refund-cancellation" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-6 h-6 shrink-0" />
                            5. Detailed Refund & Cancellation Policy
                        </h2>
                        <p>
                            To comply with standard merchant guidelines and ensure seamless payment disputes:
                        </p>
                        <div className="bg-red-50/30 dark:bg-red-950/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/40 space-y-3 text-sm">
                            <p>
                                <strong>Subscription Cancellation:</strong> Subscribed workspace administrators can cancel their subscription at any time directly through the Billing panel of the admin dashboard. Upon cancellation, your workspace remains fully operational until the end of the currently paid billing period (monthly or annual), after which your service will downgrade, or account database will freeze.
                            </p>
                            <p>
                                <strong>Refund Window:</strong> We do not offer refunds, credits, or pro-rated calculations for partially used subscription cycles, unused seat allocations, or immediate cancellations. All transactions executed through Razorpay are final.
                            </p>
                            <p>
                                <strong>Refund Exceptions:</strong> In the event of a double-charge or billing calculation error arising directly from our database software, you must submit a ticket to info@macenza.com with proof of transaction within 48 hours of payment.
                            </p>
                            <p>
                                <strong>Refund Credit Timelines:</strong> Once an exception is verified and approved by the Macenza Tech billing team, the refund request will be forwarded to Razorpay. **Approved refunds will be processed and credited to the original payment source (Credit Card, Debit Card, Net Banking, or UPI Account) within 5 to 7 business days** in accordance with banking guidelines.
                            </p>
                        </div>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 6 */}
                    <section id="acceptable-use" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            6. Acceptable Use Policy
                        </h2>
                        <p>
                            When using MACENZA HRMS, you agree not to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>
                                Reverse engineer, decompile, or copy the codebase, algorithms, and design systems of the portal.
                            </li>
                            <li>
                                Automate check-in logs or database entry using scripts, bots, or unauthorized scraping APIs.
                            </li>
                            <li>
                                Submit fraudulent calculations, negative loan requests, or inaccurate data to manipulate calculations.
                            </li>
                            <li>
                                Bypass database separation filters to view details of other organization workspaces.
                            </li>
                        </ul>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 7 */}
                    <section id="data-license" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            7. Intellectual Property & Corporate License
                        </h2>
                        <p>
                            All software code, visual graphics, logos, gradients, database structures, templates, widgets, and text elements inside the MACENZA SaaS platform are the exclusive intellectual property of Macenza Tech.
                        </p>
                        <p>
                            Subscribing companies are granted a limited, revocable, non-transferable, and non-exclusive license to log in and use the features solely for their internal human resource operations during the paid subscription duration.
                        </p>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 8 */}
                    <section id="sla-uptime" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            8. Availability, SLA, and Service Exclusions
                        </h2>
                        <p>
                            We make commercially reasonable efforts to maintain an uptime rate of 99.9%. 
                        </p>
                        <p>
                            Uptime calculations exclude scheduled maintenance blocks (usually performed outside standard business hours), hosting provider outages, regional network fiber cuts, or Razorpay payment verification server delays.
                        </p>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 9 */}
                    <section id="limitation-liability" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            9. Limitation of Liability & Indemnification
                        </h2>
                        <p>
                            <strong>Employer Verification Duty:</strong> MACENZA computes mathematical allowances, check-in totals, tax parameters, and loan balances based on configurations entered by administrators. The subscribing Employer retains the final duty to check, verify, and approve all payroll and tax outputs before executing employee transfers. Macenza Tech shall not be liable for underpayments, overpayments, tax filing errors, or compliance penalties resulting from software calculations.
                        </p>
                        <p>
                            <strong>Maximum Financial Liability:</strong> In no event shall Macenza Tech's total liability for any dispute arising out of these terms exceed the total amount paid by the customer in the twelve (12) months preceding the dispute event.
                        </p>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 10 */}
                    <section id="governing-law" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            10. Governing Law & Dispute Jurisdiction
                        </h2>
                        <p>
                            These Terms & Conditions shall be governed, parsed, and construed in accordance with the laws of **India**. Any legal actions, billing disputes, claims, or contract issues arising from your use of the portal shall be subject to the exclusive jurisdiction of the courts located in **Ajmer, Rajasthan, India**.
                        </p>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    {/* Section 11 */}
                    <section id="merchant-contact" className="space-y-4 scroll-mt-24">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            11. Merchant Details & Support Contact
                        </h2>
                        <p>
                            For inquiries, cancellation support, billing errors, or technical questions, please contact the merchant of record:
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2 text-sm">
                            <p className="font-bold text-gray-900 dark:text-white text-lg">MACENZA Support Office</p>
                            <p><strong>Merchant/Entity Name:</strong> Macenza Tech</p>
                            <p><strong>Support Email:</strong> info@macenza.com</p>
                            <p><strong>Phone:</strong> +91 9414660123</p>
                            <p><strong>Physical Address:</strong> Siddhart Nagar, Mayo Link Road, Ajmer, Rajasthan, India, 305001</p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
