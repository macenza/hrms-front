'use client';
import React from 'react';
import { Input } from '@/components/ui/Input';
import { PhoneNumberInput } from '@/components/ui/PhoneNumberInput';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { StateSelect } from '@/components/ui/StateSelect';
import { CitySelect } from '@/components/ui/CitySelect';
import { DISTRICT_COUNTRIES } from '@/types/address';
import { getPostalCodePlaceholder } from '@/utils/postalCodeValidation';
import type { AddressFormData } from '@/types/address';
import { MapPin, Phone } from 'lucide-react';

interface AddressFormErrors {
    addressLine1?: string;
    addressLine2?: string;
    country?: string;
    state?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    landmark?: string;
    phoneNumber?: string;
    alternatePhoneNumber?: string;
}

interface AddressFormProps {
    value: AddressFormData;
    onChange: (data: AddressFormData) => void;
    errors?: AddressFormErrors;
    disabled?: boolean;
    /** If true, hides the contact (phone) section */
    hideContact?: boolean;
    /** If true, hides section headers */
    compact?: boolean;
}

/**
 * Composite address + contact form component.
 * Handles cascading dependencies (Country → State → City).
 * Reusable across Employee, Company, Branch, Client forms.
 */
export function AddressForm({
    value,
    onChange,
    errors = {},
    disabled = false,
    hideContact = false,
    compact = false,
}: AddressFormProps) {
    const showDistrict = DISTRICT_COUNTRIES.includes(value.countryCode);

    const updateField = <K extends keyof AddressFormData>(
        field: K,
        fieldValue: AddressFormData[K]
    ) => {
        onChange({ ...value, [field]: fieldValue });
    };

    const handleCountryChange = (country: { name: string; isoCode: string }) => {
        onChange({
            ...value,
            country: country.name,
            countryCode: country.isoCode,
            // Clear dependent fields
            state: '',
            stateCode: '',
            city: '',
            district: '',
            postalCode: '',
        });
    };

    const handleStateChange = (state: { name: string; isoCode: string }) => {
        onChange({
            ...value,
            state: state.name,
            stateCode: state.isoCode,
            // Clear dependent city
            city: '',
        });
    };

    const handleCityChange = (city: string) => {
        updateField('city', city);
    };

    return (
        <div className="space-y-6">
            {/* ── Address Information ── */}
            {!compact && (
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
                    <MapPin className="w-4 h-4" />
                    <span>Address Information</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Address Line 1 — full width */}
                <div className="md:col-span-2">
                    <Input
                        label="Address Line 1 *"
                        value={value.addressLine1}
                        onChange={(e) => updateField('addressLine1', e.target.value)}
                        placeholder="Street address, P.O. box"
                        error={errors.addressLine1}
                        disabled={disabled}
                        id="address-line-1"
                    />
                </div>

                {/* Address Line 2 — full width */}
                <div className="md:col-span-2">
                    <Input
                        label="Address Line 2"
                        value={value.addressLine2}
                        onChange={(e) => updateField('addressLine2', e.target.value)}
                        placeholder="Apartment, suite, unit, building (optional)"
                        error={errors.addressLine2}
                        disabled={disabled}
                        id="address-line-2"
                    />
                </div>

                {/* Country */}
                <CountrySelect
                    value={value.countryCode}
                    onChange={handleCountryChange}
                    label="Country *"
                    error={errors.country}
                    disabled={disabled}
                    id="address-country"
                />

                {/* State / Province */}
                <StateSelect
                    countryCode={value.countryCode}
                    value={value.stateCode}
                    onChange={handleStateChange}
                    label="State / Province *"
                    error={errors.state}
                    disabled={disabled}
                    id="address-state"
                />

                {/* City */}
                <CitySelect
                    countryCode={value.countryCode}
                    stateCode={value.stateCode}
                    value={value.city}
                    onChange={handleCityChange}
                    label="City *"
                    error={errors.city}
                    disabled={disabled}
                    id="address-city"
                />

                {/* District — only for South/Southeast Asian countries */}
                {showDistrict && (
                    <Input
                        label="District"
                        value={value.district}
                        onChange={(e) => updateField('district', e.target.value)}
                        placeholder="District (optional)"
                        error={errors.district}
                        disabled={disabled}
                        id="address-district"
                    />
                )}

                {/* Postal / ZIP Code */}
                <Input
                    label="Postal / ZIP Code *"
                    value={value.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    placeholder={getPostalCodePlaceholder(value.countryCode)}
                    error={errors.postalCode}
                    disabled={disabled}
                    id="address-postal-code"
                />

                {/* Landmark */}
                <Input
                    label="Landmark"
                    value={value.landmark}
                    onChange={(e) => updateField('landmark', e.target.value)}
                    placeholder="Near a famous place (optional)"
                    error={errors.landmark}
                    disabled={disabled}
                    id="address-landmark"
                />
            </div>

            {/* ── Contact Information ── */}
            {!hideContact && (
                <>
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-5 transition-colors">
                        {!compact && (
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 transition-colors">
                                <Phone className="w-4 h-4" />
                                <span>Contact Information</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <PhoneNumberInput
                                value={value.phoneNumber}
                                onChange={(val) => updateField('phoneNumber', val)}
                                label="Phone Number *"
                                error={errors.phoneNumber}
                                disabled={disabled}
                                placeholder="Enter phone number"
                                id="contact-phone"
                            />

                            <PhoneNumberInput
                                value={value.alternatePhoneNumber}
                                onChange={(val) => updateField('alternatePhoneNumber', val)}
                                label="Alternate Phone Number"
                                error={errors.alternatePhoneNumber}
                                disabled={disabled}
                                placeholder="Alternate number (optional)"
                                id="contact-alt-phone"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

AddressForm.displayName = 'AddressForm';
