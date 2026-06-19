'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Country } from 'country-state-city';
import { cn } from '@/utils/cn';
import { Search, ChevronDown, Check } from 'lucide-react';

interface CountryOption {
    name: string;
    isoCode: string;
    phonecode: string;
    flag: string;
}

interface CountrySelectProps {
    value: string;            // isoCode, e.g. "IN"
    onChange: (country: { name: string; isoCode: string }) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
    id?: string;
}

/**
 * Searchable country dropdown using country-state-city data.
 * Displays country names with flag emojis and returns both name and ISO code.
 */
export function CountrySelect({
    value,
    onChange,
    label,
    error,
    disabled = false,
    placeholder = 'Select a country',
    id,
}: CountrySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const countries: CountryOption[] = useMemo(() => {
        return Country.getAllCountries().map((c) => ({
            name: c.name,
            isoCode: c.isoCode,
            phonecode: c.phonecode,
            flag: c.flag,
        }));
    }, []);

    const selectedCountry = useMemo(
        () => countries.find((c) => c.isoCode === value),
        [countries, value]
    );

    const filteredCountries = useMemo(() => {
        if (!search.trim()) return countries;
        const term = search.toLowerCase();
        return countries.filter(
            (c) =>
                c.name.toLowerCase().includes(term) ||
                c.isoCode.toLowerCase().includes(term)
        );
    }, [countries, search]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (country: CountryOption) => {
        onChange({ name: country.name, isoCode: country.isoCode });
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className="w-full flex flex-col gap-1.5" ref={containerRef}>
            {label && (
                <label
                    htmlFor={id}
                    className="text-sm font-medium text-gray-900 dark:text-gray-300 transition-colors"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <button
                    id={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'flex items-center justify-between w-full h-10 px-3 rounded-md border text-sm transition-colors',
                        'border-gray-300 bg-transparent text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent',
                        'dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-100 dark:focus:ring-blue-500',
                        error && 'border-red-500 focus:ring-red-500 dark:border-red-500',
                        disabled && 'cursor-not-allowed opacity-50'
                    )}
                >
                    <span className={cn(!selectedCountry && 'text-gray-400 dark:text-gray-500')}>
                        {selectedCountry
                            ? `${selectedCountry.flag} ${selectedCountry.name}`
                            : placeholder}
                    </span>
                    <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 rounded-md border shadow-lg overflow-hidden bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                        {/* Search input */}
                        <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search countries..."
                                    className="w-full h-8 pl-8 pr-3 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
                                />
                            </div>
                        </div>
                        {/* Options list */}
                        <ul className="max-h-56 overflow-y-auto py-1">
                            {filteredCountries.length === 0 ? (
                                <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No countries found</li>
                            ) : (
                                filteredCountries.map((c) => (
                                    <li key={c.isoCode}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(c)}
                                            className={cn(
                                                'flex items-center justify-between w-full px-3 py-2 text-sm text-left transition-colors',
                                                'hover:bg-blue-50 dark:hover:bg-gray-800',
                                                c.isoCode === value && 'bg-blue-50 dark:bg-gray-800 font-medium'
                                            )}
                                        >
                                            <span className="text-gray-900 dark:text-gray-100">
                                                {c.flag} {c.name}
                                            </span>
                                            {c.isoCode === value && (
                                                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            )}
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        </div>
    );
}

CountrySelect.displayName = 'CountrySelect';
