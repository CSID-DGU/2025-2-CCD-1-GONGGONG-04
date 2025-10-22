/**
 * Holiday Synchronization Cron Job
 *
 * Automatically synchronizes public holidays from external API to database.
 * Runs annually on January 1st at 00:00 (Asia/Seoul timezone).
 *
 * @module cron/holidaySync
 */

import cron from 'node-cron';
import { syncPublicHolidaysToDatabase } from '../services/holiday.service';

/**
 * Cron job instance
 */
let holidaySyncJob: cron.ScheduledTask | null = null;

/**
 * Setup holiday synchronization cron job
 *
 * Schedule: '0 0 1 1 *' - Runs at 00:00 on January 1st every year
 * Timezone: Asia/Seoul
 *
 * @returns cron.ScheduledTask - Scheduled cron job instance
 */
export function setupHolidaySyncCron(): cron.ScheduledTask {
  if (holidaySyncJob) {
    console.log('[Cron] Holiday sync job already scheduled');
    return holidaySyncJob;
  }

  // Schedule: minute hour day month dayOfWeek
  // '0 0 1 1 *' = 00:00 on January 1st
  const schedule = '0 0 1 1 *';

  holidaySyncJob = cron.schedule(
    schedule,
    async () => {
      console.log('[Cron] Starting annual holiday synchronization...');
      const startTime = Date.now();

      try {
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;

        // Sync current year and next year
        console.log(`[Cron] Syncing holidays for ${currentYear} and ${nextYear}...`);

        const results = await Promise.allSettled([
          syncPublicHolidaysToDatabase(currentYear),
          syncPublicHolidaysToDatabase(nextYear)
        ]);

        // Log results
        results.forEach((result, index) => {
          const year = index === 0 ? currentYear : nextYear;

          if (result.status === 'fulfilled') {
            console.log(`[Cron] Successfully synced ${result.value} holidays for ${year}`);
          } else {
            console.error(`[Cron] Failed to sync holidays for ${year}:`, result.reason);
          }
        });

        const duration = Date.now() - startTime;
        console.log(`[Cron] Holiday synchronization completed in ${duration}ms`);

      } catch (error) {
        console.error('[Cron] Holiday synchronization failed:', error);
      }
    },
    {
      timezone: 'Asia/Seoul',
      scheduled: true
    }
  );

  console.log(`[Cron] Holiday sync job scheduled: ${schedule} (Asia/Seoul)`);
  console.log('[Cron] Next run: January 1st, 00:00');

  return holidaySyncJob;
}

/**
 * Stop holiday synchronization cron job
 *
 * @returns boolean - True if stopped successfully, false otherwise
 */
export function stopHolidaySyncCron(): boolean {
  if (!holidaySyncJob) {
    console.log('[Cron] No holiday sync job to stop');
    return false;
  }

  holidaySyncJob.stop();
  holidaySyncJob = null;
  console.log('[Cron] Holiday sync job stopped');

  return true;
}

/**
 * Manually trigger holiday synchronization
 *
 * Can be called via API endpoint or CLI script for manual execution.
 *
 * @param year - Year to sync (defaults to current year)
 * @returns Promise<number> - Number of holidays synced
 */
export async function syncHolidaysManually(year?: number): Promise<number> {
  const targetYear = year || new Date().getFullYear();

  console.log(`[Manual Sync] Starting holiday synchronization for ${targetYear}...`);
  const startTime = Date.now();

  try {
    const count = await syncPublicHolidaysToDatabase(targetYear);

    const duration = Date.now() - startTime;
    console.log(`[Manual Sync] Synced ${count} holidays for ${targetYear} in ${duration}ms`);

    return count;
  } catch (error) {
    console.error(`[Manual Sync] Failed to sync holidays for ${targetYear}:`, error);
    throw error;
  }
}

/**
 * CLI entry point for manual execution
 *
 * Usage:
 *   node dist/cron/holidaySync.js
 *   node dist/cron/holidaySync.js 2025
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  const year = args[0] ? parseInt(args[0], 10) : undefined;

  if (year && (isNaN(year) || year < 2000 || year > 2100)) {
    console.error('Invalid year argument. Must be between 2000 and 2100.');
    process.exit(1);
  }

  syncHolidaysManually(year)
    .then(count => {
      console.log(`Successfully synced ${count} holidays`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Holiday sync failed:', error);
      process.exit(1);
    });
}
