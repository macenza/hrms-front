import React from 'react';

export const metadata = {
    title: 'Our Story & Mission | MACENZA HRMS',
    description: 'Learn about the vision, story, and core values that drive the MACENZA engineering team.',
};

export default function AboutPage() {
    const values = [
        {
            title: 'Precision-First Engineering',
            description: 'Financial compliance and computational mathematics are at the core of our platform. We verify all algorithms against strict operational standards to deliver complete accuracy.',
        },
        {
            title: 'Radical User Simplicity',
            description: 'Enterprise tools do not need to be dense or outdated. We craft highly intuitive layouts, harmonized custom themes, and fast, responsive interfaces that teams love using.',
        },
        {
            title: 'Unyielding Operational Security',
            description: 'We treat corporate data, bank accounts, and personal records with the highest grade of security, enforcing encryption in-transit and at-rest across all workspaces.',
        },
    ];

    return (
        <div className="py-20 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#6D5DFD] bg-[#6D5DFD]/10 px-3.5 py-1.5 rounded-full">
                    Our Mission
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    Empowering HR Teams to <br />
                    <span className="bg-gradient-to-r from-[#6D5DFD] to-[#8B7BFF] bg-clip-text text-transparent">
                        Build Thriving Workspaces
                    </span>
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                    MACENZA is built by an elite engineering team dedicated to modernizing workforce payroll, leaf management, asset allocation, and team collaboration.
                </p>
            </div>

            {/* Core Narrative / Vision */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
                <div className="space-y-6">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        We are building the operating system for modern business operations.
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                        Historically, HR software has been heavy, fragmented, and prone to mathematical inaccuracies. Companies are forced to jump between spreadsheet calculators, isolated check-in trackers, and legacy database systems just to run a single monthly payroll run.
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                        MACENZA integrates all employee records, loan balances, dynamic allowances, check-in data, and asset compliance registries into a single secure platform. We run asynchronous calculations in background worker batches, rendering immediate calculations and cloud downloads on demand.
                    </p>
                </div>
                <div className="relative rounded-3xl overflow-hidden aspect-video bg-gradient-to-tr from-[#6D5DFD] to-[#8B7BFF] p-1 flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-none">
                    <div className="w-full h-full rounded-[20px] bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <span className="text-6xl font-black text-[#6D5DFD]">50,000+</span>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">
                            Daily active computations running at the edge
                        </p>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-20">
                <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-12 tracking-tight">
                    Our Core Values
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {values.map((v, idx) => (
                        <div key={idx} className="bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-850 p-8 rounded-2xl">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                                {v.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {v.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
