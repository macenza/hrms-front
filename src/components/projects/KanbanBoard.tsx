'use client';
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import TaskModal from './TaskModal';
import {
    collectKnownApiStatuses,
    resolveApiTaskStatus,
    toUiTaskStatus,
    UI_COLUMN_ORDER,
    type TaskStatus,
} from '@/lib/taskStatus';

export type { TaskStatus };
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TaskRecord {
    id: string;
    title: string;
    status: TaskStatus;
    /** Raw status string from the API (used when moving cards). */
    apiStatus?: string;
    priority: TaskPriority;
    tag: string;
    description?: string;
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
    onTaskMove?: (taskId: string, apiStatus: string) => Promise<void>;
    onTaskAdd?: (task: Partial<TaskRecord>) => Promise<void>;
    onTaskUpdate?: (taskId: string, task: Partial<TaskRecord>) => Promise<void>;
    onTaskDelete?: (taskId: string) => Promise<void>;
    team?: any[];
}



const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const getAvatarColor = (name: string) => {
    if (!name) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    const colors = [
        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
        'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
        'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
        'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400'
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

export default function KanbanBoard({
    projectId,
    tasks = [],
    isLoading = false,
    onTaskMove,
    onTaskAdd,
    onTaskUpdate,
    onTaskDelete,
    team = []
}: KanbanBoardProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [columns, setColumns] = useState<KanbanBoardData>({});
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const buildColumnsFromTasks = (taskList: TaskRecord[]): KanbanBoardData => {
        const grouped: KanbanBoardData = Object.fromEntries(
            UI_COLUMN_ORDER.map((id) => [id, { id, title: id, items: [] as TaskRecord[] }])
        ) as KanbanBoardData;

        taskList.forEach((task) => {
            const columnId = toUiTaskStatus(task.apiStatus ?? task.status);
            grouped[columnId].items.push({ ...task, status: columnId });
        });

        return grouped;
    };

    useEffect(() => {
        setColumns(buildColumnsFromTasks(tasks));
    }, [tasks]);

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;
        
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const sourceColumnId = toUiTaskStatus(source.droppableId);
        const destColumnId = toUiTaskStatus(destination.droppableId);

        const sourceColumn = columns[sourceColumnId];
        const destColumn = columns[destColumnId];
        if (!sourceColumn || !destColumn) return;
        
        const sourceItems = [...sourceColumn.items];
        const destItems = sourceColumnId === destColumnId ? sourceItems : [...destColumn.items];
        
        const [removed] = sourceItems.splice(source.index, 1);
        
        // THE FIX: Create a new object instead of mutating state directly!
        const movedTask = { ...removed, status: destColumnId };
        destItems.splice(destination.index, 0, movedTask);
        
        setColumns({
            ...columns,
            [sourceColumnId]: { ...sourceColumn, items: sourceItems },
            [destColumnId]: { ...destColumn, items: destItems }
        });

        if (sourceColumnId !== destColumnId && onTaskMove) {
            const knownStatuses = collectKnownApiStatuses(tasks);
            const apiStatus = resolveApiTaskStatus(destColumnId, knownStatuses);
            const previousColumns = columns;

            try {
                await onTaskMove(draggableId, apiStatus);
            } catch (error) {
                console.error('Failed to move task on backend', error);
                setColumns(previousColumns);
            }
        }
    };

    const handleAddTask = async (taskData: any) => {
        if (editingTask) {
            if (onTaskUpdate) {
                await onTaskUpdate(editingTask.id, taskData);
            }
        } else {
            if (onTaskAdd) {
                await onTaskAdd(taskData);
            }
        }
        setIsTaskModalOpen(false);
    };

    const handleTaskDelete = async (taskId: string) => {
        if (onTaskDelete) {
            await onTaskDelete(taskId);
        }
        setIsTaskModalOpen(false);
    };

    if (!isMounted) {
        return (
            <div className="flex gap-6 animate-pulse h-[60vh] w-full">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-[320px] shrink-0 bg-gray-100 dark:bg-gray-800/40 rounded-2xl border border-gray-200/50 dark:border-gray-800/50" />
                ))}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-500 mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading board...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 transition-colors">Task Board</h2>
                <Button
                    variant="primary"
                    onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
                    className="gap-2 shadow-sm shadow-blue-500/25 dark:shadow-none font-semibold"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Add Task
                </Button>
            </div>
            
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar flex-1 items-start">
                    {Object.entries(columns).map(([columnId, column]) => (
                        <div key={columnId} className="w-[320px] shrink-0 bg-gray-100/80 dark:bg-gray-800/40 rounded-2xl flex flex-col max-h-[75vh] border border-gray-200/50 dark:border-gray-800 transition-colors">
                            <div className="p-4 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50 transition-colors">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200 transition-colors">{column.title}</h3>
                                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-0.5 rounded-md transition-colors">
                                        {column.items.length}
                                    </span>
                                </div>
                            </div>
                            
                            <Droppable droppableId={columnId}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={cn(
                                            "flex-1 p-3 space-y-3 overflow-y-auto min-h-[150px] transition-colors rounded-b-2xl",
                                            snapshot.isDraggingOver ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
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
                                                                "bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 group hover:shadow-md dark:hover:shadow-none hover:border-blue-300 dark:hover:border-blue-900/50 transition-all select-none cursor-grab active:cursor-grabbing",
                                                                snapshot.isDragging ? "rotate-2 shadow-xl dark:shadow-2xl ring-2 ring-blue-500/50 dark:ring-blue-400/50 cursor-grabbing" : ""
                                                            )}
                                                            onClick={() => {
                                                                setEditingTask(item);
                                                                setIsTaskModalOpen(true);
                                                            }}
                                                        >
                                                            <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-4 leading-snug transition-colors">
                                                                {item.title}
                                                            </h4>
                                                            
                                                            <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-800/50 transition-colors">
                                                                <div className={cn(
                                                                    "flex items-center gap-1 text-xs font-medium transition-colors",
                                                                    isOverdue ? "text-red-500 dark:text-red-400 font-bold" : "text-gray-400 dark:text-gray-500"
                                                                )}>
                                                                    <Calendar size={14} /> {item.dueDate || 'No date'}
                                                                </div>
                                                                
                                                                <div className="flex -space-x-2">
                                                                    <div 
                                                                        className={cn(
                                                                            "relative w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-bold overflow-hidden transition-colors",
                                                                            getAvatarColor(item.assigneeName)
                                                                        )} 
                                                                        title={item.assigneeName}
                                                                    >
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
            
            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
                onSubmit={handleAddTask}
                onDelete={handleTaskDelete}
                task={editingTask}
                team={team}
            />
        </div>
    );
}