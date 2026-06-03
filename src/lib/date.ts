export function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000);
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

export function isWithinDays(value: string, days: number) {
  const timestamp = new Date(value).getTime();
  return Date.now() - timestamp <= days * 86_400_000;
}
