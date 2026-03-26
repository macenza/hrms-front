'use client';

import React, { useState } from 'react';
import { MessageSquare, Plus, Lock } from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/Button';

// Data Contract for Backend Integration
export interface NoteRecord {
    id: string;
    text: string;
    authorName: string;
    authorRole?: string;
    createdAt: string; // ISO string or formatted date from backend
}

interface NotesTabProps {
    notes?: NoteRecord[];
    onAddNote?: (text: string) => void;
}

// Mock Data Fallback
const mockNotes: NoteRecord[] = [
    {
        id: 'NOTE-001',
        text: "Completed probation period successfully. Recommended for confirmation.",
        authorName: "Sarah Connor",
        authorRole: "Manager",
        createdAt: "Oct 15, 2023 - 10:00 AM",
    },
    {
        id: 'NOTE-002',
        text: "Discussed Q4 goals. Needs focus on design system documentation.",
        authorName: "Thomas Anree",
        authorRole: "HR",
        createdAt: "Sep 28, 2023 - 02:30 PM",
    }
];

export default function NotesTab({
    notes = mockNotes,
    onAddNote
}: NotesTabProps) {

    // Controlled State for the Input
    const [newNoteText, setNewNoteText] = useState('');

    // Submission Handler
    const handleSubmit = () => {
        // Prevent empty submissions
        if (!newNoteText.trim()) return;

        if (onAddNote) {
            onAddNote(newNoteText);
        } else {
            console.log('New Note Payload:', newNoteText);
        }

        // Clear the input after submission
        setNewNoteText('');
    };

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
                    className="w-full text-sm text-gray-700 resize-none outline-none bg-transparent placeholder-gray-400 min-h-[80px]"
                />
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">
                        {newNoteText.length} characters
                    </p>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!newNoteText.trim()} // Automatically disable if empty
                        className="gap-2 shadow-sm"
                    >
                        <Plus size={16} strokeWidth={2.5} />
                        Add Note
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