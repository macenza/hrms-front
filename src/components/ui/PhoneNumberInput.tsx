'use client';
import React from 'react';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { cn } from '@/utils/cn';
import type { CountryCode } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';

interface PhoneNumberInputProps {
    value: string;
    onChange: (value: string) => void;
    /** Controlled country code — updates when the parent changes it (e.g., on address country selection) */
    country?: CountryCode;
    /** Fallback country if `country` is not provided */
    defaultCountry?: CountryCode;
    /** Called when user manually picks a different country from the flag dropdown */
    onCountryChange?: (country: CountryCode) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
    id?: string;
}

/**
 * Enterprise-grade phone number input with country flag selector.
 * Wraps react-phone-number-input with HRMS styling.
 * Stores values in E.164 format (e.g., "+919876543210").
 *
 * Supports both controlled (`country`) and uncontrolled (`defaultCountry`) modes.
 * When `country` is provided, the flag/code auto-updates when the parent changes it.
 */
export function PhoneNumberInput({
    value,
    onChange,
    country,
    defaultCountry = 'IN',
    onCountryChange,
    label,
    error,
    disabled = false,
    placeholder = 'Enter phone number',
    id,
}: PhoneNumberInputProps) {
    return (
        <div className="w-full flex flex-col gap-1.5">
            {label && (
                <label
                    htmlFor={id}
                    className="text-sm font-medium text-gray-900 dark:text-gray-300 transition-colors"
                >
                    {label}
                </label>
            )}
            <PhoneInput
                id={id}
                international
                countryCallingCodeEditable={false}
                country={country || undefined}
                defaultCountry={!country ? defaultCountry : undefined}
                onCountryChange={(c) => onCountryChange?.(c as CountryCode)}
                value={value}
                onChange={(val) => onChange(val || '')}
                disabled={disabled}
                placeholder={placeholder}
                className={cn(
                    'hrms-phone-input',
                    error && 'hrms-phone-input--error',
                    disabled && 'hrms-phone-input--disabled'
                )}
            />
            {error && (
                <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
            )}
        </div>
    );
}

/**
 * Validates a phone number string using libphonenumber-js.
 * Useful for inline/real-time validation in forms.
 */
export function validatePhone(phone: string): boolean {
    if (!phone || phone.trim() === '') return false;
    try {
        return isValidPhoneNumber(phone);
    } catch {
        return false;
    }
}

PhoneNumberInput.displayName = 'PhoneNumberInput';

