/**
 * Holiday Service
 *
 * Handles public holiday data integration and management.
 * Integrates with Korean Public Data Portal API for holiday information.
 *
 * @module services/holiday
 */

import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { format, endOfMonth } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Public holiday API configuration
 * Using Korean Public Data Portal - Special Day Information Service
 */
const HOLIDAY_API_URL = 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService';
const HOLIDAY_API_KEY = process.env.HOLIDAY_API_KEY || '';

/**
 * Public holiday interface from API
 */
interface PublicHolidayAPIResponse {
  locdate: string; // "20250115" format
  dateName: string; // Holiday name (e.g., "설날")
  isHoliday: string; // "Y" or "N"
}

/**
 * Public holiday interface for internal use
 */
export interface PublicHoliday {
  date: Date;
  name: string;
}

/**
 * Fetch public holidays from Korean Public Data Portal API
 *
 * @param year - Year to fetch holidays for
 * @returns Promise<PublicHoliday[]> - List of public holidays
 *
 * @example
 * const holidays = await fetchPublicHolidays(2025);
 * // [{ date: Date('2025-01-01'), name: '신정' }, ...]
 */
export async function fetchPublicHolidays(year: number): Promise<PublicHoliday[]> {
  try {
    // If API key is not configured, return hardcoded holidays
    if (!HOLIDAY_API_KEY || HOLIDAY_API_KEY === '') {
      console.warn('[fetchPublicHolidays] API key not configured, using hardcoded holidays');
      return getHardcodedHolidays(year);
    }

    const response = await axios.get(`${HOLIDAY_API_URL}/getRestDeInfo`, {
      params: {
        serviceKey: decodeURIComponent(HOLIDAY_API_KEY),
        solYear: year,
        numOfRows: 100,
        _type: 'json',
      },
      timeout: 5000,
    });

    // Parse API response
    const items = response.data?.response?.body?.items?.item;

    if (!items) {
      console.warn('[fetchPublicHolidays] No items in API response, using hardcoded holidays');
      return getHardcodedHolidays(year);
    }

    // Handle single item (not array) case
    const holidayList: PublicHolidayAPIResponse[] = Array.isArray(items) ? items : [items];

    // Transform API response to internal format
    const publicHolidays: PublicHoliday[] = holidayList
      .filter(item => item.isHoliday === 'Y')
      .map(item => ({
        date: parseHolidayDate(item.locdate),
        name: item.dateName,
      }));

    console.log(`[fetchPublicHolidays] Fetched ${publicHolidays.length} holidays for year ${year}`);
    return publicHolidays;
  } catch (error) {
    console.error('[fetchPublicHolidays] API fetch failed:', error);
    console.warn('[fetchPublicHolidays] Falling back to hardcoded holidays');
    return getHardcodedHolidays(year);
  }
}

/**
 * Parse holiday date string from API format (YYYYMMDD) to Date object
 *
 * @param dateStr - Date string in format "20250115"
 * @returns Date object
 */
function parseHolidayDate(dateStr: string): Date {
  // "20250115" -> Date(2025, 0, 15)
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // Month is 0-indexed
  const day = parseInt(dateStr.substring(6, 8), 10);

  return new Date(year, month, day);
}

/**
 * Get hardcoded Korean public holidays as fallback
 * Used when API is unavailable or API key is not configured
 *
 * @param year - Year to get holidays for
 * @returns PublicHoliday[] - List of public holidays
 */
function getHardcodedHolidays(year: number): PublicHoliday[] {
  // Fixed holidays (same date every year)
  const fixedHolidays: PublicHoliday[] = [
    { date: new Date(year, 0, 1), name: '신정' },
    { date: new Date(year, 2, 1), name: '삼일절' },
    { date: new Date(year, 4, 5), name: '어린이날' },
    { date: new Date(year, 5, 6), name: '현충일' },
    { date: new Date(year, 7, 15), name: '광복절' },
    { date: new Date(year, 9, 3), name: '개천절' },
    { date: new Date(year, 9, 9), name: '한글날' },
    { date: new Date(year, 11, 25), name: '크리스마스' },
  ];

  // Lunar calendar holidays (approximate - should be calculated properly)
  // For MVP, using approximate dates. Should be replaced with proper lunar calendar calculation
  const lunarHolidays: PublicHoliday[] = [];

  if (year === 2025) {
    lunarHolidays.push(
      { date: new Date(2025, 0, 28), name: '설날 전날' },
      { date: new Date(2025, 0, 29), name: '설날' },
      { date: new Date(2025, 0, 30), name: '설날 다음날' },
      { date: new Date(2025, 4, 5), name: '부처님오신날' },
      { date: new Date(2025, 9, 5), name: '추석 전날' },
      { date: new Date(2025, 9, 6), name: '추석' },
      { date: new Date(2025, 9, 7), name: '추석 다음날' },
    );
  } else if (year === 2026) {
    lunarHolidays.push(
      { date: new Date(2026, 1, 16), name: '설날 전날' },
      { date: new Date(2026, 1, 17), name: '설날' },
      { date: new Date(2026, 1, 18), name: '설날 다음날' },
      { date: new Date(2026, 4, 24), name: '부처님오신날' },
      { date: new Date(2026, 8, 24), name: '추석 전날' },
      { date: new Date(2026, 8, 25), name: '추석' },
      { date: new Date(2026, 8, 26), name: '추석 다음날' },
    );
  }

  return [...fixedHolidays, ...lunarHolidays];
}

