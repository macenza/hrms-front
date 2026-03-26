'use client';

import React from 'react';
import { Mail, Phone, MapPin, Gift, User, Calendar, Hash } from 'lucide-react';

// UI Components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Data Contract for Backend Integration
export interface PersonalInfoData {
    fullName: string;
    dob: string;
    fathersName: string;
    registrationNo: string;
    email: string;
    phone: string;
    address: string;
    daysToBirthday?: number; // Backend can calculate and send this
}

interface PersonalInfoTabProps {
    data?: PersonalInfoData;
    onScheduleWish?: () => void;
}

// Mock Data Fallback
const mockPersonalInfo: PersonalInfoData = {
    fullName: 'Alice Johnson',
    dob: 'Oct 24, 1995',
    fathersName: 'Robert Johnson',
    registrationNo: 'REG-2023-89',
    email: 'alice@macenza.com',
    phone: '+1 234 567 890',
    address: '123 Business Park, Tech City, San Francisco, CA 94105',
    daysToBirthday: 3,
};

// Reusable Detail Item Helper
const DetailItem = ({
    label,
    value,
    icon: Icon,
    iconColor = "text-gray-400"
}: {
    label: string,
    value: string,
    icon: any,
    iconColor?: string
}) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-start gap-2 text-gray-900 font-medium">
            <Icon size={16} className={`${iconColor} mt-0.5 shrink-0`} />
            <span>{value}</span>
        </div>
    </div>
);

export default function PersonalInfoTab({
    data = mockPersonalInfo,
    onScheduleWish
}: PersonalInfoTabProps) {

    // Extract first name for the personalized birthday message
    const firstName = data.fullName.split(' ')[0];

    // Format the DOB to extract just the month and day (e.g., "October 24") for the birthday card
    // This assumes the backend sends a format that Date() can parse, or you can adjust accordingly
    const birthDateObj = new Date(data.dob);
    const formattedBirthday = birthDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">

            {/* Main Details - Takes up 2 columns on large screens */}
            <div className="lg:col-span-2 space-y-6">

                {/* Basic Details */}
                <Card className="border-gray-200 shadow-sm bg-gray-50/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Basic Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="Full Name" value={data.fullName} icon={User} />
                            <DetailItem label="Date of Birth" value={data.dob} icon={Calendar} />
                            <DetailItem label="Father's Name" value={data.fathersName} icon={User} />
                            <DetailItem label="Registration No" value={data.registrationNo} icon={Hash} />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <Card className="border-gray-200 shadow-sm bg-gray-50/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg">Contact Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="Email ID" value={data.email} icon={Mail} iconColor="text-blue-500" />
                            <DetailItem label="Phone Number" value={data.phone} icon={Phone} iconColor="text-emerald-500" />
                            <div className="md:col-span-2">
                                <DetailItem label="Current Address" value={data.address} icon={MapPin} iconColor="text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Sidebar - Birthday Reminder */}
            <div className="space-y-6">
                {data.daysToBirthday !== undefined && data.daysToBirthday <= 30 && (
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20 relative overflow-hidden shadow-sm">
                        {/* Background floating icon */}
                        <div className="absolute -right-4 -top-4 text-blue-500/10 rotate-12 pointer-events-none">
                            <Gift size={100} />
                        </div>

                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 mb-4">
                                <Gift size={24} />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">Birthday Reminder</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {firstName}'s birthday is coming up in <span className="font-bold text-blue-600">{data.daysToBirthday} days</span>!
                            </p>

                            <div className="bg-white/60 rounded-lg p-3 text-center mb-4">
                                <p className="text-xs text-gray-500 font-bold uppercase">{formattedBirthday}</p>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full shadow-sm shadow-blue-500/20"
                                onClick={onScheduleWish}
                            >
                                Schedule Wish
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}