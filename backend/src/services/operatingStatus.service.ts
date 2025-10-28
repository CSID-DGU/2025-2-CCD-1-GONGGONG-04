/**
 * Operating Status Service
 *
 * Handles business logic for center operating status calculation.
 * Implements status priority: NO_INFO > TEMP_CLOSED > HOLIDAY > CLOSING_SOON > OPEN/CLOSED
 *
 * @module services/operatingStatus
 */

import { PrismaClient } from '@prisma/client';
import {
  format,
  parseISO,
  isWithinInterval,
  differenceInMinutes,
  addDays,
  startOfDay,
  setHours,
  setMinutes
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const prisma = new PrismaClient();
const TIMEZONE = 'Asia/Seoul';
const CLOSING_SOON_THRESHOLD_MINUTES = 30;

/**
 * Operating status enum
 */
export enum OperatingStatus {
  OPEN = 'OPEN',
  CLOSING_SOON = 'CLOSING_SOON',
  CLOSED = 'CLOSED',
  HOLIDAY = 'HOLIDAY',
  TEMP_CLOSED = 'TEMP_CLOSED',
  NO_INFO = 'NO_INFO'
}

/**
 * Status configuration for each status type
 */
const STATUS_CONFIG = {
  [OperatingStatus.OPEN]: { color: 'green', priority: 5 },
  [OperatingStatus.CLOSING_SOON]: { color: 'yellow', priority: 4 },
  [OperatingStatus.CLOSED]: { color: 'gray', priority: 3 },
  [OperatingStatus.HOLIDAY]: { color: 'red', priority: 2 },
  [OperatingStatus.TEMP_CLOSED]: { color: 'red', priority: 1 },
  [OperatingStatus.NO_INFO]: { color: 'gray', priority: 0 }
};

/**
 * Operating hours interface
 */
interface OperatingHour {
  day_of_week: number;
  day_name: string;
  open_time: string | null;
  close_time: string | null;
  is_open: boolean;
}

/**
 * Holiday interface
 */
interface Holiday {
  holiday_date: Date;
  holiday_name: string;
  is_regular: boolean;
}

/**
 * Operating status response interface
 */
export interface OperatingStatusResponse {
  current_status: {
    status: OperatingStatus;
    message: string;
    status_color: string;
  };
  next_open: {
    date: string | null;
    day_name: string | null;
    open_time: string | null;
  } | null;
  weekly_hours: OperatingHour[];
  upcoming_holidays: Holiday[];
}

/**
 * Get operating hours from database view
 *
 * @param centerId - Center ID
 * @returns Promise<OperatingHour[]> - Weekly operating hours
 */
export async function getOperatingHours(centerId: number): Promise<OperatingHour[]> {
  try {
    const result = await prisma.$queryRaw<Array<{ weekly_hours: string }>>`
      SELECT weekly_hours
      FROM v_center_operating_status
      WHERE center_id = ${centerId}
      LIMIT 1
    `;

    if (!result || result.length === 0) {
      return [];
    }

    const weeklyHours = JSON.parse(result[0].weekly_hours);
    return Array.isArray(weeklyHours) ? weeklyHours : [];
  } catch (error) {
    console.error('[getOperatingHours] Error:', error);
    return [];
  }
}

/**
 * Get holidays from database
 *
 * @param centerId - Center ID
 * @param startDate - Start date for holiday range
 * @param endDate - End date for holiday range (optional, defaults to 14 days from start)
 * @returns Promise<Holiday[]> - List of holidays
 */
export async function getHolidays(
  centerId: number,
  startDate: Date,
  endDate?: Date
): Promise<Holiday[]> {
  try {
    const end = endDate || addDays(startDate, 14);
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(end, 'yyyy-MM-dd');

    const holidays = await prisma.$queryRaw<Holiday[]>`
      SELECT
        holiday_date,
        holiday_name,
        is_regular
      FROM center_holidays
      WHERE center_id = ${centerId}
        AND holiday_date >= ${startDateStr}
        AND holiday_date <= ${endDateStr}
      ORDER BY holiday_date ASC
    `;

    return holidays || [];
  } catch (error) {
    console.error('[getHolidays] Error:', error);
    return [];
  }
}

/**
 * Parse time string (HH:mm) to Date object for today
 *
 * @param timeStr - Time string in format "HH:mm"
 * @param baseDate - Base date to apply time to
 * @returns Date object with time applied
 */
function parseTime(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  let result = setHours(baseDate, hours);
  result = setMinutes(result, minutes);
  return result;
}

/**
 * Get Korean day name
 *
 * @param dayOfWeek - Day of week (0 = Sunday, 6 = Saturday)
 * @returns Korean day name
 */
function getDayName(dayOfWeek: number): string {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return days[dayOfWeek] || '';
}

/**
 * Calculate next open date using MySQL function
 *
 * @param centerId - Center ID
 * @param currentDate - Current date
 * @returns Promise with next open date information
 */
export async function calculateNextOpen(
  centerId: number,
  currentDate: Date
): Promise<{ date: string | null; day_name: string | null; open_time: string | null }> {
  try {
    const currentDateStr = format(currentDate, 'yyyy-MM-dd');

    const result = await prisma.$queryRaw<Array<{ next_open: string | null }>>`
      SELECT get_next_open_date(${centerId}, ${currentDateStr}) as next_open
    `;

    if (!result || result.length === 0 || !result[0].next_open) {
      return { date: null, day_name: null, open_time: null };
    }

    // Parse result: "2025-01-16 09:00:00"
    const nextOpenStr = result[0].next_open;
    const [dateStr, timeStr] = nextOpenStr.split(' ');
    const nextOpenDate = parseISO(dateStr);
    const dayOfWeek = nextOpenDate.getDay();

    return {
      date: dateStr,
      day_name: getDayName(dayOfWeek),
      open_time: timeStr.substring(0, 5) // "09:00"
    };
  } catch (error) {
    console.error('[calculateNextOpen] Error:', error);
    return { date: null, day_name: null, open_time: null };
  }
}

/**
 * Calculate operating status for a center at a specific time
 *
 * Business Logic Priority:
 * 1. NO_INFO - No operating hours information
 * 2. TEMP_CLOSED - Temporary closure (임시휴무)
 * 3. HOLIDAY - Regular holiday or public holiday
 * 4. CLOSING_SOON - Within 30 minutes before closing
 * 5. OPEN - Currently operating
 * 6. CLOSED - Outside operating hours
 *
 * @param centerId - Center ID
 * @param targetDate - Target date/time (defaults to current time in Asia/Seoul)
 * @returns Promise<OperatingStatusResponse> - Operating status response
 */
export async function calculateOperatingStatus(
  centerId: number,
  targetDate: Date = new Date()
): Promise<OperatingStatusResponse> {
  const startTime = Date.now();

  // Convert to Seoul timezone
  const seoulTime = toZonedTime(targetDate, TIMEZONE);

  // 1. Fetch operating hours and holidays in parallel
  const [hours, holidays] = await Promise.all([
    getOperatingHours(centerId),
    getHolidays(centerId, seoulTime)
  ]);

  // 2. Check NO_INFO - No operating hours
  if (!hours || hours.length === 0) {
    const nextOpen = await calculateNextOpen(centerId, seoulTime);

    return {
      current_status: {
        status: OperatingStatus.NO_INFO,
        message: '운영시간 정보가 없습니다',
        status_color: STATUS_CONFIG[OperatingStatus.NO_INFO].color
      },
      next_open: nextOpen,
      weekly_hours: [],
      upcoming_holidays: holidays.slice(0, 5)
    };
  }

  // 3. Get today's operating hours
  const dayOfWeek = seoulTime.getDay();
  const todayHours = hours.find(h => h.day_of_week === dayOfWeek);

  // 4. Check TEMP_CLOSED or HOLIDAY
  const todayDateStr = format(seoulTime, 'yyyy-MM-dd');
  const todayHoliday = holidays.find(h => {
    const holidayDateStr = format(h.holiday_date, 'yyyy-MM-dd');
    return holidayDateStr === todayDateStr;
  });

  if (todayHoliday) {
    const nextOpen = await calculateNextOpen(centerId, seoulTime);

    // Temporary closure has higher priority
    if (todayHoliday.is_regular === false && todayHoliday.holiday_name.includes('임시')) {
      return {
        current_status: {
          status: OperatingStatus.TEMP_CLOSED,
          message: `임시휴무 (${todayHoliday.holiday_name})`,
          status_color: STATUS_CONFIG[OperatingStatus.TEMP_CLOSED].color
        },
        next_open: nextOpen,
        weekly_hours: hours,
        upcoming_holidays: holidays.slice(0, 5)
      };
    }

    return {
      current_status: {
        status: OperatingStatus.HOLIDAY,
        message: `휴무 (${todayHoliday.holiday_name})`,
        status_color: STATUS_CONFIG[OperatingStatus.HOLIDAY].color
      },
      next_open: nextOpen,
      weekly_hours: hours,
      upcoming_holidays: holidays.slice(0, 5)
    };
  }

  // 5. Check regular weekly holiday
  if (!todayHours || !todayHours.is_open) {
    const nextOpen = await calculateNextOpen(centerId, seoulTime);

    return {
      current_status: {
        status: OperatingStatus.HOLIDAY,
        message: '정기휴무',
        status_color: STATUS_CONFIG[OperatingStatus.HOLIDAY].color
      },
      next_open: nextOpen,
      weekly_hours: hours,
      upcoming_holidays: holidays.slice(0, 5)
    };
  }

  // 6. Check operating hours (OPEN, CLOSING_SOON, CLOSED)
  if (!todayHours.open_time || !todayHours.close_time) {
    const nextOpen = await calculateNextOpen(centerId, seoulTime);

    return {
      current_status: {
        status: OperatingStatus.NO_INFO,
        message: '운영시간 정보가 없습니다',
        status_color: STATUS_CONFIG[OperatingStatus.NO_INFO].color
      },
      next_open: nextOpen,
      weekly_hours: hours,
      upcoming_holidays: holidays.slice(0, 5)
    };
  }

  const now = seoulTime;
  const todayStart = startOfDay(seoulTime);
  const openTime = parseTime(todayHours.open_time, todayStart);
  const closeTime = parseTime(todayHours.close_time, todayStart);

  // Check if currently within operating hours
  if (isWithinInterval(now, { start: openTime, end: closeTime })) {
    const minutesUntilClose = differenceInMinutes(closeTime, now);

    // CLOSING_SOON - within 30 minutes before closing
    if (minutesUntilClose <= CLOSING_SOON_THRESHOLD_MINUTES && minutesUntilClose > 0) {
      const duration = Date.now() - startTime;
      console.log(`[Operating Status Calculation] ${duration}ms`);

      return {
        current_status: {
          status: OperatingStatus.CLOSING_SOON,
          message: `곧 마감 (~${todayHours.close_time})`,
          status_color: STATUS_CONFIG[OperatingStatus.CLOSING_SOON].color
        },
        next_open: null,
        weekly_hours: hours,
        upcoming_holidays: holidays.slice(0, 5)
      };
    }

    // OPEN - currently operating
    const duration = Date.now() - startTime;
    console.log(`[Operating Status Calculation] ${duration}ms`);

    return {
      current_status: {
        status: OperatingStatus.OPEN,
        message: `운영 중 (~${todayHours.close_time})`,
        status_color: STATUS_CONFIG[OperatingStatus.OPEN].color
      },
      next_open: null,
      weekly_hours: hours,
      upcoming_holidays: holidays.slice(0, 5)
    };
  }

  // 7. CLOSED - outside operating hours
  const nextOpen = await calculateNextOpen(centerId, seoulTime);
  const duration = Date.now() - startTime;
  console.log(`[Operating Status Calculation] ${duration}ms`);

  return {
    current_status: {
      status: OperatingStatus.CLOSED,
      message: nextOpen && nextOpen.date
        ? `마감 (${nextOpen.day_name} ${nextOpen.open_time} 오픈)`
        : '마감',
      status_color: STATUS_CONFIG[OperatingStatus.CLOSED].color
    },
    next_open: nextOpen,
    weekly_hours: hours,
    upcoming_holidays: holidays.slice(0, 5)
  };
}
