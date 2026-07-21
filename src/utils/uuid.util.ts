/**
 * UUID Utility
 * Handle UUID sanitization and validation
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Check if a value is a valid UUID
 */
export function isValidUUID(value: any): boolean {
  if (typeof value !== 'string') return false;
  return UUID_REGEX.test(value);
}

/**
 * Sanitize a UUID field - convert empty strings, undefined, null to null
 * and validate format if a value is provided
 */
export function sanitizeUUID(value: any): string | null {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return null;
  }
  const trimmed = value.trim();
  if (!isValidUUID(trimmed)) {
    return null;
  }
  return trimmed;
}

/**
 * Sanitize all UUID fields in an object
 * Converts empty strings to null for specified UUID fields
 */
export function sanitizeUUIDFields<T extends Record<string, any>>(
  obj: T,
  uuidFields: string[]
): T {
  const result = { ...obj };
  for (const field of uuidFields) {
    if (field in result) {
      (result as any)[field] = sanitizeUUID(result[field]);
    }
  }
  return result;
}

/**
 * Remove undefined or null values from an object
 */
export function removeNullUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      (result as any)[key] = value;
    }
  }
  return result;
}

export default {
  isValidUUID,
  sanitizeUUID,
  sanitizeUUIDFields,
  removeNullUndefined,
};