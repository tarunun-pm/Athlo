'use client';

import { useState, useMemo } from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewWeek, createViewDay } from '@schedule-x/calendar';
import { createEventModalPlugin } from '@schedule-x/event-modal';
import '@schedule-x/theme-default/dist/index.css';
import { Temporal } from 'temporal-polyfill';

// Use polyfill if your environment doesn't support Temporal yet

type Slot = {
  id: string;
  start: string; // YYYY-MM-DD HH:mm
  end: string; // YYYY-MM-DD HH:mm
  title: string;
  slot_status: 'open' | 'booked' | 'pending_invite' | 'blocked';
  consultation_mode?: string;
  // Additional meta fields can be placed here, mapped to Schedule-X event properties or passed in an object
  [key: string]: any;
};

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

export default function WeekViewCalendar({ initialSlots }: { initialSlots: any[] }) {
  // Map our DB time_slots to Schedule-X events
  const mappedEvents = useMemo(() => {
    if (!initialSlots || !Array.isArray(initialSlots)) return [];

    const events = initialSlots
      .filter(slot => slot?.slot_date && slot?.start_time && slot?.end_time)
      .map(slot => {
        try {
          // 1. Force strict Date mapping (YYYY-MM-DD)
          const dateOnly = String(slot.slot_date).split('T')[0];
          const [year, month, day] = dateOnly.split('-');
          if (!year || !month || !day) return null;
          const safeDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          
          // 2. Force strict Time mapping (HH:mm)
          const startParts = String(slot.start_time).split(':');
          const endParts = String(slot.end_time).split(':');
          
          if (!startParts[0] || !endParts[0]) return null;

          let startHour = startParts[0].padStart(2, '0');
          let startMin = startParts[1] ? startParts[1].padStart(2, '0') : '00';
          let endHour = endParts[0].padStart(2, '0');
          let endMin = endParts[1] ? endParts[1].padStart(2, '0') : '00';

          // Handle 24:00 edge case -> roll back to 23:59 for Schedule-X compatibility
          if (endHour === '24') {
              endHour = '23';
              endMin = '59';
          }


          
          let title = '';

          if (slot.status === 'open') title = 'Available';
          else if (slot.status === 'booked') title = slot.athlete_name || 'Booked';
          else if (slot.status === 'pending_invite') title = slot.client_email || 'Pending Invite';
          else if (slot.status === 'blocked') title = 'Blocked';

          return {
            id: String(slot.id),
            start: `${safeDate} ${startHour}:${startMin}`,
            end: `${safeDate} ${endHour}:${endMin}`,
            title: title,
            slot_status: slot.status,
            consultation_mode: slot.consultation_mode
          } as Slot;
        } catch (err) {
            console.error("Failed to parse slot: ", slot, err);
            return null;
        }
    }).filter(event => event !== null) as Slot[];
    
    console.log("FINAL MAPPED EVENTS: ", events);
    return events;
  }, [initialSlots]);

  const plugins = useMemo(() => [
    createEventModalPlugin(),
  ], []);

  const calendarApp = useCalendarApp({
    views: [createViewWeek(), createViewDay()],
    events: mappedEvents,
    defaultView: createViewWeek().name,
    isDark: true, // Match Athlo's dark theme
    skipValidation: true, // Bypass strict Temporal validation instance checks
    plugins: plugins,
    dayBoundaries: {
      start: '06:00',
      end: '22:00', // Typical working hours based on context
    },
    callbacks: {
      // We can intercept drag and drop, clicks, etc. here later
      onEventClick: (calendarEvent) => {
        console.log('Event clicked', calendarEvent);
      },
      onClickDate: (date) => {
         console.log('Empty date clicked for ad-hoc slot', date);
      }
    }
  });

  return (
    <div className="card p-0 overflow-hidden min-h-[600px] border-border/50 max-w-full">
      {/* Schedule-X has its own internal wrapper, we configure it dark natively above */}
      <ScheduleXCalendar 
        calendarApp={calendarApp} 
        customComponents={{
          timeGridEvent: CustomTimeGridEvent,
        }}
      />
    </div>
  );
}
