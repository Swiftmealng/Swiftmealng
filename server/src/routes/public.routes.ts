import express from "express";
import * as publicController from "../controllers/public.controller";

const router = express.Router();

/**
 * @swagger
 * /public/stats:
 *   get:
 *     summary: Get public statistics (no auth required)
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Public statistics retrieved successfully
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
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalCustomers:
 *                           type: number
 *                           example: 20000
 *                         totalRestaurants:
 *                           type: number
 *                           example: 50
 *                         averageRating:
 *                           type: number
 *                           example: 4.8
 *                         totalOrders:
 *                           type: number
 *                           example: 45000
 */
router.get("/stats", publicController.getPublicStats);

export default router;
