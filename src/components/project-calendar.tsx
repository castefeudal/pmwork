"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { projectCalendarEvents } from "@/domain/calendar";
import { formatDate } from "@/domain/format-date";
import { localDay } from "@/domain/work-views";
import type { Locale, Workspace } from "@/domain/schemas";
import type { EditableKind } from "./record-editor";

function monthDay(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function ProjectCalendar({ workspace, projectId, locale, workItemIds, onEdit }: {
  workspace: Workspace;
  projectId: string;
  locale: Locale;
  workItemIds: ReadonlySet<string>;
  onEdit: (kind: EditableKind, id: string) => void;
}) {
  const ru = locale === "ru";
  const [selectedDate, setSelectedDate] = useState(localDay());
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate.slice(0, 7));
  const events = useMemo(() => projectCalendarEvents(workspace, projectId, locale, workItemIds), [workspace, projectId, locale, workItemIds]);
  const [year, month] = visibleMonth.split("-").map(Number);
  const first = new Date(Date.UTC(year!, month! - 1, 1));
  const offset = ru ? (first.getUTCDay() + 6) % 7 : first.getUTCDay();
  const count = new Date(Date.UTC(year!, month!, 0)).getUTCDate();
  const cells: Array<number | null> = [...Array.from({ length: offset }, () => null), ...Array.from({ length: count }, (_, index) => index + 1)];
  const weekdays = Array.from({ length: 7 }, (_, index) => {
    const day = ru ? (index + 1) % 7 : index;
    return new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 7 + day)));
  });
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(first);
  const selectedEvents = events.filter(event => event.date === selectedDate);
  const shiftMonth = (offset: number) => {
    const next = new Date(Date.UTC(year!, month! - 1 + offset, 1));
    const firstDay = monthDay(next.getUTCFullYear(), next.getUTCMonth(), 1);
    setVisibleMonth(firstDay.slice(0, 7)); setSelectedDate(firstDay);
  };
  const editEvent = (event: typeof events[number]) => {
    if (event.kind === "milestone") onEdit("milestone", event.id);
    else if (event.kind === "risk-review") onEdit("risk", event.id);
    else onEdit("work", event.id.slice(0, event.id.lastIndexOf(":")));
  };
  const eventsOn = (day: string) => events.filter(event => event.date === day);

  return <section className="panel project-calendar" aria-label={ru ? "Календарь проекта" : "Project calendar"}>
    <div className="calendar-toolbar">
      <button className="button small" aria-label={ru ? "Предыдущий месяц" : "Previous month"} onClick={() => shiftMonth(-1)}><ChevronLeft size={16}/></button>
      <h3>{monthLabel}</h3>
      <button className="button small" aria-label={ru ? "Следующий месяц" : "Next month"} onClick={() => shiftMonth(1)}><ChevronRight size={16}/></button>
      <button className="button small" onClick={() => { const today = localDay(); setSelectedDate(today); setVisibleMonth(today.slice(0, 7)); }}>{ru ? "Сегодня" : "Today"}</button>
    </div>
    <div className="calendar-layout">
      <div className="calendar-month" aria-label={ru ? `Дни месяца ${monthLabel}` : `Days in ${monthLabel}`}>
        {weekdays.map((day, index) => <span className="calendar-weekday" key={`${day}-${index}`}>{day}</span>)}
        {cells.map((day, index) => {
          if (day === null) return <span aria-hidden="true" className="calendar-day calendar-day-empty" key={`empty-${index}`}/>;
          const date = monthDay(year!, month! - 1, day), dayEvents = eventsOn(date);
          return <button type="button" key={date} className={`calendar-day ${selectedDate === date ? "selected" : ""} ${localDay() === date ? "today" : ""}`} aria-pressed={selectedDate === date} aria-label={`${formatDate(date, locale)}${dayEvents.length ? ` · ${dayEvents.length} ${ru ? "событий" : "events"}` : ""}`} onClick={() => setSelectedDate(date)}>
            <span>{day}</span>{dayEvents.length > 0 && <small aria-hidden="true">{dayEvents.length}</small>}
          </button>;
        })}
      </div>
      <section className="calendar-agenda" aria-live="polite" aria-atomic="true">
        <p className="eyebrow">{ru ? "ПЛАН НА ДЕНЬ" : "DAY AGENDA"}</p>
        <h4>{formatDate(selectedDate, locale)}</h4>
        {selectedEvents.length ? <ul>{selectedEvents.map(event => <li key={event.id}>
          <span className={`calendar-event-kind ${event.kind}`}><CalendarDays size={15}/>{event.detail}</span>
          <button className="calendar-event-link" onClick={() => editEvent(event)}>{event.title}</button>
        </li>)}</ul> : <div className="empty-state compact-empty"><p>{ru ? "На эту дату нет записанных событий." : "No recorded events on this date."}</p><p className="muted">{ru ? "Календарь показывает только сроки, даты начала, прогнозы и обзоры из проекта." : "The calendar shows only dates already recorded in the project."}</p></div>}
      </section>
    </div>
  </section>;
}
