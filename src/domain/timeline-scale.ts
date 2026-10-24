import { formatDayMonth, formatMonth } from "./format-date";
import type { Locale } from "./schemas";

const DAY = 86400000;
export type TimelineTick = { key: string; pos: number; label: string; strong?: boolean };

/** Bound axis work by visible pixels, including multi-decade imported plans. */
export function timelineTicks(start: number, end: number, unit: "month" | "week" | "day", locale: Locale, width: number): TimelineTick[] {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return [];
  const limit = Math.max(2, Math.min(200, Math.floor(width / 64)));
  const days = Math.ceil((end - start) / DAY) + 1;
  const position = (ms: number) => (ms - start) / DAY / days * 100;
  const ticks: TimelineTick[] = [];
  const date = new Date(start);
  if (unit === "month") {
    const last = new Date(end);
    const months = (last.getUTCFullYear() - date.getUTCFullYear()) * 12 + last.getUTCMonth() - date.getUTCMonth() + 1;
    const monthLimit = months > 12 ? Math.max(2, Math.floor(width / 144)) : limit;
    const stride = Math.max(1, Math.ceil(months / monthLimit));
    let cursor = start;
    for (let index = 0; cursor <= end && index < monthLimit; index++) {
      ticks.push({ key: `m${cursor}`, pos: position(cursor), label: formatMonth(cursor, locale, months > 12), strong: true });
      cursor = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + (index + 1) * stride, 1);
    }
    return ticks;
  }
  const interval = unit === "week" ? 7 : 1;
  const stride = interval * Math.max(1, Math.ceil(days / interval / limit));
  const offset = unit === "week" ? (8 - date.getUTCDay()) % 7 : 0;
  for (let cursor = start + offset * DAY, index = 0; cursor <= end && index < limit; cursor += stride * DAY, index++) {
    ticks.push({ key: `${unit}${cursor}`, pos: position(cursor), label: formatDayMonth(cursor, locale), strong: index % 7 === 0 });
  }
  return ticks;
}
