'use client';

import React, { useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
    value: string;
    onChange: (otp: string) => void;
    length?: number;
    disabled?: boolean;
    error?: boolean;
    autoFocus?: boolean;
}

/**
 * Reusable 6-digit OTP input with auto-focus, paste support, and keyboard navigation.
 */
export function OtpInput({
    value,
    onChange,
    length = 6,
    disabled = false,
    error = false,
    autoFocus = true,
}: OtpInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Split the value string into individual digits
    const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [autoFocus]);

    const focusInput = (index: number) => {
        if (index >= 0 && index < length && inputRefs.current[index]) {
            inputRefs.current[index]?.focus();
            inputRefs.current[index]?.select();
        }
    };

    const handleChange = (index: number, char: string) => {
        if (!/^\d?$/.test(char)) return; // Only allow single digit

        const newDigits = [...digits];
        newDigits[index] = char;
        const newValue = newDigits.join('').slice(0, length);
        onChange(newValue);

        // Auto-focus next input
        if (char && index < length - 1) {
            focusInput(index + 1);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (digits[index]) {
                // Clear current digit
                handleChange(index, '');
            } else if (index > 0) {
                // Move to previous and clear it
                handleChange(index - 1, '');
                focusInput(index - 1);
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            focusInput(index - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            focusInput(index + 1);
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        if (pastedData) {
            onChange(pastedData);
            // Focus the last filled input or the input after the last pasted digit
            focusInput(Math.min(pastedData.length, length - 1));
        }
    };

    return (
        <div className="flex items-center gap-2 sm:gap-3">
            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    className={`
                        w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold
                        rounded-lg border-2 outline-none transition-all duration-200
                        bg-white dark:bg-gray-900
                        text-gray-900 dark:text-gray-100
                        ${error
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-gray-200 dark:border-gray-700 focus:border-[#6D5DFD] focus:ring-2 focus:ring-[#6D5DFD]/20'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''}
                        placeholder:text-gray-300 dark:placeholder:text-gray-600
                    `}
                    placeholder="·"
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    );
}

OtpInput.displayName = 'OtpInput';
