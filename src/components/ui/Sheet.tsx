// src/components/ui/Sheet.tsx
'use client';

import React, { useEffect, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';

// ─── TYPES ──────────────────────────────────────────────────────
type SheetSide = 'top' | 'right' | 'bottom' | 'left';

interface SheetProps {
    isOpen: boolean;
    onClose: () => void;
    side?: SheetSide;
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
}

type SheetHeaderProps = React.ComponentProps<'div'>;
type SheetTitleProps = React.ComponentProps<'h2'>;
type SheetDescriptionProps = React.ComponentProps<'p'>;
type SheetFooterProps = React.ComponentProps<'div'>;

// ─── SIDE-SPECIFIC STYLES ───────────────────────────────────────
const SIDE_STYLES: Record<SheetSide, { panel: string; enter: string; exit: string }> = {
    right: {
        panel: 'inset-y-0 right-0 h-full w-full sm:w-[420px] md:w-[480px] border-l',
        enter: 'animate-in slide-in-from-right duration-300',
        exit: '',
    },
    left: {
        panel: 'inset-y-0 left-0 h-full w-full sm:w-[420px] md:w-[480px] border-r',
        enter: 'animate-in slide-in-from-left duration-300',
        exit: '',
    },
    top: {
        panel: 'inset-x-0 top-0 w-full h-auto max-h-[85vh] border-b',
        enter: 'animate-in slide-in-from-top duration-300',
        exit: '',
    },
    bottom: {
        panel: 'inset-x-0 bottom-0 w-full h-auto max-h-[85vh] border-t',
        enter: 'animate-in slide-in-from-bottom duration-300',
        exit: '',
    },
};

// ─── SHEET (ROOT) ───────────────────────────────────────────────
function Sheet({
    isOpen,
    onClose,
    side = 'right',
    children,
    className,
    showCloseButton = true,
}: SheetProps) {
    // Lock body scroll while open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Close on Escape key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const sideConfig = SIDE_STYLES[side];

    return (
        <div className="fixed inset-0 z-[60]">
            {/* Backdrop / Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70 animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                data-slot="sheet-content"
                role="dialog"
                aria-modal="true"
                className={cn(
                    'fixed flex flex-col',
                    'bg-white dark:bg-gray-900 shadow-2xl dark:shadow-none',
                    'border-gray-200 dark:border-gray-800',
                    sideConfig.panel,
                    sideConfig.enter,
                    className
                )}
            >
                {/* Close button */}
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 z-10 rounded-md p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600/30 dark:focus:ring-blue-500/40 transition-all"
                        aria-label="Close sheet"
                    >
                        <X size={18} />
                    </button>
                )}

                {/* Content wrapper — scrollable */}
                <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}

// ─── SHEET HEADER ───────────────────────────────────────────────
function SheetHeader({ className, ...props }: SheetHeaderProps) {
    return (
        <div
            data-slot="sheet-header"
            className={cn('flex flex-col gap-1.5 px-6 pt-6 pb-4', className)}
            {...props}
        />
    );
}

// ─── SHEET TITLE ────────────────────────────────────────────────
function SheetTitle({ className, ...props }: SheetTitleProps) {
    return (
        <h2
            data-slot="sheet-title"
            className={cn('text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100', className)}
            {...props}
        />
    );
}

// ─── SHEET DESCRIPTION ──────────────────────────────────────────
function SheetDescription({ className, ...props }: SheetDescriptionProps) {
    return (
        <p
            data-slot="sheet-description"
            className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
            {...props}
        />
    );
}

// ─── SHEET FOOTER ───────────────────────────────────────────────
function SheetFooter({ className, ...props }: SheetFooterProps) {
    return (
        <div
            data-slot="sheet-footer"
            className={cn(
                'flex items-center gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 mt-auto',
                className
            )}
            {...props}
        />
    );
}

export { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetFooter };
