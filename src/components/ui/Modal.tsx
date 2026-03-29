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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div
                className={cn(
                    "bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-gray-100", 
                    className
                )}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        aria-label="Close modal"
                    >
                        <span className="text-xl leading-none">✕</span>
                    </button>
                </div>
                {/* Added text-gray-900 here to force dark text 
                   Added antialiased for better font rendering
                */}
                <div className="p-6 overflow-y-auto text-gray-900 antialiased">
                    {children}
                </div>
            </div>
        </div>
    );
}