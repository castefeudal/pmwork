import type { Locale } from './schemas';
/** Date-only fields are calendar days, so formatting must not shift timezones. */
export function formatDate(value:string|undefined,locale:Locale):string {
 if(!value)return '—';const date=new Date(value);if(!Number.isFinite(date.getTime()))return '—';
 return new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date);
}
/** Short calendar-day label for dense schedules: keeps the year out of repeated row labels. */
export function formatDayMonth(value:string|number|Date,locale:Locale):string {
 const date=value instanceof Date?value:new Date(value);if(!Number.isFinite(date.getTime()))return '—';
 return new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',timeZone:'UTC'}).format(date);
}
/** Month label used by timeline axes. */
export function formatMonth(value:string|number|Date,locale:Locale,long=false):string {
 const date=value instanceof Date?value:new Date(value);if(!Number.isFinite(date.getTime()))return '—';
 return new Intl.DateTimeFormat(locale,{month:long?'long':'short',...(long?{year:'numeric' as const}:{}),timeZone:'UTC'}).format(date);
}
