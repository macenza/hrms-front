import React from 'react';
import { 
    Users, DollarSign, CalendarCheck, Package, 
    Briefcase, ShieldCheck, BarChart3, Clock 
} from 'lucide-react';

export const metadata = {
    title: 'Platform Features | MACENZA HRMS',
    description: 'Explore the powerful modules and features of the MACENZA HRMS platform.',
};

export default function FeaturesPage() {
    const modules = [
        {
            icon: Users,
            title: 'Employee Directory & Profiles',
            description: 'Maintain a single source of truth for employee data, compliance documents, personal files, and organizational structures.',
        },
        {
            icon: DollarSign,
            title: 'Automated Payroll Engine',
            description: 'Calculate base salary, allowances, dynamic deductions (EPF, ESIC, Tax), LWP, and generate draft sheets in seconds.',
        },
        {
            icon: CalendarCheck,
            title: 'Leave & Attendance Tracking',
            description: 'Streamline check-ins, tracking, shift planning, and leave requests with custom approval flows and automatic capping.',
        },
        {
            icon: Package,
            title: 'Asset Management Lifecycle',
            description: 'Track hardware, software licenses, dynamic assignments, return statuses, and maintenance logs for audit readiness.',
        },
        {
            icon: Briefcase,
            title: 'Project & Workspace Planner',
            description: 'Align task boards, dynamic sprints, project timelines, and task assignments seamlessly within team workspaces.',
        },
        {
            icon: ShieldCheck,
            title: 'Enterprise RBAC & Security',
            description: 'Enforce granular role-based access control (Admin, HR, Manager, Employee) with enterprise-grade SSL data encryption.',
        },
    ];

    return (
        <div className="py-20 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                {/* <span className="text-xs font-bold uppercase tracking-widest text-[#6D5DFD] bg-[#6D5DFD]/10 px-3.5 py-1.5 rounded-full">
                    SaaS Platform
                </span> */}
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                    Powerful Modules for <br />
                    <span className="bg-gradient-to-r from-[#6D5DFD] to-[#8B7BFF] bg-clip-text text-transparent">
                        Modern Human Resources
                    </span>
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400">
                    MACENZA empowers HR professionals and administrators to eliminate manual spreadsheets, mitigate computational errors, and scale operations seamlessly.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {modules.map((m, idx) => {
                    const Icon = m.icon;
                    return (
                        <div 
                            key={idx} 
                            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 rounded-xl bg-[#6D5DFD]/10 text-[#6D5DFD] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                {m.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {m.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
