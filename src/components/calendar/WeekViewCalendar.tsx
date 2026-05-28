'use client';

// CRITICAL: This MUST be the very first import, before any @schedule-x imports.
// It sets globalThis.Temporal so that Schedule-X's instanceof checks
// (e.g. event.start instanceof Temporal.ZonedDateTime) pass correctly.
import 'temporal-polyfill/global';

import { useState, useMemo, useEffect } from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewWeek, createViewDay } from '@schedule-x/calendar';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';

const TIMEZONE = 'Asia/Kolkata';

// Custom wrapper to render our 4 slot states uniquely
function CustomTimeGridEvent({ calendarEvent }: { calendarEvent: any }) {
  const status = calendarEvent.slot_status;

  // Define colors based on slot state matching Athlo's design language
  const colors = {
    open: 'bg-transparent border-primary border-2 text-primary hover:bg-primary/10',
    booked: 'bg-success border-success text-white',
    pending_invite: 'bg-transparent border-warning border-dashed border-2 text-warning',
    blocked: 'bg-surface border-border text-text-muted stripes-pattern'
  };

  const styleClass = colors[status as keyof typeof colors] || colors.open;

  return (
    <div className={`w-full h-full rounded-md p-2 overflow-hidden text-xs font-medium transition-all cursor-pointer ${styleClass}`}>
      <div className="truncate font-bold mb-1">{calendarEvent.title}</div>
      <div className="truncate opacity-80 mt-0.5">
        {status === 'open' && 'Open Slot'}
        {status === 'booked' && `Session • ${calendarEvent.consultation_mode || 'In-Clinic'}`}
        {status === 'pending_invite' && 'Invite Sent'}
        {status === 'blocked' && 'Blocked Time'}
      </div>
    </div>
  );
}

/**
 * Build a Temporal.ZonedDateTime from a date string and time string.
 * Uses the global Temporal (set by temporal-polyfill/global) so that
 * Schedule-X's instanceof checks pass.
 */
function toZDT(dateStr: string, timeStr: string): Temporal.ZonedDateTime {
  const [year, month, day] = dateStr.split('-').map(Number);
  const timeParts = timeStr.split(':').map(Number);
  let hour = timeParts[0] || 0;
  let minute = timeParts[1] || 0;

  // Handle 24:00 edge case
  if (hour >= 24) {
    hour = 23;
    minute = 59;
  }

  return Temporal.PlainDateTime.from({
    year, month, day, hour, minute,
  }).toZonedDateTime(TIMEZONE);
}

export default function WeekViewCalendar({ initialSlots }: { initialSlots: any[] }) {
  // Map DB time_slots → Schedule-X events with Temporal.ZonedDateTime start/end
  const mappedEvents = useMemo(() => {
    if (!initialSlots || !Array.isArray(initialSlots)) return [];

    const events = initialSlots
      .filter(slot => slot?.slot_date && slot?.start_time && slot?.end_time)
      .map(slot => {
        try {
          const dateOnly = String(slot.slot_date).split('T')[0]; // YYYY-MM-DD

          // Build title based on status
          let title = '';
          if (slot.status === 'open') title = 'Available';
          else if (slot.status === 'booked') title = slot.athlete_name || 'Booked';
          else if (slot.status === 'pending_invite') title = slot.client_email || 'Pending Invite';
          else if (slot.status === 'blocked') title = 'Blocked';

          return {
            id: String(slot.id),
            start: toZDT(dateOnly, String(slot.start_time)),
            end: toZDT(dateOnly, String(slot.end_time)),
            title,
            slot_status: slot.status,
            consultation_mode: slot.consultation_mode,
          };
        } catch (err) {
          console.error('Failed to parse slot:', slot, err);
          return null;
        }
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    console.log('FINAL MAPPED EVENTS count:', events.length);
    return events;
  }, [initialSlots]);

  // Create the events service plugin once — this is the ONLY way to dynamically
  // set/update events in Schedule-X v4 after the calendar has been initialized.
  const [eventsService] = useState(() => createEventsServicePlugin());

  const calendarApp = useCalendarApp({
    views: [createViewWeek(), createViewDay()],
    events: mappedEvents,
    defaultView: createViewWeek().name,
    isDark: true,
    plugins: [eventsService, createEventModalPlugin()],
    dayBoundaries: {
      start: '06:00',
      end: '22:00',
    },
    callbacks: {
      onEventClick: (calendarEvent) => {
        console.log('Event clicked', calendarEvent);
      },
      onClickDate: (date) => {
        console.log('Empty date clicked for ad-hoc slot', date);
      },
    },
  });

  // Sync events into the calendar after mount / when data changes.
  // useCalendarApp only reads `events` on first render; this effect
  // ensures the events service pushes them into the live calendar.
  useEffect(() => {
    if (mappedEvents.length > 0) {
      eventsService.set(mappedEvents);
    }
  }, [mappedEvents, eventsService]);

  return (
    <div className="card p-0 overflow-hidden min-h-[600px] border-border/50 max-w-full">
      <ScheduleXCalendar
        calendarApp={calendarApp}
        customComponents={{
          timeGridEvent: CustomTimeGridEvent,
        }}
      />
    </div>
  );
}
