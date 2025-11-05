const express = require('express');
const router = express.Router();
const { metricsHandler } = require('../utils/metrics');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   example: 12345.67
 *                 environment:
 *                   type: string
 *                   example: development
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * @swagger
 * /ready:
 *   get:
 *     summary: Readiness check endpoint
 *     description: Returns whether the server is ready to accept requests
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is ready
 *       503:
 *         description: Server is not ready
 */
router.get('/ready', (req, res) => {
  // TODO: Add actual readiness checks (database connection, etc.)
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Prometheus metrics endpoint
 *     description: Returns Prometheus metrics for monitoring recommendation API performance
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Prometheus metrics in text format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Failed to collect metrics
 */
router.get('/metrics', metricsHandler);

module.exports = router;
