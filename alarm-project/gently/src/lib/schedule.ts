import dayjs from 'dayjs';

/**
 * Dates and durations for the app page, using dayjs.
 */

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * `2026-10-03` — names a calendar day.
 *
 * There is one alarm per day, so this is also how a single alarm is named,
 * which is what pausing the next one needs.
 */
export function dayKeyOf(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * The next time the alarm will go off.
 *
 * Each weekday has its own time and the week repeats, so this walks forward
 * day by day and returns the first one that has not happened yet. Eight days
 * are checked rather than seven: the eighth is today's weekday coming round
 * again, which is always still ahead, so there is always an answer — even with
 * one day skipped, since only one day ever is.
 *
 * `skippedDay` is a paused alarm, named by `dayKeyOf`. It is passed over as if
 * that day had no alarm, and the one after it is returned instead.
 */
export function nextAlarmAt(
  now: Date,
  timesByWeekday: number[],
  skippedDay: string | null = null,
): Date {
  for (let offset = 0; offset <= 7; offset += 1) {
    const day = dayjs(now).add(offset, 'day');
    const alarm = day.startOf('day').add(timesByWeekday[day.day()], 'minute');

    if (alarm.isAfter(dayjs(now)) && alarm.format('YYYY-MM-DD') !== skippedDay) {
      return alarm.toDate();
    }
  }

  // Not reachable, but a function that returns a date should always do so.
  return dayjs(now).add(1, 'day').toDate();
}

/** The `HH:mm` of a date, for showing the next alarm's time. */
export function timeOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** `MON · IN 02H 42M` — which day it is, and how long until then. */
export function formatUntil(now: Date, target: Date): string {
  const totalMinutes = Math.max(0, dayjs(target).diff(dayjs(now), 'minute'));

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${dayjs(target).format('ddd').toUpperCase()} · IN ${pad(hours)}H ${pad(minutes)}M`;
}

export type ScheduleDay = {
  /** `MON` */
  weekday: string;
  /** `24` */
  dayOfMonth: string;
  /** True for Saturday and Sunday, which the reference dims. */
  isWeekend: boolean;
  /** 0 = Sunday … 6 = Saturday. Use it to look up that day's wake time. */
  weekdayIndex: number;
  /** The date itself, from `dayKeyOf`, to tell whether its alarm is paused. */
  key: string;
};

/** The coming seven days, starting today. */
export function weekFrom(now: Date): ScheduleDay[] {
  return Array.from({ length: 7 }, (_, offset) => {
    const date = dayjs(now).add(offset, 'day');
    const weekday = date.day();

    return {
      weekday: date.format('ddd').toUpperCase(),
      dayOfMonth: date.format('DD'),
      isWeekend: weekday === 0 || weekday === 6,
      weekdayIndex: weekday,
      key: date.format('YYYY-MM-DD'),
    };
  });
}

/** `FEBRUARY 2025` for the month heading. */
export function formatMonth(now: Date): string {
  return dayjs(now).format('MMMM YYYY').toUpperCase();
}
