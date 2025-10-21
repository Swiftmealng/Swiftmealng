import express from "express";
import * as favoriteController from "../controllers/favorite.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// All favorite routes require authentication
router.use(protect);

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Get user favorites
 *     tags: [Favorites]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 */
router.get("/", favoriteController.getFavorites);

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Add meal to favorites
 *     tags: [Favorites]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mealName
 *             properties:
 *               mealName:
 *                 type: string
 *               restaurantName:
 *                 type: string
 *               price:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Favorite added successfully
 */
router.post("/", favoriteController.addFavorite);

/**
 * @swagger
 * /favorites/{favoriteId}:
 *   delete:
 *     summary: Remove favorite
 *     tags: [Favorites]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: favoriteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite removed successfully
 */
router.delete("/:favoriteId", favoriteController.removeFavorite);

export default router;
