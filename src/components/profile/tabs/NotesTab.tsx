'use client';

import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';

export default function NotesTab() {
    const notes = [
        {
            text: "Completed probation period successfully. Recommended for confirmation.",
            author: "Sarah Connor (Manager)",
            date: "Oct 15, 2023 - 10:00 AM",
        },
        {
            text: "Discussed Q4 goals. Needs focus on design system documentation.",
            author: "Thomas Anree (HR)",
            date: "Sep 28, 2023 - 02:30 PM",
        }
    ];

    return (
        <div className="max-w-4xl animate-in fade-in duration-300">
            <h2 className="text-lg font-bold text-gray-900 mb-2">HR Notes & Remarks</h2>
            <p className="text-sm text-gray-500 mb-6">Add private notes regarding this employee. These are not visible to the employee.</p>

            {/* Add Note Area */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-8 shadow-sm focus-within:ring-2 focus-within:ring-[#4F7CF3]/20 focus-within:border-[#4F7CF3] transition-all">
                <textarea 
                    placeholder="Type a new note here..."
                    className="w-full text-sm text-gray-700 resize-none outline-none bg-transparent placeholder-gray-400 min-h-[80px]"
                ></textarea>
                <div className="flex justify-end mt-2 pt-2 border-t border-gray-100">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#4F7CF3] text-white rounded-lg text-sm font-semibold hover:bg-[#3A62D7] transition-colors shadow-sm">
                        <Plus size={16} /> Add Note
                    </button>
                </div>
            </div>

            {/* Notes Timeline Feed */}
            <div className="space-y-4">
                {notes.map((note, idx) => (
                    <div key={idx} className="flex gap-4 p-5 bg-gray-50 border border-gray-100 rounded-xl">
                        <div className="mt-1 shrink-0 p-2 bg-blue-100 text-blue-600 rounded-full h-fit">
                            <MessageSquare size={16} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-800 leading-relaxed mb-3">"{note.text}"</p>
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                <span className="text-gray-900">{note.author}</span>
                                <span>•</span>
                                <span>{note.date}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}