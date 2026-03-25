'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Calendar, MessageSquare, Paperclip } from 'lucide-react';
import clsx from 'clsx';
import TaskModal from './TaskModal';

// Dummy Task Data matching your React UI
const initialTasks = {
    'todo': {
        id: 'todo',
        title: 'To Do',
        items: [
            { id: '101', title: 'Research Competitor Analysis', tag: 'Research', priority: 'High', comments: 2, attachments: 1, date: 'Oct 24', users: [1] },
            { id: '102', title: 'Draft Wireframes for Home', tag: 'Design', priority: 'Medium', comments: 0, attachments: 0, date: 'Oct 25', users: [2] }
        ]
    },
    'inprogress': {
        id: 'inprogress',
        title: 'In Progress',
        items: [
            { id: '103', title: 'Setup React Project Repo', tag: 'Development', priority: 'High', comments: 5, attachments: 2, date: 'Oct 20', users: [1, 3] }
        ]
    },
    'completed': {
        id: 'completed',
        title: 'Completed',
        items: [
            { id: '104', title: 'Kickoff Meeting', tag: 'Meeting', priority: 'Low', comments: 1, attachments: 0, date: 'Oct 18', users: [1, 2, 3] }
        ]
    }
};

export default function KanbanBoard({ projectId }: { projectId: string }) {
    const [isMounted, setIsMounted] = useState(false);
    const [columns, setColumns] = useState(initialTasks);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);

    // Prevent hydration mismatch with react-beautiful-dnd in Next.js
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const { source, destination } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = columns[source.droppableId as keyof typeof columns];
            const destColumn = columns[destination.droppableId as keyof typeof columns];
            const sourceItems = [...sourceColumn.items];
            const destItems = [...destColumn.items];
            
            const [removed] = sourceItems.splice(source.index, 1);
            destItems.splice(destination.index, 0, removed);
            
            setColumns({
                ...columns,
                [source.droppableId]: { ...sourceColumn, items: sourceItems },
                [destination.droppableId]: { ...destColumn, items: destItems }
            });
        } else {
            const column = columns[source.droppableId as keyof typeof columns];
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
        const newId = Date.now().toString();
        const newTask = { ...task, id: newId, comments: 0, attachments: 0, users: [1] };
        const newColumns = { ...columns };
        newColumns['todo'].items.push(newTask);
        setColumns(newColumns);
        setIsTaskModalOpen(false);
    };

    if (!isMounted) return <div className="animate-pulse h-96 bg-gray-100 rounded-xl"></div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Task Board</h2>
                <button
                    onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                    className="flex items-center px-4 py-2 bg-[#4F7CF3] text-white rounded-lg text-sm font-bold hover:bg-[#3A62D7] transition-colors shadow-sm shadow-blue-500/30"
                >
                    <Plus size={16} className="mr-2" /> Add Task
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar flex-1 items-start">
                    {Object.entries(columns).map(([columnId, column]) => (
                        <div key={columnId} className="w-[320px] shrink-0 bg-gray-100/80 rounded-2xl flex flex-col max-h-[70vh] border border-gray-200/50">
                            {/* Column Header */}
                            <div className="p-4 flex items-center justify-between border-b border-gray-200/50">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-800">{column.title}</h3>
                                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-md">
                                        {column.items.length}
                                    </span>
                                </div>
                                <button className="p-1 hover:bg-gray-200 rounded-md text-gray-400 transition-colors">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>

                            {/* Droppable Area */}
                            <Droppable droppableId={columnId}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={clsx(
                                            "flex-1 p-3 space-y-3 overflow-y-auto min-h-[150px] transition-colors",
                                            snapshot.isDraggingOver ? "bg-[#4F7CF3]/5" : ""
                                        )}
                                    >
                                        {column.items.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={clsx(
                                                            "bg-white p-4 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md hover:border-[#4F7CF3]/30 transition-all select-none",
                                                            snapshot.isDragging ? "rotate-2 shadow-xl ring-2 ring-[#4F7CF3]/50" : ""
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                                                item.tag === 'Design' ? "bg-purple-50 text-purple-600" :
                                                                item.tag === 'Development' ? "bg-blue-50 text-blue-600" :
                                                                "bg-gray-100 text-gray-600"
                                                            )}>
                                                                {item.tag}
                                                            </span>
                                                            <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 transition-all">
                                                                <MoreHorizontal size={16} />
                                                            </button>
                                                        </div>

                                                        <h4 className="font-bold text-gray-900 mb-4">{item.title}</h4>

                                                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                                            <div className="flex items-center gap-3 text-gray-400 text-xs font-medium">
                                                                {item.comments > 0 && (
                                                                    <div className="flex items-center gap-1 hover:text-[#4F7CF3] cursor-pointer transition-colors">
                                                                        <MessageSquare size={14} /> {item.comments}
                                                                    </div>
                                                                )}
                                                                {item.attachments > 0 && (
                                                                    <div className="flex items-center gap-1 hover:text-[#4F7CF3] cursor-pointer transition-colors">
                                                                        <Paperclip size={14} /> {item.attachments}
                                                                    </div>
                                                                )}
                                                                <div className={clsx("flex items-center gap-1",
                                                                    new Date(item.date) < new Date() ? "text-red-500" : "text-gray-400"
                                                                )}>
                                                                    <Calendar size={14} /> {item.date}
                                                                </div>
                                                            </div>

                                                            <div className="flex -space-x-2">
                                                                {item.users.map((u, i) => (
                                                                    <img key={i} src={`https://i.pravatar.cc/150?u=${u}`} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" alt="User" />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
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