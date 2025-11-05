/**
 * Prometheus Metrics for Recommendation System
 *
 * Sprint 2 - Task 4.4.1
 * Metrics collection for monitoring recommendation API performance
 */

import { Request, Response } from 'express';
import promClient from 'prom-client';

// Initialize Prometheus client with default metrics
const register = new promClient.Registry();

// Collect default metrics (CPU, memory, event loop lag, etc.)
promClient.collectDefaultMetrics({
  register,
  prefix: 'mindconnect_',
  labels: { service: 'recommendation-api' },
});

/**
 * Metric 1: Total Recommendation Requests (Counter)
 * Tracks the total number of recommendation requests by status
 */
export const recommendationRequestsTotal = new promClient.Counter({
  name: 'recommendation_requests_total',
  help: 'Total number of recommendation API requests',
  labelNames: ['method', 'status', 'has_profile'],
  registers: [register],
});

/**
 * Metric 2: Recommendation API Duration (Histogram)
 * Tracks the response time of recommendation requests
 */
export const recommendationDuration = new promClient.Histogram({
  name: 'recommendation_duration_seconds',
  help: 'Duration of recommendation API requests in seconds',
  labelNames: ['method', 'status'],
  buckets: [0.1, 0.5, 1, 2, 3, 5, 10], // Response time buckets
  registers: [register],
});

/**
 * Metric 3: Scoring Module Duration (Histogram)
 * Tracks execution time for each scoring module
 */
export const scoringModuleDuration = new promClient.Histogram({
  name: 'scoring_module_duration_seconds',
  help: 'Duration of individual scoring modules in seconds',
  labelNames: ['module', 'center_id'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1], // Module execution time buckets
  registers: [register],
});

/**
 * Metric 4: Active Recommendations (Gauge)
 * Tracks the number of currently active recommendation requests
 */
export const activeRecommendations = new promClient.Gauge({
  name: 'active_recommendations',
  help: 'Number of currently active recommendation requests',
  registers: [register],
});

/**
 * Metric 5: Recommendation Result Count (Histogram)
 * Tracks the number of centers returned per recommendation
 */
export const recommendationResultCount = new promClient.Histogram({
  name: 'recommendation_result_count',
  help: 'Number of centers returned per recommendation request',
  buckets: [0, 1, 3, 5, 10, 20, 50],
  registers: [register],
});

/**
 * Metric 6: Cache Hit/Miss (Counter)
 * Tracks Redis cache hit/miss ratio
 */
export const cacheHitMiss = new promClient.Counter({
  name: 'recommendation_cache_hit_miss_total',
  help: 'Total number of cache hits and misses',
  labelNames: ['result'], // 'hit' or 'miss'
  registers: [register],
});

/**
 * Get Prometheus metrics endpoint handler
 *
 * @param req - Express Request
 * @param res - Express Response
 */
export async function metricsHandler(req: Request, res: Response): Promise<void> {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end(error);
  }
}

/**
 * Track recommendation request
 *
 * @param method - HTTP method (POST)
 * @param status - HTTP status code (200, 400, 500)
 * @param hasProfile - Whether userProfile was provided
 */
export function trackRecommendationRequest(
  method: string,
  status: number,
  hasProfile: boolean,
): void {
  recommendationRequestsTotal.inc({
    method,
    status: status.toString(),
    has_profile: hasProfile.toString(),
  });
}

/**
 * Track recommendation duration
 *
 * @param method - HTTP method (POST)
 * @param status - HTTP status code
 * @param durationSeconds - Request duration in seconds
 */
export function trackRecommendationDuration(
  method: string,
  status: number,
  durationSeconds: number,
): void {
  recommendationDuration.observe(
    {
      method,
      status: status.toString(),
    },
    durationSeconds,
  );
}

/**
 * Track scoring module execution time
 *
 * @param module - Module name (distance, operating, specialty, program)
 * @param centerId - Center ID
 * @param durationSeconds - Execution time in seconds
 */
export function trackScoringModuleDuration(
  module: string,
  centerId: string,
  durationSeconds: number,
): void {
  scoringModuleDuration.observe(
    {
      module,
      center_id: centerId,
    },
    durationSeconds,
  );
}

/**
 * Track cache hit/miss
 *
 * @param result - 'hit' or 'miss'
 */
export function trackCacheResult(result: 'hit' | 'miss'): void {
  cacheHitMiss.inc({ result });
}

/**
 * Increment active recommendations gauge
 */
export function incrementActiveRecommendations(): void {
  activeRecommendations.inc();
}

/**
 * Decrement active recommendations gauge
 */
export function decrementActiveRecommendations(): void {
  activeRecommendations.dec();
}

/**
 * Track recommendation result count
 *
 * @param count - Number of centers returned
 */
export function trackRecommendationResultCount(count: number): void {
  recommendationResultCount.observe(count);
}

// Export the registry for testing purposes
export { register };
