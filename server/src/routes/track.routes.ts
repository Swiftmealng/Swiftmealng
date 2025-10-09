import express from 'express';
import * as trackController from '../controllers/track.controller';

const router = express.Router();

/**
 * @swagger
 * /track/{orderNumber}:
 *   get:
 *     summary: Get order tracking information (public)
 *     tags: [Tracking]
 *     parameters:
 *       - in: path
 *         name: orderNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Order number (e.g., ORD-1234567890123)
 *         example: ORD-1234567890123
 *     responses:
 *       200:
 *         description: Order tracking data retrieved successfully
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
 *                     order:
 *                       type: object
 *                       properties:
 *                         orderNumber:
 *                           type: string
 *                           example: ORD-1234567890123
 *                         status:
 *                           type: string
 *                           enum: [pending, confirmed, preparing, ready, picked_up, in_transit, delivered]
 *                           example: in_transit
 *                         estimatedDeliveryTime:
 *                           type: string
 *                           format: date-time
 *                           example: 2025-10-07T13:15:00Z
 *                         actualDeliveryTime:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         isDelayed:
 *                           type: boolean
 *                           example: false
 *                         delayDuration:
 *                           type: number
 *                           example: 0
 *                         tracking:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               status:
 *                                 type: string
 *                               timestamp:
 *                                 type: string
 *                                 format: date-time
 *                               location:
 *                                 type: object
 *                                 properties:
 *                                   lat:
 *                                     type: number
 *                                   lng:
 *                                     type: number
 *                         rider:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: John Doe
 *                             phone:
 *                               type: string
 *                               example: +2348012345678
 *                             photo:
 *                               type: string
 *                               example: https://cloudinary.com/riders/photo.jpg
 *                             currentLocation:
 *                               type: object
 *                               properties:
 *                                 coordinates:
 *                                   type: array
 *                                   items:
 *                                     type: number
 *                                   example: [3.3792, 6.5244]
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:orderNumber', trackController.getOrderTracking);

export default router;
