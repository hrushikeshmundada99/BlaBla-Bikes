/**
 * Date and timezone utilities for Nashik rides (Asia/Kolkata, UTC+5:30).
 */

/**
 * Returns UTC ISO strings for the start and end of a given calendar date in Asia/Kolkata timezone.
 * dateString format: "YYYY-MM-DD"
 */
export function getIstDayBounds(dateString: string): {
  startIso: string;
  endIso: string;
} {
  const [yearStr, monthStr, dayStr] = dateString.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  // In Asia/Kolkata (UTC+05:30):
  // 00:00:00.000 IST is the previous day 18:30:00.000 UTC
  // 23:59:59.999 IST is current day 18:29:59.999 UTC
  const startUtc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  startUtc.setUTCMinutes(startUtc.getUTCMinutes() - 330); // Subtract 5h 30m

  const endUtc = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  endUtc.setUTCMinutes(endUtc.getUTCMinutes() - 330);

  return {
    startIso: startUtc.toISOString(),
    endIso: endUtc.toISOString(),
  };
}

/**
 * Formats an ISO departure date into localized time and date string for Nashik commuters.
 */
export function formatRideDateTime(
  isoString: string,
  locale: string = "en"
): {
  date: string;
  time: string;
  full: string;
} {
  const dateObj = new Date(isoString);

  const date = new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(dateObj);

  const time = new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);

  return {
    date,
    time,
    full: `${date}, ${time}`,
  };
}

