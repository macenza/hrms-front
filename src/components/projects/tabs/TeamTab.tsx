'use client';

import React, { useState } from 'react';
import { Users, UserPlus, X, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface TeamTabProps {
    projectId: string;
    teamAvatars: string[];
    onUpdateTeam: (newTeam: string[]) => Promise<void>;
}

export default function TeamTab({ projectId, teamAvatars = [], onUpdateTeam }: TeamTabProps) {
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAvatarUrl.trim()) return;
        setIsSaving(true);
        try {
            const updatedTeam = [...teamAvatars, newAvatarUrl];
            await onUpdateTeam(updatedTeam);
            setNewAvatarUrl(''); 
        } catch (error) {
            alert('Failed to add team member.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveMember = async (indexToRemove: number) => {
        if (!window.confirm("Remove this team member?")) return;
        setIsSaving(true);
        try {
            const updatedTeam = teamAvatars.filter((_, index) => index !== indexToRemove);
            await onUpdateTeam(updatedTeam);
        } catch (error) {
            alert('Failed to remove team member.');
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
                        Project Team ({teamAvatars.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    
                    {/* Add Member Form */}
                    <form 
                        onSubmit={handleAddMember} 
                        className="flex flex-col sm:flex-row sm:items-end gap-3 mb-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors"
                    >
                        <div className="flex-1">
                            <Input
                                label="Add Team Member (Avatar URL)"
                                placeholder="https://i.pravatar.cc/150?u=new_user"
                                value={newAvatarUrl}
                                onChange={(e) => setNewAvatarUrl(e.target.value)}
                                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950"
                            />
                        </div>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            disabled={isSaving || !newAvatarUrl.trim()} 
                            className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none font-semibold w-full sm:w-auto"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                            Add Member
                        </Button>
                    </form>

                    {/* Team Grid */}
                    {teamAvatars.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-xl transition-colors">
                            <Users size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3 transition-colors" />
                            <p className="font-semibold text-gray-900 dark:text-gray-100 transition-colors">No team members assigned yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {teamAvatars.map((avatar, index) => (
                                <div 
                                    key={index} 
                                    className="relative group bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm dark:shadow-none hover:border-blue-300 dark:hover:border-blue-900/50 transition-all duration-300"
                                >
                                    <img
                                        src={avatar}
                                        alt={`Team member ${index + 1}`}
                                        className="w-16 h-16 rounded-full object-cover shadow-sm dark:shadow-none mb-3 border-2 border-white dark:border-gray-900 transition-colors"
                                        onError={(e) => (e.currentTarget.src = 'https://i.pravatar.cc/150?u=fallback')}
                                    />
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors">Member {index + 1}</p>
                                    
                                    <button
                                        onClick={() => handleRemoveMember(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 dark:hover:bg-red-500/20"
                                        title="Remove member"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}