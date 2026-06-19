/** Structured address data for employees, companies, branches, etc. */
export interface AddressData {
    addressLine1: string;
    addressLine2: string;
    country: string;
    countryCode: string;
    state: string;
    stateCode: string;
    city: string;
    district: string;
    postalCode: string;
    landmark: string;
}

/** Contact phone data stored in E.164 format */
export interface ContactData {
    phoneNumber: string;           // E.164 format, e.g. "+919876543210"
    phoneCountryCode: string;      // ISO code used during input, e.g. "IN"
    alternatePhoneNumber: string;   // E.164 format (optional)
}

/** Combined address + contact payload used by the AddressForm component */
export interface AddressFormData extends AddressData, ContactData {}

/** Returns an empty AddressFormData object for form initialization */
export function getEmptyAddressFormData(): AddressFormData {
    return {
        addressLine1: '',
        addressLine2: '',
        country: '',
        countryCode: '',
        state: '',
        stateCode: '',
        city: '',
        district: '',
        postalCode: '',
        landmark: '',
        phoneNumber: '',
        phoneCountryCode: '',
        alternatePhoneNumber: '',
    };
}

/** Countries where the District field is commonly used */
export const DISTRICT_COUNTRIES = ['IN', 'BD', 'NP', 'LK', 'PK', 'MM', 'VN', 'TH', 'ID', 'PH', 'CN'];
