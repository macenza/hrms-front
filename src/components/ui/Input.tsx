import React from "react";
import { cn } from "@/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type = "text", label, error, ...props }, ref) => {
        return (
            <div className="w-full flex flex-col gap-1.5">
                {label && (
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-300 transition-colors">
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
                        "dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-blue-500",
                        error && "border-red-500 focus:ring-red-500 dark:border-red-500",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";