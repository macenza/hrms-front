'use client';

import React, { useMemo } from 'react';
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
    rawDob?: string; // Used for accurate math calculations
}

interface PersonalInfoTabProps {
    data: PersonalInfoData;
    onScheduleWish?: () => void;
}

// Helper: Calculate days remaining until next birthday
const calculateDaysToBirthday = (dobString?: string) => {
    if (!dobString) return undefined;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return undefined;

    const today = new Date();
    // Set current year to the birth date to find THIS year's birthday
    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

    // If the birthday passed this year, look at next year
    if (today > nextBirthday) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
            <span className={!value || value === 'N/A' ? 'text-gray-400 italic font-normal' : ''}>
                {value || 'Not provided'}
            </span>
        </div>
    </div>
);

export default function PersonalInfoTab({
    data,
    onScheduleWish
}: PersonalInfoTabProps) {
    
    // Safety fallback
    if (!data) return null;

    // Derived values
    const firstName = data.fullName ? data.fullName.split(' ')[0] : 'Employee';
    const daysToBirthday = useMemo(() => calculateDaysToBirthday(data.rawDob), [data.rawDob]);
    
    // Format the DOB for the birthday card ("October 24")
    const formattedBirthday = useMemo(() => {
        if (!data.rawDob) return '';
        const date = new Date(data.rawDob);
        return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }, [data.rawDob]);

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

            {/* Right Sidebar - Birthday Reminder (Only shows if birthday is within 30 days) */}
            <div className="space-y-6">
                {daysToBirthday !== undefined && daysToBirthday <= 30 && (
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
                                {firstName}'s birthday is coming up in <span className="font-bold text-blue-600">{daysToBirthday === 0 ? 'today' : `${daysToBirthday} days`}</span>!
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