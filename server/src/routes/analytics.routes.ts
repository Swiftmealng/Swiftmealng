import express from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = express.Router();

// All analytics routes require authentication and operations/admin role
router.use(protect);
router.use(restrictTo('operations', 'admin'));

/**
 * @swagger
 * /analytics/delays/heatmap:
 *   get:
 *     summary: Get delay heatmap data
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (ISO format)
 *         example: 2025-09-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (ISO format)
 *         example: 2025-10-01
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         description: Filter by specific area
 *         example: Yaba
 *     responses:
 *       200:
 *         description: Heatmap data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     heatmapData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           area:
 *                             type: string
 *                             example: Maryland
 *                           lat:
 *                             type: number
 *                             example: 6.5244
 *                           lng:
 *                             type: number
 *                             example: 3.3792
 *                           delayCount:
 *                             type: integer
 *                             example: 45
 *                           averageDelayMinutes:
 *                             type: number
 *                             example: 31
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get('/delays/heatmap', analyticsController.getDelayHeatmap);

/**
 * @swagger
 * /analytics/delays/trends:
 *   get:
 *     summary: Get delay trends over time
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (ISO format)
 *         example: 2025-09-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (ISO format)
 *         example: 2025-10-01
 *     responses:
 *       200:
 *         description: Delay trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: 2025-09-28
 *                           totalOrders:
 *                             type: integer
 *                             example: 150
 *                           delayedOrders:
 *                             type: integer
 *                             example: 42
 *                           delayPercentage:
 *                             type: number
 *                             example: 28.0
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get('/delays/trends', analyticsController.getDelayTrends);

/**
 * @swagger
 * /analytics/riders/performance:
 *   get:
 *     summary: Get all riders performance comparison
 *     tags: [Analytics]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Riders performance data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     riders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 507f1f77bcf86cd799439011
 *                           name:
 *                             type: string
 *                             example: John Doe
 *                           onTimePercentage:
 *                             type: number
 *                             example: 85.5
 *                           totalDeliveries:
 *                             type: integer
 *                             example: 120
 *                           averageDeliveryTime:
 *                             type: number
 *                             example: 27
 *                           rating:
 *                             type: number
 *                             example: 4.7
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Insufficient permissions
 */
router.get('/riders/performance', analyticsController.getRidersPerformance);

export default router;
