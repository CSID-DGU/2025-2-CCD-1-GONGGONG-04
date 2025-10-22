/**
 * Operating Status Service Unit Tests
 *
 * Tests all business logic for operating status calculation
 * Covers: NO_INFO, TEMP_CLOSED, HOLIDAY, CLOSING_SOON, OPEN, CLOSED
 *
 * @module tests/services/operatingStatus
 */

import { PrismaClient } from '@prisma/client';
import {
  calculateOperatingStatus,
  getOperatingHours,
  getHolidays,
  calculateNextOpen,
  OperatingStatus
} from '../../src/services/operatingStatus.service';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    $queryRaw: jest.fn(),
    center: {
      findUnique: jest.fn(),
      update: jest.fn()
    }
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma)
  };
});

const prisma = new PrismaClient();

describe('Operating Status Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOperatingHours', () => {
    it('should return weekly hours from database view', async () => {
      const mockWeeklyHours = [
        { day_of_week: 0, day_name: '일요일', open_time: null, close_time: null, is_open: false },
        { day_of_week: 1, day_name: '월요일', open_time: '09:00', close_time: '18:00', is_open: true },
        { day_of_week: 2, day_name: '화요일', open_time: '09:00', close_time: '18:00', is_open: true },
        { day_of_week: 3, day_name: '수요일', open_time: '09:00', close_time: '18:00', is_open: true },
        { day_of_week: 4, day_name: '목요일', open_time: '09:00', close_time: '18:00', is_open: true },
        { day_of_week: 5, day_name: '금요일', open_time: '09:00', close_time: '18:00', is_open: true },
        { day_of_week: 6, day_name: '토요일', open_time: null, close_time: null, is_open: false }
      ];

      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { weekly_hours: JSON.stringify(mockWeeklyHours) }
      ]);

      const result = await getOperatingHours(1);

      expect(result).toEqual(mockWeeklyHours);
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no operating hours found', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const result = await getOperatingHours(999);

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getOperatingHours(1);

      expect(result).toEqual([]);
    });
  });

  describe('getHolidays', () => {
    it('should return holidays within date range', async () => {
      const mockHolidays = [
        { holiday_date: new Date('2025-01-01'), holiday_name: '신정', is_regular: false },
        { holiday_date: new Date('2025-01-05'), holiday_name: '일요일', is_regular: true }
      ];

      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockHolidays);

      const result = await getHolidays(1, new Date('2025-01-01'), new Date('2025-01-14'));

      expect(result).toEqual(mockHolidays);
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should use default end date (14 days) when not provided', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      await getHolidays(1, new Date('2025-01-01'));

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should handle database errors gracefully', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getHolidays(1, new Date('2025-01-01'));

      expect(result).toEqual([]);
    });
  });

  describe('calculateNextOpen', () => {
    it('should return next open date from MySQL function', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([
        { next_open: '2025-01-16 09:00:00' }
      ]);

      const result = await calculateNextOpen(1, new Date('2025-01-15'));

      expect(result).toEqual({
        date: '2025-01-16',
        day_name: '목요일',
        open_time: '09:00'
      });
    });

    it('should return null values when no next open date', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ next_open: null }]);

      const result = await calculateNextOpen(1, new Date('2025-01-15'));

      expect(result).toEqual({
        date: null,
        day_name: null,
        open_time: null
      });
    });

    it('should handle database errors gracefully', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await calculateNextOpen(1, new Date('2025-01-15'));

      expect(result).toEqual({
        date: null,
        day_name: null,
        open_time: null
      });
    });
  });

  describe('calculateOperatingStatus', () => {
    const mockWeeklyHours = [
      { day_of_week: 0, day_name: '일요일', open_time: null, close_time: null, is_open: false },
      { day_of_week: 1, day_name: '월요일', open_time: '09:00', close_time: '18:00', is_open: true },
      { day_of_week: 2, day_name: '화요일', open_time: '09:00', close_time: '18:00', is_open: true },
      { day_of_week: 3, day_name: '수요일', open_time: '09:00', close_time: '18:00', is_open: true },
      { day_of_week: 4, day_name: '목요일', open_time: '09:00', close_time: '18:00', is_open: true },
      { day_of_week: 5, day_name: '금요일', open_time: '09:00', close_time: '18:00', is_open: true },
      { day_of_week: 6, day_name: '토요일', open_time: null, close_time: null, is_open: false }
    ];

    describe('NO_INFO status', () => {
      it('should return NO_INFO when no operating hours exist', async () => {
        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([]) // getOperatingHours
          .mockResolvedValueOnce([]) // getHolidays
          .mockResolvedValueOnce([{ next_open: null }]); // calculateNextOpen

        const result = await calculateOperatingStatus(1, new Date('2025-01-15 12:00:00'));

        expect(result.current_status.status).toBe(OperatingStatus.NO_INFO);
        expect(result.current_status.message).toBe('운영시간 정보가 없습니다');
        expect(result.current_status.status_color).toBe('gray');
        expect(result.weekly_hours).toEqual([]);
      });
    });

    describe('TEMP_CLOSED status', () => {
      it('should return TEMP_CLOSED for temporary closure', async () => {
        const mockHolidays = [
          { holiday_date: new Date('2025-01-15'), holiday_name: '임시휴무', is_regular: false }
        ];

        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }]) // getOperatingHours
          .mockResolvedValueOnce(mockHolidays) // getHolidays
          .mockResolvedValueOnce([{ next_open: '2025-01-16 09:00:00' }]); // calculateNextOpen

        const result = await calculateOperatingStatus(1, new Date('2025-01-15 12:00:00'));

        expect(result.current_status.status).toBe(OperatingStatus.TEMP_CLOSED);
        expect(result.current_status.message).toContain('임시휴무');
        expect(result.current_status.status_color).toBe('red');
      });
    });

    describe('HOLIDAY status', () => {
      it('should return HOLIDAY for public holiday', async () => {
        const mockHolidays = [
          { holiday_date: new Date('2025-01-01'), holiday_name: '신정', is_regular: false }
        ];

        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }]) // getOperatingHours
          .mockResolvedValueOnce(mockHolidays) // getHolidays
          .mockResolvedValueOnce([{ next_open: '2025-01-02 09:00:00' }]); // calculateNextOpen

        const result = await calculateOperatingStatus(1, new Date('2025-01-01 12:00:00'));

        expect(result.current_status.status).toBe(OperatingStatus.HOLIDAY);
        expect(result.current_status.message).toContain('휴무');
        expect(result.current_status.status_color).toBe('red');
      });

      it('should return HOLIDAY for regular weekly holiday (Sunday)', async () => {
        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }]) // getOperatingHours
          .mockResolvedValueOnce([]) // getHolidays - no special holidays
          .mockResolvedValueOnce([{ next_open: '2025-01-13 09:00:00' }]); // calculateNextOpen

        // Sunday (day 0)
        const result = await calculateOperatingStatus(1, new Date('2025-01-12 12:00:00'));

        expect(result.current_status.status).toBe(OperatingStatus.HOLIDAY);
        expect(result.current_status.message).toBe('정기휴무');
        expect(result.current_status.status_color).toBe('red');
      });
    });

    describe('OPEN status', () => {
      it('should return OPEN when within operating hours', async () => {
        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }]) // getOperatingHours
          .mockResolvedValueOnce([]); // getHolidays

        // Monday 12:00 (within 09:00-18:00)
        const result = await calculateOperatingStatus(1, new Date('2025-01-13 12:00:00'));

        expect(result.current_status.status).toBe(OperatingStatus.OPEN);
        expect(result.current_status.message).toContain('운영 중');
        expect(result.current_status.message).toContain('18:00');
        expect(result.current_status.status_color).toBe('green');
        expect(result.next_open).toBeNull();
      });
    });

    describe('CLOSING_SOON status', () => {
      it('should return CLOSING_SOON when within 30 minutes before closing', async () => {
        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }]) // getOperatingHours
          .mockResolvedValueOnce([]); // getHolidays

        // Monday 17:45 (15 minutes before 18:00 closing)
        const result = await calculateOperatingStatus(1, new Date('2025-01-13 17:45:00'));

        expect(result.current_status.status).toBe(OperatingStatus.CLOSING_SOON);
        expect(result.current_status.message).toContain('곧 마감');
        expect(result.current_status.message).toContain('18:00');
        expect(result.current_status.status_color).toBe('yellow');
      });

      it('should return OPEN when exactly 31 minutes before closing', async () => {
        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }]) // getOperatingHours
          .mockResolvedValueOnce([]); // getHolidays

        // Monday 17:29 (31 minutes before 18:00 closing)
        const result = await calculateOperatingStatus(1, new Date('2025-01-13 17:29:00'));

        expect(result.current_status.status).toBe(OperatingStatus.OPEN);
      });
    });

    describe('CLOSED status', () => {
      it('should return CLOSED before opening time', async () => {
        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }]) // getOperatingHours
          .mockResolvedValueOnce([]) // getHolidays
          .mockResolvedValueOnce([{ next_open: '2025-01-13 09:00:00' }]); // calculateNextOpen

        // Monday 08:00 (before 09:00 opening)
        const result = await calculateOperatingStatus(1, new Date('2025-01-13 08:00:00'));

        expect(result.current_status.status).toBe(OperatingStatus.CLOSED);
        expect(result.current_status.message).toContain('마감');
        expect(result.current_status.message).toContain('월요일');
        expect(result.current_status.message).toContain('09:00');
        expect(result.current_status.status_color).toBe('gray');
      });

      it('should return CLOSED after closing time', async () => {
        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }]) // getOperatingHours
          .mockResolvedValueOnce([]) // getHolidays
          .mockResolvedValueOnce([{ next_open: '2025-01-14 09:00:00' }]); // calculateNextOpen

        // Monday 19:00 (after 18:00 closing)
        const result = await calculateOperatingStatus(1, new Date('2025-01-13 19:00:00'));

        expect(result.current_status.status).toBe(OperatingStatus.CLOSED);
        expect(result.current_status.message).toContain('마감');
        expect(result.current_status.status_color).toBe('gray');
      });

      it('should return simple CLOSED message when no next open date', async () => {
        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }]) // getOperatingHours
          .mockResolvedValueOnce([]) // getHolidays
          .mockResolvedValueOnce([{ next_open: null }]); // calculateNextOpen

        const result = await calculateOperatingStatus(1, new Date('2025-01-13 19:00:00'));

        expect(result.current_status.status).toBe(OperatingStatus.CLOSED);
        expect(result.current_status.message).toBe('마감');
      });
    });

    describe('Edge cases', () => {
      it('should handle midnight correctly', async () => {
        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }]) // getOperatingHours
          .mockResolvedValueOnce([]) // getHolidays
          .mockResolvedValueOnce([{ next_open: '2025-01-13 09:00:00' }]); // calculateNextOpen

        // Monday 00:00
        const result = await calculateOperatingStatus(1, new Date('2025-01-13 00:00:00'));

        expect(result.current_status.status).toBe(OperatingStatus.CLOSED);
      });

      it('should handle exact opening time correctly', async () => {
        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }]) // getOperatingHours
          .mockResolvedValueOnce([]); // getHolidays

        // Monday 09:00 (exact opening time)
        const result = await calculateOperatingStatus(1, new Date('2025-01-13 09:00:00'));

        expect(result.current_status.status).toBe(OperatingStatus.OPEN);
      });

      it('should handle exact closing time correctly', async () => {
        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }]) // getOperatingHours
          .mockResolvedValueOnce([]) // getHolidays
          .mockResolvedValueOnce([{ next_open: '2025-01-14 09:00:00' }]); // calculateNextOpen

        // Monday 18:00 (exact closing time)
        const result = await calculateOperatingStatus(1, new Date('2025-01-13 18:00:00'));

        // At closing time, should be CLOSED
        expect(result.current_status.status).toBe(OperatingStatus.CLOSED);
      });
    });

    describe('Performance', () => {
      it('should complete calculation in less than 100ms', async () => {
        (prisma.$queryRaw as jest.Mock)
          .mockResolvedValueOnce([{ weekly_hours: JSON.stringify(mockWeeklyHours) }])
          .mockResolvedValueOnce([]);

        const startTime = Date.now();
        await calculateOperatingStatus(1, new Date('2025-01-13 12:00:00'));
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(100);
      });
    });
  });
});
