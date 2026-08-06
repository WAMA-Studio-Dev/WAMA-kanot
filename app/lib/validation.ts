const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS_REGEX = /^\+?[0-9\s-]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  return value.trim() !== "" && PHONE_CHARS_REGEX.test(value.trim());
}

export function sanitizePhoneInput(raw: string): string {
  const cleaned = raw.replace(/[^0-9+\s-]/g, "");
  const hasLeadingPlus = cleaned.trimStart().startsWith("+");
  const withoutPlus = cleaned.replace(/\+/g, "");
  return hasLeadingPlus ? `+${withoutPlus}` : withoutPlus;
}

export function sanitizePhoneDigitsOnly(raw: string): string {
  return raw.replace(/[^0-9\s-]/g, "");
}
