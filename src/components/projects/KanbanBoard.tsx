'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// UI Components
import { Button } from '@/components/ui/Button';
import TaskModal from './TaskModal'; // Ensure this path is correct based on your folder structure

// Data Contracts (Aligned with TaskListTab & Backend Schema)
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed' | 'Blocked';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TaskRecord {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    tag: string;
    dueDate: string;
    assigneeName: string;
    assigneeAvatar?: string;
}

export interface KanbanColumn {
    id: TaskStatus;
    title: string;
    items: TaskRecord[];
}

export type KanbanBoardData = Record<string, KanbanColumn>;

interface KanbanBoardProps {
    projectId: string;
    tasks?: TaskRecord[];
    isLoading?: boolean;
    onTaskMove?: (taskId: string, newStatus: TaskStatus) => Promise<void>;
    onTaskAdd?: (task: Partial<TaskRecord>) => Promise<void>;
}

// Dynamic UI Helpers
const getTagColor = (tag: string) => {
    switch (tag?.toLowerCase()) {
        case 'design': return 'bg-purple-50 text-purple-600 border-purple-100';
        case 'development': return 'bg-blue-50 text-blue-600 border-blue-100';
        case 'research': return 'bg-orange-50 text-orange-600 border-orange-100';
        case 'meeting': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
};

const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function KanbanBoard({
    projectId,
    tasks = [],
    isLoading = false,
    onTaskMove,
    onTaskAdd
}: KanbanBoardProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [columns, setColumns] = useState<KanbanBoardData>({});
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);

    // Prevent hydration mismatch in Next.js
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Auto-group flat tasks array into Kanban columns whenever tasks change
    useEffect(() => {
        const grouped: KanbanBoardData = {
            'To Do': { id: 'To Do', title: 'To Do', items: [] },
            'In Progress': { id: 'In Progress', title: 'In Progress', items: [] },
            'Completed': { id: 'Completed', title: 'Completed', items: [] },
            'Blocked': { id: 'Blocked', title: 'Blocked', items: [] },
        };

        tasks.forEach(task => {
            if (grouped[task.status]) {
                grouped[task.status].items.push(task);
            } else {
                // Fallback for unknown statuses
                grouped['To Do'].items.push(task);
            }
        });

        setColumns(grouped);
    }, [tasks]);

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        // If dropped in the same place, do nothing
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const sourceColumnId = source.droppableId as TaskStatus;
        const destColumnId = destination.droppableId as TaskStatus;

        const sourceColumn = columns[sourceColumnId];
        const destColumn = columns[destColumnId];
        const sourceItems = [...sourceColumn.items];
        const destItems = sourceColumnId === destColumnId ? sourceItems : [...destColumn.items];

        // Optimistic UI Update (Move it immediately so it feels snappy)
        const [removed] = sourceItems.splice(source.index, 1);
        removed.status = destColumnId; // Update the item's internal status
        destItems.splice(destination.index, 0, removed);

        setColumns({
            ...columns,
            [sourceColumnId]: { ...sourceColumn, items: sourceItems },
            [destColumnId]: { ...destColumn, items: destItems }
        });

        // Fire API callback if it moved to a new column
        if (sourceColumnId !== destColumnId && onTaskMove) {
            try {
                await onTaskMove(draggableId, destColumnId);
            } catch (error) {
                // If the API fails, you could trigger a re-fetch here to snap it back
                console.error("Failed to move task on backend");
            }
        }
    };

    const handleAddTask = async (taskData: any) => {
        if (onTaskAdd) {
            await onTaskAdd(taskData);
        }
        setIsTaskModalOpen(false);
    };

    if (!isMounted) return <div className="animate-pulse h-96 bg-gray-100 rounded-xl w-full"></div>;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-sm text-gray-500 font-medium">Loading board...</p>
            </div>
        );
    }

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
                                                    const isOverdue = new Date(item.dueDate) < new Date() && columnId !== 'Completed';
                                                    return (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={cn(
                                                                "bg-white p-4 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md hover:border-blue-300 transition-all select-none cursor-grab active:cursor-grabbing",
                                                                snapshot.isDragging ? "rotate-2 shadow-xl ring-2 ring-blue-500/50 cursor-grabbing" : ""
                                                            )}
                                                            onClick={() => {
                                                                setEditingTask(item);
                                                                setIsTaskModalOpen(true);
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-start mb-3">
                                                                <span className={cn(
                                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                                                    getTagColor(item.tag)
                                                                )}>
                                                                    {item.tag}
                                                                </span>
                                                            </div>

                                                            <h4 className="font-bold text-gray-900 mb-4 leading-snug">{item.title}</h4>

                                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                                <div className={cn(
                                                                    "flex items-center gap-1 text-xs font-medium",
                                                                    isOverdue ? "text-red-500 font-bold" : "text-gray-400"
                                                                )}>
                                                                    <Calendar size={14} /> {item.dueDate || 'No date'}
                                                                </div>

                                                                {/* Assignee Avatar */}
                                                                <div className="flex -space-x-2">
                                                                    <div className="relative w-6 h-6 rounded-full border-2 border-white shadow-sm bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 overflow-hidden" title={item.assigneeName}>
                                                                        {item.assigneeAvatar ? (
                                                                            <img src={item.assigneeAvatar} alt={item.assigneeName} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            getInitials(item.assigneeName)
                                                                        )}
                                                                    </div>
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

            {/* Task Creation / Edit Modal */}
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
                onSubmit={handleAddTask}
                task={editingTask}
            />
        </div>
    );
}