/**
 * Check if a specific date is a public holiday
 *
 * @param date - Date to check
 * @returns Promise<boolean> - True if date is a public holiday
 */
export async function isPublicHoliday(date: Date): Promise<boolean> {
  const year = date.getFullYear();
  const holidays = await fetchPublicHolidays(year);

  const targetDateStr = format(date, 'yyyy-MM-dd');

  return holidays.some(holiday => {
    const holidayDateStr = format(holiday.date, 'yyyy-MM-dd');
    return holidayDateStr === targetDateStr;
  });
}

/**
 * Sync public holidays to database for all centers
 *
 * @param year - Year to sync holidays for
 * @returns Promise<number> - Number of holidays synced
 */
export async function syncPublicHolidaysToDatabase(year: number): Promise<number> {
  try {
    console.log(`[syncPublicHolidaysToDatabase] Starting sync for year ${year}`);

    // Fetch public holidays from API
    const holidays = await fetchPublicHolidays(year);

    if (holidays.length === 0) {
      console.warn('[syncPublicHolidaysToDatabase] No holidays to sync');
      return 0;
    }

    // Get all active centers
    const centers = await prisma.center.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    if (centers.length === 0) {
      console.warn('[syncPublicHolidaysToDatabase] No active centers found');
      return 0;
    }

    // Create holiday records for all centers
    const holidayRecords = centers.flatMap(center =>
      holidays.map(holiday => ({
        centerId: center.id,
        holidayDate: holiday.date,
        holidayName: holiday.name,
        isRegular: false, // Public holidays are not regular weekly holidays
      })),
    );

    // Batch insert with skip duplicates
    const result = await prisma.centerHoliday.createMany({
      data: holidayRecords,
      skipDuplicates: true,
    });

    console.log(
      `[syncPublicHolidaysToDatabase] Synced ${holidays.length} holidays to ${centers.length} centers (${result.count} records created)`,
    );

    return result.count;
  } catch (error) {
    console.error('[syncPublicHolidaysToDatabase] Error:', error);
    throw error;
  }
}

/**
 * Generate regular weekly holidays for a center for a specific month
 * Based on center's operating hours (closed days)
 *
 * @param centerId - Center ID
 * @param month - Month to generate holidays for (Date object)
 * @returns Promise<number> - Number of holidays generated
 *
 * @example
 * // Generate regular holidays for January 2025
 * await generateRegularHolidays(1, new Date(2025, 0, 1));
 */
export async function generateRegularHolidays(centerId: number, month: Date): Promise<number> {
  try {
    console.log(
      `[generateRegularHolidays] Generating regular holidays for center ${centerId}, month ${format(month, 'yyyy-MM')}`,
    );

    // Get operating hours for center
    const operatingHours = await prisma.centerOperatingHour.findMany({
      where: {
        centerId: BigInt(centerId),
        isOpen: false, // Only closed days
      },
      select: { dayOfWeek: true },
    });

    if (operatingHours.length === 0) {
      console.log('[generateRegularHolidays] No closed days found for center');
      return 0;
    }

    const closedDays = operatingHours.map(h => h.dayOfWeek);

    // Generate holidays for all closed days in the month
    const holidays: Array<{ holidayDate: Date; holidayName: string }> = [];
    const lastDay = endOfMonth(month).getDate();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, monthIndex, day);
      const dayOfWeek = date.getDay();

      if (closedDays.includes(dayOfWeek)) {
        holidays.push({
          holidayDate: date,
          holidayName: getDayName(dayOfWeek),
        });
      }
    }

    if (holidays.length === 0) {
      console.log('[generateRegularHolidays] No holidays to generate');
      return 0;
    }

    // Insert into database
    const result = await prisma.centerHoliday.createMany({
      data: holidays.map(h => ({
        centerId: BigInt(centerId),
        holidayDate: h.holidayDate,
        holidayName: h.holidayName,
        isRegular: true,
      })),
      skipDuplicates: true,
    });

    console.log(`[generateRegularHolidays] Generated ${result.count} regular holidays`);
    return result.count;
  } catch (error) {
    console.error('[generateRegularHolidays] Error:', error);
    throw error;
  }
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
 * Generate regular holidays for all centers for a specific month
 *
 * @param month - Month to generate holidays for
 * @returns Promise<number> - Total number of holidays generated
 */
export async function generateRegularHolidaysForAllCenters(month: Date): Promise<number> {
  try {
    console.log(
      `[generateRegularHolidaysForAllCenters] Generating for month ${format(month, 'yyyy-MM')}`,
    );

    const centers = await prisma.center.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    let totalGenerated = 0;

    for (const center of centers) {
      const count = await generateRegularHolidays(Number(center.id), month);
      totalGenerated += count;
    }

    console.log(`[generateRegularHolidaysForAllCenters] Total generated: ${totalGenerated}`);
    return totalGenerated;
  } catch (error) {
    console.error('[generateRegularHolidaysForAllCenters] Error:', error);
    throw error;
  }
}
