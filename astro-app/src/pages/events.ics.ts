import { getEvents } from '../utils/sanity';

export const GET = async () => {
  const events = await getEvents('en');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Quadball Canada//EN',
  ];
  for (const e of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e._id}@quadballcanada.ca`);
    lines.push(`DTSTAMP:${toIcsDate(new Date().toISOString())}`);
    lines.push(`DTSTART:${toIcsDate(e.startDateTime)}`);
    if (e.endDateTime) lines.push(`DTEND:${toIcsDate(e.endDateTime)}`);
    lines.push(`SUMMARY:${escapeText(e.title)}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');

  return new Response(lines.join('\r\n'), {
    status: 200,
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
};

function toIcsDate(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}
function escapeText(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
