// src/components/profile/tabs/PersonalInfoTab.tsx
'use client';

import React, { useMemo } from 'react';
import { Mail, Phone, MapPin, Gift, User, Calendar, Hash } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

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

const calculateDaysToBirthday = (dobString?: string) => {
    if (!dobString) return undefined;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return undefined;
    const today = new Date();
    const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    
    if (today > nextBirthday) {
        nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const DetailItem = ({
    label,
    value,
    icon: Icon,
    iconColor = "text-gray-400 dark:text-gray-500"
}: {
    label: string,
    value?: string,
    icon: any,
    iconColor?: string
}) => (
    <div className="min-w-0 w-full overflow-hidden">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 transition-colors">
            {label}
        </p>
        <div className="flex items-start gap-2 text-gray-900 dark:text-gray-100 font-medium transition-colors w-full overflow-hidden">
            <Icon size={16} className={cn(iconColor, "mt-0.5 shrink-0 transition-colors")} />
            <div className="min-w-0 flex-1 overflow-x-auto scrollbar-thin">
                <span className={cn(
                    "block max-w-full",
                    !value || value === 'N/A' ? 'text-gray-400 dark:text-gray-500 italic font-normal transition-colors' : 'transition-colors'
                )}>
                    {value || 'Not provided'}
                </span>
            </div>
        </div>
    </div>
);

export default function PersonalInfoTab({
    data,
    onScheduleWish
}: PersonalInfoTabProps) {
    if (!data) return null;

    const firstName = data.fullName ? data.fullName.split(' ')[0] : 'Employee';
    const daysToBirthday = useMemo(() => calculateDaysToBirthday(data.rawDob), [data.rawDob]);
    
    const formattedBirthday = useMemo(() => {
        if (!data.rawDob) return '';
        const date = new Date(data.rawDob);
        return isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }, [data.rawDob]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="lg:col-span-2 space-y-6">
                
                {/* Basic Details Card */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-300">
                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 transition-colors">
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100 transition-colors">Basic Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="Full Name" value={data.fullName} icon={User} />
                            <DetailItem label="Date of Birth" value={data.dob} icon={Calendar} />
                            <DetailItem label="Father's Name" value={data.fathersName} icon={User} />
                            <DetailItem label="Registration No" value={data.registrationNo} icon={Hash} />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info Card */}
                <Card className="border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none bg-gray-50/50 dark:bg-gray-900/50 transition-colors duration-300">
                    <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800 transition-colors">
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100 transition-colors">Contact Info</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem 
                                label="Email ID" 
                                value={data.email} 
                                icon={Mail} 
                                iconColor="text-blue-500 dark:text-blue-400" 
                            />
                            <DetailItem 
                                label="Phone Number" 
                                value={data.phone} 
                                icon={Phone} 
                                iconColor="text-emerald-500 dark:text-emerald-400" 
                            />
                            <div className="md:col-span-2 pt-2 border-t border-gray-100 dark:border-gray-800 transition-colors">
                                <DetailItem 
                                    label="Current Address" 
                                    value={data.address} 
                                    icon={MapPin} 
                                    iconColor="text-red-500 dark:text-red-400" 
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar Widgets */}
            <div className="space-y-6">
                {/* Birthday Reminder Widget */}
                {daysToBirthday !== undefined && daysToBirthday <= 30 && (
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-xl p-6 border border-blue-500/20 dark:border-blue-500/30 relative overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
                        
                        <div className="absolute -right-4 -top-4 text-blue-500/10 dark:text-blue-500/20 rotate-12 pointer-events-none transition-colors">
                            <Gift size={100} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm dark:shadow-none text-blue-600 dark:text-blue-400 mb-4 transition-colors">
                                <Gift size={24} />
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors">Birthday Reminder</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 transition-colors">
                                {firstName}'s birthday is coming up in <span className="font-bold text-blue-600 dark:text-blue-400 transition-colors">{daysToBirthday === 0 ? 'today' : `${daysToBirthday} days`}</span>!
                            </p>
                            
                            <div className="bg-white/60 dark:bg-gray-900/60 rounded-lg p-3 text-center mb-4 transition-colors">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase transition-colors">{formattedBirthday}</p>
                            </div>
                            
                            <Button
                                variant="primary"
                                className="w-full shadow-sm shadow-blue-500/25 dark:shadow-none font-semibold"
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