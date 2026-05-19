import React, { useEffect } from "react";
import { cn } from "@/utils/cn";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 bg-black/50 backdrop-blur-sm dark:bg-black/70">
            <div
                className={cn(
                    "rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300",
                    "bg-white border border-gray-100", // Light mode panel
                    "dark:bg-gray-900 dark:border-gray-800 dark:shadow-none", // Dark mode panel
                    className
                )}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 transition-all rounded-lg focus:outline-none focus:ring-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 focus:ring-blue-600 dark:hover:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-blue-500"
                        aria-label="Close modal"
                    >
                        <span className="text-xl leading-none">✕</span>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto antialiased text-gray-900 dark:text-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
}