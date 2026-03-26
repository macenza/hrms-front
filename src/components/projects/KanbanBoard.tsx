'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Calendar, MessageSquare, Paperclip } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Button } from '@/components/ui/Button';
import TaskModal from './TaskModal';

// 1. Data Contracts for Backend Integration
export interface KanbanUser {
    id: string;
    name: string;
    avatarUrl?: string;
}

export interface KanbanTask {
    id: string;
    title: string;
    tag: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    comments: number;
    attachments: number;
    date: string; // e.g., 'Oct 24, 2023' (Year included for safe Date parsing)
    users: KanbanUser[];
}

export interface KanbanColumn {
    id: string;
    title: string;
    items: KanbanTask[];
}

export type KanbanBoardData = Record<string, KanbanColumn>;

interface KanbanBoardProps {
    projectId: string;
    initialData?: KanbanBoardData;
    onTaskMove?: (taskId: string, sourceColId: string, destColId: string, newIndex: number) => void;
    onTaskAdd?: (task: Partial<KanbanTask>) => void;
}

// 2. Mock Data Fallback
const mockUsers: Record<string, KanbanUser> = {
    '1': { id: '1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?u=1' },
    '2': { id: '2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?u=2' },
    '3': { id: '3', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?u=3' },
};

const mockKanbanData: KanbanBoardData = {
    'todo': {
        id: 'todo',
        title: 'To Do',
        items: [
            { id: '101', title: 'Research Competitor Analysis', tag: 'Research', priority: 'High', comments: 2, attachments: 1, date: 'Oct 24, 2023', users: [mockUsers['1']] },
            { id: '102', title: 'Draft Wireframes for Home', tag: 'Design', priority: 'Medium', comments: 0, attachments: 0, date: 'Oct 25, 2023', users: [mockUsers['2']] }
        ]
    },
    'inprogress': {
        id: 'inprogress',
        title: 'In Progress',
        items: [
            { id: '103', title: 'Setup React Project Repo', tag: 'Development', priority: 'High', comments: 5, attachments: 2, date: 'Oct 20, 2023', users: [mockUsers['1'], mockUsers['3']] }
        ]
    },
    'completed': {
        id: 'completed',
        title: 'Completed',
        items: [
            { id: '104', title: 'Kickoff Meeting', tag: 'Meeting', priority: 'Low', comments: 1, attachments: 0, date: 'Oct 18, 2023', users: [mockUsers['1'], mockUsers['2'], mockUsers['3']] }
        ]
    }
};

// 3. Dynamic UI Helpers
const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
        case 'design': return 'bg-purple-50 text-purple-600 border-purple-100';
        case 'development': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'research': return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'meeting': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
};

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

export default function KanbanBoard({
    projectId,
    initialData = mockKanbanData,
    onTaskMove,
    onTaskAdd
}: KanbanBoardProps) {

    const [isMounted, setIsMounted] = useState(false);
    const [columns, setColumns] = useState<KanbanBoardData>(initialData);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);

    // Prevent hydration mismatch in Next.js
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        // Fire API callback if provided
        if (onTaskMove) {
            onTaskMove(draggableId, source.droppableId, destination.droppableId, destination.index);
        }

        // Handle cross-column move
        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId];
            const destColumn = columns[destination.droppableId];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];

            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceColumn, items: sourceItems },
                [destination.droppableId]: { ...destColumn, items: destItems }
            });
        }
        // Handle same-column reorder
        else {
            const column = columns[source.droppableId];
            const copiedItems = [...column.items];
            const [removed] = copiedItems.splice(source.index, 1);
            copiedItems.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: { ...column, items: copiedItems }
            });
        }
    };

    const handleAddTask = (task: any) => {
        if (onTaskAdd) {
            onTaskAdd(task);
        }

        // Optimistic UI update
        const newId = `TSK-${Date.now()}`;
        const newTask: KanbanTask = { ...task, id: newId, comments: 0, attachments: 0, users: [] };

        setColumns(prev => ({
            ...prev,
            'todo': {
                ...prev['todo'],
                items: [...prev['todo'].items, newTask]
            }
        }));

        setIsTaskModalOpen(false);
    };

    if (!isMounted) return <div className="animate-pulse h-96 bg-gray-100 rounded-xl w-full"></div>;

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-300">

            {/* Board Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Task Board</h2>
                <Button
                    variant="primary"
                    onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                    className="gap-2 shadow-sm shadow-blue-500/30"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Task
                </Button>
            </div>

            {/* Board Canvas */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar flex-1 items-start">
                    {Object.entries(columns).map(([columnId, column]) => (

                        <div key={columnId} className="w-[320px] shrink-0 bg-gray-100/80 rounded-2xl flex flex-col max-h-[75vh] border border-gray-200/50">

                            {/* Column Header */}
                            <div className="p-4 flex items-center justify-between border-b border-gray-200/50">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-800">{column.title}</h3>
                                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-md">
                                        {column.items.length}
                                    </span>
                                </div>
                                <button className="p-1 hover:bg-gray-200 rounded-md text-gray-400 hover:text-gray-700 transition-colors">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>

                            {/* Droppable Area */}
                            <Droppable droppableId={columnId}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={cn(
                                            "flex-1 p-3 space-y-3 overflow-y-auto min-h-[150px] transition-colors rounded-b-2xl",
                                            snapshot.isDraggingOver ? "bg-blue-50/50" : ""
                                        )}
                                    >
                                        {column.items.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided, snapshot) => {
                                                    // Parse date to check if overdue safely
                                                    const isOverdue = new Date(item.date) < new Date() && columnId !== 'completed';

                                                    return (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={cn(
                                                                "bg-white p-4 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md hover:border-blue-300 transition-all select-none cursor-grab active:cursor-grabbing",
                                                                snapshot.isDragging ? "rotate-2 shadow-xl ring-2 ring-blue-500/50 cursor-grabbing" : ""
                                                            )}
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                                                    getTagColor(item.tag)
                                                                )}>
                                                                    {item.tag}
                                                                </span>
                                                                <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 transition-all">
                                                                    <MoreHorizontal size={16} />
                                                                </button>
                                                            </div>

                                                            <h4 className="font-bold text-gray-900 mb-4 leading-snug">{item.title}</h4>

                                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                                <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                                                                    {item.comments > 0 && (
                                                                        <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors" title="Comments">
                                                                            <MessageSquare size={14} /> {item.comments}
                                                                        </div>
                                                                    )}
                                                                    {item.attachments > 0 && (
                                                                        <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors" title="Attachments">
                                                                            <Paperclip size={14} /> {item.attachments}
                                                                        </div>
                                                                    )}
                                                                    <div className={cn(
                                                                        "flex items-center gap-1",
                                                                        isOverdue ? "text-red-500 font-bold" : "text-gray-400"
                                                                    )}>
                                                                        <Calendar size={14} /> {item.date}
                                                                    </div>
                                                                </div>

                                                                {/* Dynamic Avatars */}
                                                                <div className="flex -space-x-2">
                                                                    {item.users.map((u, i) => (
                                                                        <div key={i} className="relative w-6 h-6 rounded-full border-2 border-white shadow-sm bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-600 overflow-hidden" title={u.name}>
                                                                            {u.avatarUrl ? (
                                                                                <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                                                                            ) : (
                                                                                getInitials(u.name)
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>

                    ))}
                </div>
            </DragDropContext>

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSubmit={handleAddTask}
                task={editingTask}
            />
        </div>
    );
}