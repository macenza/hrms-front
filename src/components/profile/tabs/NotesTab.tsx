'use client';

import React, { useState } from 'react';
import { MessageSquare, Plus, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

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
    onAddNote?: (text: string) => Promise<void>; 
}

// Premium Skeleton Loader
const NoteSkeleton = () => (
    <div className="flex gap-4 p-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse transition-colors">
        <div className="mt-1 shrink-0 p-2 w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
        <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-32" />
            </div>
        </div>
    </div>
);

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
            setNewNoteText('');
        } catch (error) {
            console.error("Failed to add note", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">HR Notes & Remarks</h2>
            <div className="flex items-start sm:items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6 transition-colors">
                <Lock size={14} className="text-gray-400 dark:text-gray-500 shrink-0 mt-0.5 sm:mt-0" />
                <p>Official notes and remarks regarding this employee.</p>
            </div>

            {/* Input Area */}
            {onAddNote && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-8 shadow-sm focus-within:ring-2 focus-within:ring-blue-600/20 dark:focus-within:ring-blue-500/40 focus-within:border-blue-600 dark:focus-within:border-blue-500 transition-all duration-300">
                    <textarea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Type a new private note here..."
                        disabled={isSubmitting}
                        className="w-full text-sm text-gray-700 dark:text-gray-300 resize-none outline-none bg-transparent placeholder-gray-400 dark:placeholder-gray-600 min-h-[80px] disabled:opacity-50 transition-colors"
                    />
                    <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100 dark:border-gray-800 transition-colors">
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium transition-colors">
                            {newNoteText.length} characters
                        </p>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={!newNoteText.trim() || isSubmitting}
                            className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none min-w-[120px] font-semibold"
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
            )}

            {/* Notes List */}
            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, idx) => <NoteSkeleton key={idx} />)
                ) : notes.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 border-dashed rounded-xl transition-colors">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 transition-colors">No notes added yet.</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div key={note.id} className="flex gap-4 p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-xl hover:shadow-sm dark:hover:shadow-none transition-all duration-300">
                            <div className="mt-1 shrink-0 p-2 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full h-fit transition-colors">
                                <MessageSquare size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-3 whitespace-pre-wrap transition-colors">
                                    "{note.text}"
                                </p>
                                <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors">
                                    <span className="text-gray-900 dark:text-gray-100 font-bold transition-colors">{note.authorName}</span>
                                    {note.authorRole && (
                                        <span className="px-1.5 py-0.5 bg-gray-200/60 dark:bg-gray-700/60 rounded text-gray-600 dark:text-gray-300 transition-colors">
                                            {note.authorRole}
                                        </span>
                                    )}
                                    <span>•</span>
                                    <span className="truncate">{note.createdAt}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}