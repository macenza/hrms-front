import React from 'react';
import { Mail, Phone, MapPin, Gift, User, Calendar, Hash } from 'lucide-react';

export default function PersonalInfoTab() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            
            {/* Main Details - Takes up 2 columns on large screens */}
            <div className="lg:col-span-2 space-y-6">
                {/* Basic Details */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                <User size={16} className="text-gray-400" />
                                Alice Johnson
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date of Birth</p>
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                <Calendar size={16} className="text-gray-400" />
                                Oct 24, 1995
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Father's Name</p>
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                <User size={16} className="text-gray-400" />
                                Robert Johnson
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Registration No</p>
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                <Hash size={16} className="text-gray-400" />
                                REG-2023-89
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email ID</p>
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                <Mail size={16} className="text-[#4F7CF3]" />
                                alice@macenza.com
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone Number</p>
                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                <Phone size={16} className="text-green-500" />
                                +1 234 567 890
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Address</p>
                            <div className="flex items-start gap-2 text-gray-900 font-medium">
                                <MapPin size={16} className="text-red-400 mt-0.5" />
                                123 Business Park, Tech City, San Francisco, CA 94105
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Birthday Reminder */}
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#4F7CF3]/10 to-purple-500/10 rounded-xl p-6 border border-[#4F7CF3]/20 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 text-[#4F7CF3]/10 rotate-12">
                        <Gift size={100} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#4F7CF3] mb-4">
                            <Gift size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Birthday Reminder</h3>
                        <p className="text-sm text-gray-600 mb-4">Alice's birthday is coming up in <span className="font-bold text-[#4F7CF3]">3 days</span>!</p>
                        
                        <div className="bg-white/60 rounded-lg p-3 text-center mb-4">
                            <p className="text-xs text-gray-500 font-bold uppercase">October 24</p>
                        </div>

                        <button className="w-full py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-semibold hover:bg-[#3A62D7] transition-colors shadow-sm">
                            Schedule Wish
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}