/**
 * Utility functions for validating and formatting mobile phone numbers for real SMS OTP.
 * Compliant with ITU-T E.164 and National Numbering Plan of India (DoT/TRAI)
 */

export interface PhoneValidationResult {
  valid: boolean;
  e164: string; // e.g. "+919876543210"
  national: string; // e.g. "9876543210"
  formatted: string; // e.g. "+91 98765 43210"
  countryCode: string; // e.g. "+91"
  error?: string;
}

export interface CountryCodeOption {
  code: string; // e.g. "+91"
  country: string; // e.g. "India"
  flag: string; // e.g. "🇮🇳"
  digits: number; // expected national digits
}

export const SUPPORTED_COUNTRY_CODES: CountryCodeOption[] = [
  { code: "+91", country: "India", flag: "🇮🇳", digits: 10 },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸", digits: 10 },
  { code: "+971", country: "UAE", flag: "🇦🇪", digits: 9 },
  { code: "+44", country: "UK", flag: "🇬🇧", digits: 10 },
  { code: "+65", country: "Singapore", flag: "🇸🇬", digits: 8 },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦", digits: 9 },
  { code: "+61", country: "Australia", flag: "🇦🇺", digits: 9 },
];

/**
 * Normalizes and validates a mobile phone number entered by a user.
 * Supports country codes (defaulting to India +91).
 */
export function normalizePhoneNumber(
  input: string,
  selectedCountryCode: string = "+91",
): PhoneValidationResult {
  if (!input || !input.trim()) {
    return {
      valid: false,
      e164: "",
      national: "",
      formatted: "",
      countryCode: selectedCountryCode,
      error: "Please enter your mobile phone number.",
    };
  }

  const raw = input.trim();
  const digitsOnly = raw.replace(/\D/g, "");

  // If user selected India (+91)
  if (selectedCountryCode === "+91") {
    let national = digitsOnly;

    // Handle leading 91 or leading 0
    if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
      national = digitsOnly.slice(2);
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
      national = digitsOnly.slice(1);
    } else if (digitsOnly.length > 10) {
      national = digitsOnly.slice(-10);
    }

    if (national.length !== 10) {
      return {
        valid: false,
        e164: "",
        national,
        formatted: raw,
        countryCode: "+91",
        error: `Invalid length (${national.length}/10 digits). An Indian mobile number must be exactly 10 digits.`,
      };
    }

    // Must start with 6, 7, 8, or 9
    if (!/^[6-9]/.test(national)) {
      return {
        valid: false,
        e164: "",
        national,
        formatted: raw,
        countryCode: "+91",
        error: "Indian mobile numbers must start with 6, 7, 8, or 9.",
      };
    }

    const e164 = `+91${national}`;
    const formatted = `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
    return {
      valid: true,
      e164,
      national,
      formatted,
      countryCode: "+91",
    };
  }

  // Generic international handling
  const cleanCodeDigits = selectedCountryCode.replace(/\D/g, "");
  let national = digitsOnly;
  if (digitsOnly.startsWith(cleanCodeDigits)) {
    national = digitsOnly.slice(cleanCodeDigits.length);
  }

  if (national.length < 6 || national.length > 15) {
    return {
      valid: false,
      e164: "",
      national,
      formatted: raw,
      countryCode: selectedCountryCode,
      error: `Invalid phone number length (${national.length} digits).`,
    };
  }

  const e164 = `${selectedCountryCode}${national}`;
  return {
    valid: true,
    e164,
    national,
    formatted: `${selectedCountryCode} ${national}`,
    countryCode: selectedCountryCode,
  };
}

/**
 * Backward compatibility alias
 */
export function normalizeIndianPhoneNumber(input: string): PhoneValidationResult {
  return normalizePhoneNumber(input, "+91");
}

/**
 * Formats a phone number string for clean UI display.
 */
export function formatIndianMobileDisplay(phone?: string | null): string {
  if (!phone) return "";
  const cleaned = phone.trim();
  const res = normalizeIndianPhoneNumber(cleaned);
  if (res.valid) {
    return res.formatted;
  }
  return cleaned;
}
