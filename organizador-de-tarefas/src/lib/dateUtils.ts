/**
 * Timezone-safe local date utility functions.
 * Prevents discrepancies in statistics, charts, and daily progress due to UTC timezone shifts.
 */

/**
 * Returns a YYYY-MM-DD string for a given Date in the user's local timezone.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Safely converts an ISO datetime string (or date string) to a YYYY-MM-DD string
 * matching the user's local timezone.
 */
export function getLocalDateStringFromISO(isoString?: string): string {
  if (!isoString) return "";
  
  // If it's already exactly a simple YYYY-MM-DD date string, return it as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoString)) {
    return isoString;
  }
  
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    return getLocalDateString(d);
  } catch {
    return "";
  }
}
