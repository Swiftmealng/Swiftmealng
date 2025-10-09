import express from 'express';
import * as orderController from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';
import validate from '../middleware/validation.middleware';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  getOrdersSchema
} from '../validators/order.validator';

const router = express.Router();

// All order routes require authentication
router.use(protect);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - customerName
 *               - customerPhone
 *               - items
 *               - deliveryAddress
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               customerName:
 *                 type: string
 *                 example: John Doe
 *               customerPhone:
 *                 type: string
 *                 example: +2348012345678
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Jollof Rice
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *                     price:
 *                       type: number
 *                       minimum: 0
 *                       example: 2500
 *               deliveryAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: 15 Herbert Macaulay Way
 *                   area:
 *                     type: string
 *                     example: Yaba
 *                   city:
 *                     type: string
 *                     example: Lagos
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     minItems: 2
 *                     maxItems: 2
 *                     example: [3.3792, 6.5244]
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.post('/', validate(createOrderSchema), orderController.createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, ready, picked_up, in_transit, delivered]
 *         description: Filter by order status
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         description: Filter by delivery area
 *       - in: query
 *         name: isDelayed
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter delayed orders
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of orders per page
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
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
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Not authenticated
 */
router.get('/', validate(getOrdersSchema), orderController.getOrders);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     summary: Get single order by ID
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
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
 *                       $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Not authenticated
 */
router.get('/:orderId', orderController.getOrder);

/**
 * @swagger
 * /orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [placed, confirmed, preparing, ready, out_for_delivery, delivered, cancelled]
 *                 example: confirmed
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: 6.5244
 *                   lng:
 *                     type: number
 *                     example: 3.3792
 *     responses:
 *       200:
 *         description: Order status updated successfully
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
 *                       $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       401:
 *         description: Not authenticated
 */
router.patch(
  '/:orderId/status',
  validate(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

export default router;
