// src/components/ui/ActionMenu.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ActionMenuItem {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'danger';
    disabled?: boolean;
}

interface ActionMenuProps {
    items: ActionMenuItem[];
    align?: 'left' | 'right';
    className?: string;
    triggerClassName?: string;
}

export default function ActionMenu({
    items,
    align = 'right',
    className,
    triggerClassName,
}: ActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen]);

    const visibleItems = items.filter((item) => !item.disabled);
    if (visibleItems.length === 0) return null;

    return (
        <div ref={menuRef} className={cn("relative", className)}>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                className={cn(
                    "p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
                    "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                    triggerClassName
                )}
                aria-label="Actions"
                aria-expanded={isOpen}
            >
                <MoreHorizontal size={18} />
            </button>

            {isOpen && (
                <div
                    className={cn(
                        "absolute z-50 mt-1 w-44 rounded-lg shadow-lg",
                        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                        "py-1 animate-in fade-in zoom-in-95 duration-150",
                        align === 'right' ? 'right-0' : 'left-0'
                    )}
                >
                    {visibleItems.map((item, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                                item.onClick();
                            }}
                            className={cn(
                                "w-full text-left px-3 py-2 text-sm font-medium flex items-center gap-2.5 transition-colors",
                                item.variant === 'danger'
                                    ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            )}
                        >
                            {item.icon && <span className="shrink-0 w-4 h-4 flex items-center justify-center">{item.icon}</span>}
                            {item.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
