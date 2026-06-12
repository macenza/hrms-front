'use client';

import React, { useState } from 'react';
import { Users, UserPlus, X, Loader2, Search, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import { useEmployees } from '@/hooks/api/useEmployees';
import { getAvatarUrl, getInitials } from '@/utils/avatarUtils';

interface TeamTabProps {
    projectId: string;
    teamAvatars: any[]; 
    onUpdateTeam: (newTeam: string[]) => Promise<void>;
    canManageTeam?: boolean;
}

export default function TeamTab({ projectId, teamAvatars = [], onUpdateTeam, canManageTeam = false }: TeamTabProps) {
    const teamMembers = teamAvatars;
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Dynamic employee lookup from existing global system employees
    const { data: employeesData, isLoading: isSearching } = useEmployees({
        page: 1,
        limit: 100,
        searchTerm,
        filters: { department: '', role: '', status: 'Active', joiningDate: '' }
    });

    const employees = employeesData?.employees || [];

    const handleAddMember = async (emp: any) => {
        const empId = emp.id || emp._id;
        const exists = teamMembers.some(member => (member._id === empId || member.id === empId));
        if (exists) {
            toast.warning(`${emp.name} is already in the project team.`);
            return;
        }

        setIsSaving(true);
        try {
            const updatedTeamIds = [...teamMembers.map(member => member._id || member.id), empId];
            await onUpdateTeam(updatedTeamIds);
            setSearchTerm('');
            setShowDropdown(false);
            toast.success(`${emp.name} added to team successfully!`);
        } catch (error) {
            toast.error('Failed to add team member.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!window.confirm("Remove this team member?")) return;
        setIsSaving(true);
        try {
            const updatedTeamIds = teamMembers
                .filter(member => (member._id !== memberId && member.id !== memberId))
                .map(member => member._id || member.id);
            await onUpdateTeam(updatedTeamIds);
            toast.success('Team member removed successfully!');
        } catch (error) {
            toast.error('Failed to remove team member.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl animate-in fade-in duration-300 space-y-6">
            <Card className="border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900 transition-colors">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4 transition-colors">
                    <CardTitle className="text-lg flex items-center gap-2 text-gray-900 dark:text-gray-100 transition-colors">
                        <Users size={20} className="text-blue-600 dark:text-blue-400" />
                        Project Team ({teamMembers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    
                    {/* Add Member Search Input */}
                    {canManageTeam && (
                        <div className="relative mb-8 bg-gray-50/50 dark:bg-gray-800/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 transition-all">
                            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 block transition-colors">
                                Search and Add Employee to Team
                            </label>
                            <div className="relative flex items-center z-50">
                                <Search size={18} className="absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none transition-colors" />
                                <Input
                                    placeholder="Search employees by name, email, or role..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    className="pl-11 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 w-full shadow-sm focus:ring-blue-500/20"
                                />
                                {searchTerm && (
                                    <button 
                                        onClick={() => { setSearchTerm(''); setShowDropdown(false); }}
                                        className="absolute right-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                                        type="button"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Autocomplete dropdown overlay */}
                            {showDropdown && (
                                <>
                                    <div className="absolute left-5 right-5 mt-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-900 transition-all animate-in fade-in duration-150">
                                        {isSearching ? (
                                            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                                                <Loader2 size={16} className="animate-spin text-blue-500" /> Searching...
                                            </div>
                                        ) : employees.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No active employees found matching search query.
                                            </div>
                                        ) : (
                                            employees.map((emp: any) => {
                                                const empId = emp.id || emp._id;
                                                const isAlreadyInTeam = teamMembers.some(m => (m._id === empId || m.id === empId));
                                                return (
                                                    <div
                                                        key={empId}
                                                        onClick={() => !isAlreadyInTeam && !isSaving && handleAddMember(emp)}
                                                        className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                                                            isAlreadyInTeam
                                                                ? 'bg-gray-50/50 dark:bg-gray-900/30 opacity-70 cursor-not-allowed'
                                                                : 'hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {emp.profile?.avatar ? (
                                                                <img
                                                                    src={getAvatarUrl(emp.profile.avatar) || ''}
                                                                    alt={emp.name}
                                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-800 shadow-sm transition-colors"
                                                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                                                    {getInitials(emp.name)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 transition-colors">{emp.name}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                                                                    {emp.email} • <span className="font-semibold text-blue-600 dark:text-blue-400">{emp.role}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {isAlreadyInTeam ? (
                                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100/70 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-2 py-1 rounded transition-colors">
                                                                Joined
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                                                Add to Team
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setShowDropdown(false)} />
                                </>
                            )}
                        </div>
                    )}

                    {/* Team Grid */}
                    {teamMembers.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-xl transition-colors">
                            <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3 transition-colors" />
                            <p className="font-semibold text-gray-900 dark:text-gray-100 transition-colors">No team members assigned yet.</p>
                            <p className="text-xs text-gray-400 mt-1">Use the search bar above to begin staffing the project.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {teamMembers.map((member) => (
                                <div 
                                    key={member._id || member.id} 
                                    className="relative group bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm dark:shadow-none hover:border-blue-300 dark:hover:border-blue-900/50 transition-all duration-300"
                                >
                                    {member.profile?.avatar ? (
                                        <img
                                            src={getAvatarUrl(member.profile.avatar) || ''}
                                            alt={member.name}
                                            className="w-16 h-16 rounded-full object-cover shadow-sm dark:shadow-none mb-3 border-2 border-white dark:border-gray-900 transition-all"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-400 mb-3 border-2 border-white dark:border-gray-900">
                                            {getInitials(member.name)}
                                        </div>
                                    )}
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 transition-colors text-center">{member.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors text-center line-clamp-1 mb-1">{member.email}</p>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded transition-colors">
                                        {member.role || 'Team Member'}
                                    </span>
                                    
                                    {canManageTeam && (
                                        <button
                                            onClick={() => handleRemoveMember(member._id || member.id)}
                                            className="absolute top-2.5 right-2.5 p-1.5 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 dark:hover:bg-red-500/20 shadow-sm"
                                            title="Remove member"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}