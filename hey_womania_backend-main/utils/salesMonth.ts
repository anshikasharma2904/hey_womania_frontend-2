const INDIA_TIME_ZONE = "Asia/Kolkata";

function indiaParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

export function getSalesMonth(date = new Date()): string {
  const parts = indiaParts(date);
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  // The monthly window closes when the clock reaches 11:59 PM on the
  // calendar month's final day. Anything from that minute onward belongs to
  // the next sales cycle.
  if (day === lastDay && Number(parts.hour) === 23 && Number(parts.minute) >= 59) {
    const next = new Date(Date.UTC(year, month, 1));
    return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`;
  }

  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getClosingMonth(date = new Date()): string {
  const parts = indiaParts(date);
  return `${parts.year}-${parts.month}`;
}

export function isLastDayInIndia(date = new Date()): boolean {
  const parts = indiaParts(date);
  const lastDay = new Date(Date.UTC(Number(parts.year), Number(parts.month), 0)).getUTCDate();
  return Number(parts.day) === lastDay;
}
