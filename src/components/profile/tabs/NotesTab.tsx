'use client';

import React, { useState } from 'react';
import { MessageSquare, Plus, Lock, Loader2 } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/Button';

// Data Contract for Backend Integration
export interface NoteRecord {
    id: string;
    text: string;
    authorName: string;
    authorRole?: string;
    createdAt: string; 
}

interface NotesTabProps {
    notes?: NoteRecord[];
    isLoading?: boolean;
    onAddNote?: (text: string) => Promise<void>; // Updated to handle async operations
}

export default function NotesTab({
    notes = [],
    isLoading = false,
    onAddNote
}: NotesTabProps) {
    const [newNoteText, setNewNoteText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!newNoteText.trim()) return;
        
        setIsSubmitting(true);
        try {
            if (onAddNote) {
                await onAddNote(newNoteText);
            }
            // Clear the input only if the upload succeeds
            setNewNoteText('');
        } catch (error) {
            console.error("Failed to add note", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-sm text-gray-500 font-medium">Loading secure notes...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl animate-in fade-in duration-300">
            {/* Header */}
            <h2 className="text-lg font-bold text-gray-900 mb-2">HR Notes & Remarks</h2>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
                <Lock size={14} className="text-gray-400" />
                <p>Private notes regarding this employee. These are not visible to the employee.</p>
            </div>

            {/* Add Note Area */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600 transition-all">
                <textarea
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Type a new private note here..."
                    disabled={isSubmitting}
                    className="w-full text-sm text-gray-700 resize-none outline-none bg-transparent placeholder-gray-400 min-h-[80px] disabled:opacity-50"
                />
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">
                        {newNoteText.length} characters
                    </p>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!newNoteText.trim() || isSubmitting}
                        className="gap-2 shadow-sm min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Plus size={16} strokeWidth={2.5} />
                                Add Note
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Notes Timeline Feed */}
            <div className="space-y-4">
                {notes.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 border border-gray-200 border-dashed rounded-xl">
                        <p className="text-sm font-semibold text-gray-500">No notes added yet.</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} className="flex gap-4 p-5 bg-gray-50 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
                            <div className="mt-1 shrink-0 p-2 bg-blue-100 text-blue-600 rounded-full h-fit">
                                <MessageSquare size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">
                                    "{note.text}"
                                </p>
                                <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-gray-500">
                                    <span className="text-gray-900 font-bold">{note.authorName}</span>
                                    {note.authorRole && (
                                        <span className="px-1.5 py-0.5 bg-gray-200/60 rounded text-gray-600">
                                            {note.authorRole}
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span>{note.createdAt}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}