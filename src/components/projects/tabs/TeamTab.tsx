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
            // Push the new avatar to the existing array
            const updatedTeam = [...teamAvatars, newAvatarUrl];
            await onUpdateTeam(updatedTeam);
            setNewAvatarUrl(''); // Clear input on success
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
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users size={20} className="text-blue-600" />
                        Project Team ({teamAvatars.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    {/* Add Member Form */}
                    <form onSubmit={handleAddMember} className="flex items-end gap-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex-1">
                            <Input
                                label="Add Team Member (Avatar URL)"
                                placeholder="https://i.pravatar.cc/150?u=new_user"
                                value={newAvatarUrl}
                                onChange={(e) => setNewAvatarUrl(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="primary" disabled={isSaving || !newAvatarUrl.trim()} className="gap-2">
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                            Add Member
                        </Button>
                    </form>

                    {/* Team Grid */}
                    {teamAvatars.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                            <Users size={32} className="mx-auto text-gray-300 mb-3" />
                            <p>No team members assigned yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {teamAvatars.map((avatar, index) => (
                                <div key={index} className="relative group bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-300 transition-all">
                                    <img
                                        src={avatar}
                                        alt={`Team member ${index + 1}`}
                                        className="w-16 h-16 rounded-full object-cover shadow-sm mb-3"
                                        onError={(e) => (e.currentTarget.src = 'https://i.pravatar.cc/150?u=fallback')} // Fallback if image breaks
                                    />
                                    <p className="text-xs font-medium text-gray-500">Member {index + 1}</p>

                                    <button
                                        onClick={() => handleRemoveMember(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
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