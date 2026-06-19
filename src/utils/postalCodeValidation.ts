/**
 * Country-specific postal code validation patterns.
 * Add new countries by inserting a new entry.
 */
const POSTAL_CODE_PATTERNS: Record<string, { regex: RegExp; example: string }> = {
    IN: { regex: /^[1-9][0-9]{5}$/, example: '273001' },
    US: { regex: /^\d{5}(-\d{4})?$/, example: '10001 or 10001-1234' },
    CA: { regex: /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/, example: 'M5V 3L9' },
    GB: { regex: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s?\d[A-Za-z]{2}$/, example: 'SW1A 1AA' },
    AU: { regex: /^\d{4}$/, example: '2000' },
    DE: { regex: /^\d{5}$/, example: '10115' },
    FR: { regex: /^\d{5}$/, example: '75001' },
    JP: { regex: /^\d{3}-?\d{4}$/, example: '100-0001' },
    AE: { regex: /^[0-9]{5,6}$/, example: '00000' },
    BR: { regex: /^\d{5}-?\d{3}$/, example: '01001-000' },
    CN: { regex: /^\d{6}$/, example: '100000' },
    RU: { regex: /^\d{6}$/, example: '101000' },
    ZA: { regex: /^\d{4}$/, example: '0001' },
    SG: { regex: /^\d{6}$/, example: '018956' },
    NZ: { regex: /^\d{4}$/, example: '1010' },
};

export interface PostalCodeValidationResult {
    valid: boolean;
    message: string;
}

/**
 * Validates a postal code against country-specific patterns.
 * For unknown countries, accepts any reasonable alphanumeric string.
 */
export function validatePostalCode(
    postalCode: string,
    countryCode: string
): PostalCodeValidationResult {
    if (!postalCode || postalCode.trim() === '') {
        return { valid: false, message: 'Postal / ZIP code is required.' };
    }

    const trimmed = postalCode.trim();
    const pattern = POSTAL_CODE_PATTERNS[countryCode];

    if (!pattern) {
        // No specific pattern — accept generic alphanumeric
        if (/^[A-Za-z0-9\s\-]{2,15}$/.test(trimmed)) {
            return { valid: true, message: '' };
        }
        return { valid: false, message: 'Please enter a valid postal code.' };
    }

    if (!pattern.regex.test(trimmed)) {
        return {
            valid: false,
            message: `Please enter a valid postal code for the selected country (e.g., ${pattern.example}).`,
        };
    }

    return { valid: true, message: '' };
}

/**
 * Returns the example postal code format for a given country.
 */
export function getPostalCodePlaceholder(countryCode: string): string {
    return POSTAL_CODE_PATTERNS[countryCode]?.example || 'Postal / ZIP Code';
}
