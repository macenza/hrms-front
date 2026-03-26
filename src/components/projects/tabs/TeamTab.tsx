'use client';

import React from 'react';
import { Mail, MessageCircle, MoreVertical, Plus, Users } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Data Contracts for Backend Integration
export interface TeamMember {
    id: string;
    name: string;
    role: string;
    department: string;
    avatar?: string | null;
    email?: string;
}

interface TeamTabProps {
    team?: TeamMember[];
    onAddMember?: () => void;
    onChat?: (memberId: string) => void;
    onEmail?: (email: string) => void;
    onActionClick?: (memberId: string) => void;
}

// Mock Data Fallback
const mockTeam: TeamMember[] = [
    { id: 'EMP001', name: 'Alice Johnson', role: 'UX Designer', department: 'Design', avatar: 'https://i.pravatar.cc/150?u=1', email: 'alice@macenza.com' },
    { id: 'EMP002', name: 'Bob Smith', role: 'Frontend Developer', department: 'Engineering', avatar: 'https://i.pravatar.cc/150?u=2', email: 'bob@macenza.com' },
    { id: 'EMP003', name: 'Charlie Brown', role: 'Product Manager', department: 'Product', avatar: 'https://i.pravatar.cc/150?u=3', email: 'charlie@macenza.com' },
    { id: 'EMP006', name: 'Sarah Lee', role: 'Marketing Lead', department: 'Marketing', avatar: 'https://i.pravatar.cc/150?u=6', email: 'sarah@macenza.com' },
];

// Dynamic UI Helpers
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

const getAvatarColor = (name: string) => {
    const colors = [
        'bg-blue-100 text-blue-700',
        'bg-green-100 text-green-700',
        'bg-purple-100 text-purple-700',
        'bg-orange-100 text-orange-700',
        'bg-pink-100 text-pink-700'
    ];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
};

export default function TeamTab({
    team = mockTeam,
    onAddMember,
    onChat,
    onEmail,
    onActionClick
}: TeamTabProps) {

    return (
        <div className="animate-in fade-in duration-300">

            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Project Team</h2>
                    <p className="text-sm text-gray-500 mt-1">People actively collaborating on this project.</p>
                </div>
                <Button
                    variant="primary"
                    onClick={onAddMember}
                    className="gap-2 shadow-sm shadow-blue-500/30 w-full sm:w-auto"
                >
                    <Plus size={18} strokeWidth={2.5} />
                    Add Member
                </Button>
            </div>

            {/* Team Grid */}
            {team.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center bg-gray-50 border border-gray-200 border-dashed rounded-xl">
                    <div className="p-4 bg-white rounded-full text-gray-400 mb-4 shadow-sm">
                        <Users size={32} />
                    </div>
                    <p className="text-base font-bold text-gray-900">No team members yet</p>
                    <p className="text-sm text-gray-500 mt-1 max-w-sm">
                        Click the "Add Member" button above to start assigning people to this project.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {team.map((member) => (
                        <Card key={member.id} className="relative flex flex-col items-center text-center p-6 shadow-sm hover:shadow-md transition-all group border-gray-200">

                            {/* Context Menu Action */}
                            <div className="absolute top-4 right-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onActionClick && onActionClick(member.id)}
                                    className="p-1.5 h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                                    aria-label="Member options"
                                >
                                    <MoreVertical size={18} />
                                </Button>
                            </div>

                            {/* Avatar Section */}
                            <div className="mb-4">
                                {member.avatar ? (
                                    <img
                                        src={member.avatar}
                                        alt={member.name}
                                        className="w-20 h-20 rounded-full border-4 border-gray-50 object-cover shadow-sm group-hover:border-blue-50 transition-colors"
                                    />
                                ) : (
                                    <div className={cn(
                                        "w-20 h-20 rounded-full border-4 border-gray-50 shadow-sm flex items-center justify-center text-2xl font-bold group-hover:border-blue-50 transition-colors",
                                        getAvatarColor(member.name)
                                    )}>
                                        {getInitials(member.name)}
                                    </div>
                                )}
                            </div>

                            {/* Employee Details */}
                            <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                            <p className="text-sm text-blue-600 font-semibold mb-1">{member.role}</p>
                            <p className="text-xs text-gray-500 mb-6">{member.department}</p>

                            {/* Quick Actions Footer */}
                            <div className="flex items-center gap-3 w-full border-t border-gray-100 pt-4 mt-auto">
                                <button
                                    onClick={() => onChat && onChat(member.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                >
                                    <MessageCircle size={16} /> Chat
                                </button>
                                <button
                                    onClick={() => onEmail && member.email && onEmail(member.email)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                                >
                                    <Mail size={16} /> Email
                                </button>
                            </div>

                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}