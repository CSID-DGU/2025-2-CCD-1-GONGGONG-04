/**
 * Formats Korean phone numbers with hyphens
 *
 * @param phone - Phone number string (may have hyphens, spaces, or be plain digits)
 * @returns Formatted phone number (e.g., "02-1234-5678", "010-1234-5678")
 *
 * @example
 * ```typescript
 * formatPhoneNumber("02-1234-5678")  // "02-1234-5678"
 * formatPhoneNumber("0212345678")    // "02-1234-5678"
 * formatPhoneNumber("010 1234 5678") // "010-1234-5678"
 * formatPhoneNumber("01012345678")   // "010-1234-5678"
 * formatPhoneNumber(null)            // null
 * formatPhoneNumber("")              // null
 * ```
 */
export function formatPhoneNumber(phone: string | null): string | null {
  // Handle null or empty input
  if (!phone) {
    return null;
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Return null if empty after cleaning
  if (cleaned.length === 0) {
    return null;
  }

  // Format based on phone number pattern

  // 11-digit numbers (mobile or some region codes)
  if (cleaned.length === 11) {
    // Mobile numbers (010, 011, 016, 017, 018, 019)
    if (cleaned.startsWith('01')) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    // Region codes with 11 digits (e.g., 031-1234-5678)
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }

  // 10-digit numbers
  if (cleaned.length === 10) {
    // Seoul (02) - 02-XXXX-XXXX or 02-XXX-XXXX
    if (cleaned.startsWith('02')) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    // Other region codes (031, 032, etc.) - 0XX-XXX-XXXX
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // 9-digit numbers (Seoul with 3-digit local number)
  if (cleaned.length === 9 && cleaned.startsWith('02')) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }

  // If pattern doesn't match any known format, return original cleaned number
  return phone;
}
