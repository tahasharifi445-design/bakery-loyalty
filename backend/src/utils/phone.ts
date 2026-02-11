/**
 * Normalizes a phone number by stripping all non-digit characters.
 * Validates that the result is between 10-15 digits.
 * @param input - Raw phone number string
 * @returns Normalized phone number (digits only)
 * @throws Error if phone number is invalid
 */
export const normalizePhone = (input: string): string => {
  if (typeof input !== "string") {
    throw new Error("Invalid phone format");
  }

  const normalized = input.replace(/\D/g, "");

  if (normalized.length < 10 || normalized.length > 15) {
    throw new Error("Invalid phone format");
  }

  return normalized;
};
