import express from 'express';
import * as riderController from '../controllers/rider.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { uploadSingle } from '../middleware/upload.middleware';

const router = express.Router();

// All rider routes require authentication
router.use(protect);

/**
 * @swagger
 * /riders/location:
 *   post:
 *     summary: Update rider location
 *     tags: [Riders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - riderId
 *               - location
 *             properties:
 *               riderId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               location:
 *                 type: object
 *                 required:
 *                   - lat
 *                   - lng
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: 6.5244
 *                   lng:
 *                     type: number
 *                     example: 3.3792
 *               orderId:
 *                 type: string
 *                 description: Optional order ID to add tracking event
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Location updated successfully
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
 *                     rider:
 *                       type: object
 *       404:
 *         description: Rider not found
 *       401:
 *         description: Not authenticated
 */
router.post('/location', riderController.updateLocation);

/**
 * @swagger
 * /riders/{riderId}/performance:
 *   get:
 *     summary: Get rider performance metrics
 *     tags: [Riders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: riderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Rider ID
 *     responses:
 *       200:
 *         description: Rider performance retrieved successfully
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
 *                     rider:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: John Doe
 *                         totalDeliveries:
 *                           type: integer
 *                           example: 245
 *                         onTimeDeliveries:
 *                           type: integer
 *                           example: 198
 *                         lateDeliveries:
 *                           type: integer
 *                           example: 47
 *                         onTimePercentage:
 *                           type: number
 *                           example: 80.8
 *                         averageDeliveryTime:
 *                           type: number
 *                           description: Average delivery time in minutes
 *                           example: 28
 *                         rating:
 *                           type: number
 *                           example: 4.6
 *       404:
 *         description: Rider not found
 *       401:
 *         description: Not authenticated
 */
router.get('/:riderId/performance', restrictTo('operations', 'admin'), riderController.getRiderPerformance);

/**
 * @swagger
 * /riders/{riderId}/photo:
 *   post:
 *     summary: Upload rider photo
 *     tags: [Riders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: riderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Rider ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Rider photo (max 5MB, images only)
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
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
 *                     rider:
 *                       type: object
 *       404:
 *         description: Rider not found
 *       401:
 *         description: Not authenticated
 */
router.post('/:riderId/photo', restrictTo('admin'), uploadSingle('photo'), riderController.uploadPhoto);

export default router;
