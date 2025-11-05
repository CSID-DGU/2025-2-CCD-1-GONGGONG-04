/**
 * Operating Score Calculation Service
 *
 * 운영 시간 기반 점수 계산 서비스
 * Sprint 2 - Task 3.2.2 & 3.2.3: Operating Hours Scoring Module
 *
 * @module services/scoring/operatingScore
 * @created 2025-01-27
 */

import {
  OperatingHour,
  Holiday,
  OperatingStatus,
  OperatingScoreResult,
  convertJsDayToDayOfWeek,
  getDayName,
} from '../../types/operatingHours';

/**
 * 현재 운영 중 여부 판단
 *
 * @param currentTime - 현재 시간
 * @param operatingHours - 센터의 운영 시간 배열
 * @param holidays - 센터의 휴무일 배열
 * @returns 운영 중 여부
 *
 * @example
 * ```typescript
 * const isOpen = isCurrentlyOpen(
 *   new Date('2025-01-27T14:00:00'),
 *   centerOperatingHours,
 *   centerHolidays
 * );
 * console.log(isOpen); // true or false
 * ```
 */
export function isCurrentlyOpen(
  currentTime: Date,
  operatingHours: OperatingHour[],
  holidays: Holiday[],
): boolean {
  // 1. 운영 시간 정보가 없는 경우
  if (!operatingHours || operatingHours.length === 0) {
    return false;
  }

  // 2. 오늘이 휴무일인지 확인
  if (isHolidayToday(currentTime, holidays)) {
    return false;
  }

  // 3. 현재 요일의 운영 시간 찾기
  const dayOfWeek = convertJsDayToDayOfWeek(currentTime.getDay());
  const todayHours = operatingHours.find(
    (oh) => oh.dayOfWeek === dayOfWeek && oh.isOpen && !oh.isHoliday,
  );

  if (!todayHours) {
    return false;
  }

  // 4. 운영 시간이 설정되지 않은 경우 (24시간 운영으로 간주)
  if (!todayHours.openTime || !todayHours.closeTime) {
    return true;
  }

  // 5. 현재 시간이 운영 시간 내인지 확인
  const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const openTimeMinutes = extractMinutesFromDate(todayHours.openTime);
  const closeTimeMinutes = extractMinutesFromDate(todayHours.closeTime);

  // 자정을 넘어가는 경우 처리 (예: 09:00 - 02:00)
  if (closeTimeMinutes < openTimeMinutes) {
    return currentTimeMinutes >= openTimeMinutes || currentTimeMinutes < closeTimeMinutes;
  }

  return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes;
}

/**
 * 오늘이 휴무일인지 확인
 *
 * @param currentTime - 현재 시간
 * @param holidays - 센터의 휴무일 배열
 * @returns 휴무일 여부
 */
export function isHolidayToday(currentTime: Date, holidays: Holiday[]): boolean {
  if (!holidays || holidays.length === 0) {
    return false;
  }

  const today = new Date(currentTime);
  today.setHours(0, 0, 0, 0);

  return holidays.some((holiday) => {
    if (!holiday.holidayDate) {
      return false;
    }

    const holidayDate = new Date(holiday.holidayDate);
    holidayDate.setHours(0, 0, 0, 0);

    return holidayDate.getTime() === today.getTime();
  });
}

/**
 * 마감까지 남은 시간 계산 (분 단위)
 *
 * @param currentTime - 현재 시간
 * @param operatingHours - 센터의 운영 시간 배열
 * @param holidays - 센터의 휴무일 배열
 * @returns 마감까지 남은 분 (운영 중이 아니면 null)
 *
 * @example
 * ```typescript
 * const minutes = getMinutesUntilClose(
 *   new Date('2025-01-27T17:30:00'), // 5:30 PM
 *   centerOperatingHours, // 9:00 AM - 6:00 PM
 *   centerHolidays
 * );
 * console.log(minutes); // 30 (마감 30분 전)
 * ```
 */
export function getMinutesUntilClose(
  currentTime: Date,
  operatingHours: OperatingHour[],
  holidays: Holiday[],
): number | null {
  // 운영 중이 아니면 null 반환
  if (!isCurrentlyOpen(currentTime, operatingHours, holidays)) {
    return null;
  }

  const dayOfWeek = convertJsDayToDayOfWeek(currentTime.getDay());
  const todayHours = operatingHours.find(
    (oh) => oh.dayOfWeek === dayOfWeek && oh.isOpen && !oh.isHoliday,
  );

  if (!todayHours || !todayHours.closeTime) {
    // 24시간 운영 (마감 시간 없음)
    return Infinity;
  }

  const currentTimeMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const closeTimeMinutes = extractMinutesFromDate(todayHours.closeTime);
  const openTimeMinutes = extractMinutesFromDate(todayHours.openTime!);

  // 자정을 넘어가는 경우 처리
  if (closeTimeMinutes < openTimeMinutes) {
    if (currentTimeMinutes >= openTimeMinutes) {
      // 오늘 영업 시작 후 ~ 자정
      return 24 * 60 - currentTimeMinutes + closeTimeMinutes;
    } else {
      // 자정 ~ 마감 시간
      return closeTimeMinutes - currentTimeMinutes;
    }
  }

  return closeTimeMinutes - currentTimeMinutes;
}

