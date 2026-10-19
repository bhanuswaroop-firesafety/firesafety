/**
 * Sri Udharchi Enterprises - Timezone & Date Utilities
 * Enforces Asia/Kolkata (IST: UTC+05:30) timezone logic across all date calculations.
 */

export const TIMEZONE = "Asia/Kolkata";

/**
 * Returns current timestamp in ISO-like string format with IST offset or UTC ISO
 */
export function getKolkataISOString(): string {
  return new Date().toISOString();
}

/**
 * Returns current date formatted as YYYY-MM-DD in Asia/Kolkata
 */
export function getKolkataDateString(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // Intl.DateTimeFormat formatted for Asia/Kolkata
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
}

/**
 * Formats a date for human display in Asia/Kolkata (e.g. "17 Oct 2026")
 */
export function formatKolkataDisplay(
  date: Date | string = new Date(),
  includeTime = false,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? { hour: "2-digit", minute: "2-digit", hour12: true }
      : {}),
  };
  return new Intl.DateTimeFormat("en-IN", options).format(d);
}

/**
 * Adds days to a date in Asia/Kolkata and returns YYYY-MM-DD
 */
export function addDaysKolkata(dateStr: string, days: number): string {
  // Parse date components to avoid UTC drift
  const parts = dateStr.split("-").map(Number);
  const y = parts[0] ?? 2026;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Subtracts days from a date in Asia/Kolkata and returns YYYY-MM-DD
 */
export function subtractDaysKolkata(dateStr: string, days: number): string {
  return addDaysKolkata(dateStr, -days);
}

/**
 * Clamps month-end dates when adding months.
 * Example: 31st Oct + 12 months = 31st Oct next year.
 * Example: 31st Jan + 1 month = 28th/29th Feb.
 * Example: 31st March + 6 months = 30th Sep.
 */
export function addMonthsWithClamp(startDateStr: string, monthsToAdd: number): string {
  const parts = startDateStr.split("-").map(Number);
  const y = parts[0] ?? 2026;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  const targetYear = y + Math.floor((m - 1 + monthsToAdd) / 12);
  const targetMonth = ((m - 1 + monthsToAdd) % 12) + 1;

  // Determine max days in target month
  // Day 0 of next month returns the last day of targetMonth
  const maxDaysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  const clampedDay = Math.min(d, maxDaysInTargetMonth);

  const formattedMonth = String(targetMonth).padStart(2, "0");
  const formattedDay = String(clampedDay).padStart(2, "0");

  return `${targetYear}-${formattedMonth}-${formattedDay}`;
}

/**
 * Calculates delivery date window in Asia/Kolkata based on shipping type
 */
export function calculateDeliveryWindow(
  shippingType: "standard" | "priority",
  settings?: {
    standardDaysMin?: number;
    standardDaysMax?: number;
    priorityDaysMin?: number;
    priorityDaysMax?: number;
  },
): {
  fromISO: string;
  toISO: string;
  fromDisplay: string;
  toDisplay: string;
  label: string;
} {
  const today = getKolkataDateString();
  const stdMin = settings?.standardDaysMin ?? 5;
  const stdMax = settings?.standardDaysMax ?? 7;
  const prioMin = settings?.priorityDaysMin ?? 1;
  const prioMax = settings?.priorityDaysMax ?? 2;

  const minDays = shippingType === "priority" ? prioMin : stdMin;
  const maxDays = shippingType === "priority" ? prioMax : stdMax;

  const fromISO = addDaysKolkata(today, minDays);
  const toISO = addDaysKolkata(today, maxDays);

  const fromDisplay = formatKolkataDisplay(new Date(fromISO + "T00:00:00.000Z"));
  const toDisplay = formatKolkataDisplay(new Date(toISO + "T00:00:00.000Z"));

  const label =
    shippingType === "priority"
      ? `Priority Dispatch (${minDays} to ${maxDays} days)`
      : `Standard Delivery (${minDays} to ${maxDays} days)`;

  return { fromISO, toISO, fromDisplay, toDisplay, label };
}

/**
 * Checks if a date has passed or is today in Asia/Kolkata
 */
export function isDateDueOrPassed(targetDateStr: string): boolean {
  const todayStr = getKolkataDateString();
  return targetDateStr <= todayStr;
}

/**
 * Calculates days difference between two YYYY-MM-DD dates in Asia/Kolkata
 */
export function getDaysDiff(fromDateStr: string, toDateStr: string): number {
  const p1 = fromDateStr.split("-").map(Number);
  const p2 = toDateStr.split("-").map(Number);
  const y1 = p1[0] ?? 2026;
  const m1 = p1[1] ?? 1;
  const d1 = p1[2] ?? 1;
  const y2 = p2[0] ?? 2026;
  const m2 = p2[1] ?? 1;
  const d2 = p2[2] ?? 1;
  const t1 = Date.UTC(y1, m1 - 1, d1);
  const t2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
}
