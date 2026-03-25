'use client';

import React from 'react';
import { Mail, MessageCircle, MoreVertical, Plus } from 'lucide-react';

const mockTeam = [
    { id: 'EMP001', name: 'Alice Johnson', role: 'UX Designer', dept: 'Design', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: 'EMP002', name: 'Bob Smith', role: 'Frontend Developer', dept: 'Engineering', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 'EMP003', name: 'Charlie Brown', role: 'Product Manager', dept: 'Product', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 'EMP006', name: 'Sarah Lee', role: 'Marketing Lead', dept: 'Marketing', avatar: 'https://i.pravatar.cc/150?u=6' },
];

export default function TeamTab() {
    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Project Team</h2>
                    <p className="text-sm text-gray-500">People actively collaborating on this project.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] transition-colors shadow-sm shadow-blue-500/30">
                    <Plus size={16} strokeWidth={2.5} /> Add Member
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockTeam.map((member) => (
                    <div key={member.id} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all group">
                        <div className="w-full flex justify-end mb-2">
                            <button className="text-gray-400 hover:text-gray-700 transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                        
                        <img 
                            src={member.avatar} 
                            alt={member.name} 
                            className="w-20 h-20 rounded-full border-4 border-gray-50 mb-4 shadow-sm group-hover:border-blue-50 transition-colors"
                        />
                        
                        <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                        <p className="text-sm text-[#4F7CF3] font-semibold mb-1">{member.role}</p>
                        <p className="text-xs text-gray-500 mb-6">{member.dept}</p>

                        <div className="flex items-center gap-3 w-full border-t border-gray-100 pt-4 mt-auto">
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">
                                <MessageCircle size={16} /> Chat
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">
                                <Mail size={16} /> Email
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}