/**
 * Normalize an Indian phone number to exactly 10 digits.
 * Strips non-digits, an optional +91 / 91 country code, and a leading 0.
 * This MUST be used everywhere a phone is turned into the customer's
 * login email / password so account creation and login always agree.
 */
export function normalizePhone(raw: string): string {
  let digits = (raw || "").replace(/\D/g, "")
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1)
  return digits
}

/** The synthetic email used as the customer's Supabase auth identity. */
export function customerEmail(raw: string): string {
  return `${normalizePhone(raw)}@aurafirm.customer`
}