/**
 * 마감 임박 여부 판단 (1시간 이내)
 *
 * @param currentTime - 현재 시간
 * @param operatingHours - 센터의 운영 시간 배열
 * @param holidays - 센터의 휴무일 배열
 * @returns 마감 임박 여부
 */
export function isClosingSoon(
  currentTime: Date,
  operatingHours: OperatingHour[],
  holidays: Holiday[],
): boolean {
  const minutesUntilClose = getMinutesUntilClose(currentTime, operatingHours, holidays);

  if (minutesUntilClose === null || minutesUntilClose === Infinity) {
    return false;
  }

  return minutesUntilClose > 0 && minutesUntilClose <= 60; // 1시간(60분) 이내
}

/**
 * 다음 운영 시작 시간 계산
 *
 * @param currentTime - 현재 시간
 * @param operatingHours - 센터의 운영 시간 배열
 * @param holidays - 센터의 휴무일 배열
 * @param maxDaysToCheck - 최대 조회 일수 (기본값: 14일)
 * @returns 다음 운영 시작 시간 (찾지 못하면 null)
 *
 * @example
 * ```typescript
 * // 토요일 밤 10시
 * const nextOpen = getNextOpenTime(
 *   new Date('2025-01-25T22:00:00'),
 *   centerOperatingHours,
 *   centerHolidays
 * );
 * console.log(nextOpen); // 2025-01-27T09:00:00 (월요일 아침 9시)
 * ```
 */
export function getNextOpenTime(
  currentTime: Date,
  operatingHours: OperatingHour[],
  holidays: Holiday[],
  maxDaysToCheck: number = 14,
): Date | null {
  if (!operatingHours || operatingHours.length === 0) {
    return null;
  }

  // 현재 시간부터 14일간 검색
  for (let daysAhead = 0; daysAhead <= maxDaysToCheck; daysAhead++) {
    const checkDate = new Date(currentTime);
    checkDate.setDate(checkDate.getDate() + daysAhead);

    const dayOfWeek = convertJsDayToDayOfWeek(checkDate.getDay());
    const dayHours = operatingHours.find(
      (oh) => oh.dayOfWeek === dayOfWeek && oh.isOpen && !oh.isHoliday,
    );

    if (!dayHours) {
      continue; // 해당 요일 운영 안함
    }

    // 휴무일인지 확인
    if (isHolidayToday(checkDate, holidays)) {
      continue;
    }

    // 운영 시작 시간 설정
    if (!dayHours.openTime) {
      // 24시간 운영 (현재 이미 운영 중이므로 다음날로)
      continue;
    }

    const openTimeMinutes = extractMinutesFromDate(dayHours.openTime);
    const openHour = Math.floor(openTimeMinutes / 60);
    const openMinute = openTimeMinutes % 60;

    const nextOpenDate = new Date(checkDate);
    nextOpenDate.setHours(openHour, openMinute, 0, 0);

    // 오늘이면서 아직 오픈 시간이 안 지난 경우
    if (daysAhead === 0 && nextOpenDate > currentTime) {
      return nextOpenDate;
    }

    // 다음 날 이후
    if (daysAhead > 0) {
      return nextOpenDate;
    }
  }

  return null; // 14일 내에 운영일 없음
}

/**
 * 현재 운영 상태 판단
 *
 * @param currentTime - 현재 시간
 * @param operatingHours - 센터의 운영 시간 배열
 * @param holidays - 센터의 휴무일 배열
 * @returns 운영 상태 enum
 *
 * @example
 * ```typescript
 * const status = getCurrentOperatingStatus(
 *   new Date(),
 *   centerOperatingHours,
 *   centerHolidays
 * );
 * console.log(status); // OperatingStatus.OPEN
 * ```
 */
export function getCurrentOperatingStatus(
  currentTime: Date,
  operatingHours: OperatingHour[],
  holidays: Holiday[],
): OperatingStatus {
  // 1. 운영 정보 없음
  if (!operatingHours || operatingHours.length === 0) {
    return OperatingStatus.NO_INFORMATION;
  }

  // 2. 휴무일 체크
  if (isHolidayToday(currentTime, holidays)) {
    // 임시 휴무와 정기/공휴일 구분
    const todayHoliday = holidays.find((h) => {
      if (!h.holidayDate) {return false;}
      const holidayDate = new Date(h.holidayDate);
      holidayDate.setHours(0, 0, 0, 0);
      const today = new Date(currentTime);
      today.setHours(0, 0, 0, 0);
      return holidayDate.getTime() === today.getTime();
    });

    // isRegular === false 이면 임시 휴무로 간주
    if (todayHoliday && !todayHoliday.isRegular) {
      return OperatingStatus.TEMPORARY_CLOSED;
    }

    return OperatingStatus.HOLIDAY;
  }

  // 3. 현재 운영 중인지 확인
  if (isCurrentlyOpen(currentTime, operatingHours, holidays)) {
    // 마감 임박 여부 확인
    if (isClosingSoon(currentTime, operatingHours, holidays)) {
      return OperatingStatus.CLOSING_SOON;
    }
    return OperatingStatus.OPEN;
  }

  // 4. 운영 시간 외
  return OperatingStatus.CLOSED;
}

