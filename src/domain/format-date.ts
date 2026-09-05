import type { Locale } from './schemas';
/** Date-only fields are calendar days, so formatting must not shift timezones. */
export function formatDate(value:string|undefined,locale:Locale):string {
 if(!value)return '—';const date=new Date(value);if(!Number.isFinite(date.getTime()))return '—';
 return new Intl.DateTimeFormat(locale,{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date);
}
