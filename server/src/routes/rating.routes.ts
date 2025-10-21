import express from "express";
import * as ratingController from "../controllers/rating.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// All rating routes require authentication
router.use(protect);

/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Create order rating
 *     tags: [Ratings]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - orderNumber
 *               - foodRating
 *               - deliveryRating
 *             properties:
 *               orderId:
 *                 type: string
 *               orderNumber:
 *                 type: string
 *               foodRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               deliveryRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               riderRating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rating created successfully
 */
router.post("/", ratingController.createRating);

/**
 * @swagger
 * /ratings:
 *   get:
 *     summary: Get rating by order ID
 *     tags: [Ratings]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rating retrieved successfully
 */
router.get("/", ratingController.getRatingByOrder);

export default router;