/**
 * 운영 시간 점수 계산
 *
 * 점수 산정 기준:
 * - 현재 운영중: 100점
 * - 마감 1시간 전: 80점
 * - 운영 시간 외 (다음날 영업): 60점
 * - 공휴일/휴무일: 0점
 * - 정보 없음: 50점
 * - 임시 휴무: 0점
 *
 * @param currentTime - 현재 시간
 * @param operatingHours - 센터의 운영 시간 배열
 * @param holidays - 센터의 휴무일 배열
 * @returns 운영 시간 점수 결과 (0-100점)
 *
 * @example
 * ```typescript
 * const scoreResult = calculateOperatingScore(
 *   new Date(),
 *   centerOperatingHours,
 *   centerHolidays
 * );
 * console.log(scoreResult.score); // 100
 * console.log(scoreResult.status); // OperatingStatus.OPEN
 * console.log(scoreResult.reason); // "현재 운영 중입니다"
 * ```
 */
export function calculateOperatingScore(
  currentTime: Date,
  operatingHours: OperatingHour[],
  holidays: Holiday[],
): OperatingScoreResult {
  try {
    const status = getCurrentOperatingStatus(currentTime, operatingHours, holidays);

    switch (status) {
      case OperatingStatus.OPEN: {
        const minutesUntilClose = getMinutesUntilClose(currentTime, operatingHours, holidays);
        return {
          score: 100,
          status,
          minutesUntilClose: minutesUntilClose !== null ? minutesUntilClose : undefined,
          reason: '현재 운영 중입니다',
        };
      }

      case OperatingStatus.CLOSING_SOON: {
        const minutesUntilClose = getMinutesUntilClose(currentTime, operatingHours, holidays);
        return {
          score: 80,
          status,
          minutesUntilClose: minutesUntilClose !== null ? minutesUntilClose : undefined,
          reason: `곧 마감합니다 (${minutesUntilClose}분 후)`,
        };
      }

      case OperatingStatus.CLOSED: {
        const nextOpenTime = getNextOpenTime(currentTime, operatingHours, holidays);
        if (nextOpenTime) {
          const daysDiff = Math.floor(
            (nextOpenTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24),
          );

          return {
            score: 60,
            status,
            nextOpenTime,
            reason:
              daysDiff === 0
                ? `오늘 ${nextOpenTime.getHours()}시에 운영 시작 예정`
                : daysDiff === 1
                  ? `내일 ${nextOpenTime.getHours()}시에 운영 시작 예정`
                  : `${getDayName(convertJsDayToDayOfWeek(nextOpenTime.getDay()))} ${
                    nextOpenTime.getHours()
                  }시에 운영 시작 예정`,
          };
        }

        return {
          score: 60,
          status,
          reason: '현재 운영 시간이 아닙니다',
        };
      }

      case OperatingStatus.HOLIDAY: {
        const nextOpenTime = getNextOpenTime(currentTime, operatingHours, holidays);
        return {
          score: 0,
          status,
          nextOpenTime: nextOpenTime || undefined,
          reason: '휴무일입니다',
        };
      }

      case OperatingStatus.TEMPORARY_CLOSED: {
        const nextOpenTime = getNextOpenTime(currentTime, operatingHours, holidays);
        return {
          score: 0,
          status,
          nextOpenTime: nextOpenTime || undefined,
          reason: '임시 휴무입니다',
        };
      }

      case OperatingStatus.NO_INFORMATION:
      default:
        return {
          score: 50,
          status: OperatingStatus.NO_INFORMATION,
          reason: '운영 시간 정보가 없습니다',
        };
    }
  } catch {
    // 에러 발생 시 기본값 반환
    return {
      score: 50,
      status: OperatingStatus.NO_INFORMATION,
      reason: '운영 시간 정보를 확인할 수 없습니다',
    };
  }
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * Date 객체에서 분 단위 시간 추출
 *
 * @param date - Date 객체 (TIME 타입에서 파싱된 값)
 * @returns 자정부터의 분 (0-1439)
 *
 * @example
 * ```typescript
 * const time = new Date('1970-01-01T14:30:00');
 * const minutes = extractMinutesFromDate(time);
 * console.log(minutes); // 870 (14 * 60 + 30)
 * ```
 */
export function extractMinutesFromDate(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * 시간 문자열 파싱 (HH:mm:ss 형식)
 *
 * @param timeString - 시간 문자열 (예: "14:30:00")
 * @returns 자정부터의 분
 */
export function parseTimeString(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * 두 시간의 차이 계산 (분 단위)
 *
 * @param startTime - 시작 시간
 * @param endTime - 종료 시간
 * @returns 시간 차이 (분)
 */
export function getTimeDifferenceInMinutes(startTime: Date, endTime: Date): number {
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.floor(diffMs / (1000 * 60));
}
