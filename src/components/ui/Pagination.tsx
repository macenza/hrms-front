// src/components/ui/Pagination.tsx
'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useBreakpoint } from '@/hooks/useMediaQuery';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalEntries: number;
    entriesPerPage: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    isLoading?: boolean;
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalEntries,
    entriesPerPage,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [5, 10, 20, 50],
    isLoading = false,
    className,
}: PaginationProps) {
    const breakpoint = useBreakpoint();
    const isMobile = breakpoint === 'mobile';

    const startEntry = totalEntries === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
    const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);

    return (
        <div
            className={cn(
                "p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20",
                "flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors font-medium",
                className
            )}
        >
            {/* Entries per page selector */}
            {onPageSizeChange && !isMobile && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Show</span>
                    <select
                        value={entriesPerPage}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-blue-500/40 transition-all shadow-sm dark:shadow-none cursor-pointer font-semibold"
                    >
                        {pageSizeOptions.map((size) => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    <span>entries</span>
                </div>
            )}

            {/* Showing X to Y of Z */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
                {isMobile ? (
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {currentPage} / {totalPages}
                    </span>
                ) : (
                    <>
                        Showing{' '}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{startEntry}</span>
                        {' '}to{' '}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{endEntry}</span>
                        {' '}of{' '}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{totalEntries}</span>
                        {' '}entries
                    </>
                )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-900 shadow-sm"
                    aria-label="Previous Page"
                >
                    <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 px-2">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading}
                    className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:bg-gray-900 shadow-sm"
                    aria-label="Next Page"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
