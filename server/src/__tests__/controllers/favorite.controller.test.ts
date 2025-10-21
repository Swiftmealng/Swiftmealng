jest.mock("../../utils/asyncHandler", () => ({ __esModule: true, default: (fn: any) => fn }));
import { Request, Response } from "express";
import * as favoriteController from "../../controllers/favorite.controller";
import Favorite from "../../models/Favorite";
import AppError from "../../utils/AppError";

// Mock the models
jest.mock("../../models/Favorite");

describe("Favorite Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      user: { _id: "user123" },
      body: {},
      params: {},
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe("getFavorites", () => {
    it("should return all user favorites successfully", async () => {
      const mockFavorites = [
        {
          _id: "fav1",
          userId: "user123",
          mealName: "Pizza",
          restaurantName: "Pizza Place",
          price: 2500,
          createdAt: new Date(),
        },
        {
          _id: "fav2",
          userId: "user123",
          mealName: "Burger",
          restaurantName: "Burger Joint",
          price: 1500,
          createdAt: new Date(),
        },
      ];

      const mockSort = jest.fn().mockResolvedValue(mockFavorites);
      (Favorite.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: mockSort,
      });

      await favoriteController.getFavorites(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Favorite.find).toHaveBeenCalledWith({ userId: "user123" });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: { favorites: mockFavorites },
      });
    });

    it("should return empty array when user has no favorites", async () => {
      const mockSort = jest.fn().mockResolvedValue([]);
      (Favorite.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: mockSort,
      });

      await favoriteController.getFavorites(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: { favorites: [] },
      });
    });

    it("should handle database errors", async () => {
      const dbError = new Error("Database connection failed");
      (Favorite.find as jest.Mock) = jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(dbError),
      });

      await expect(
        favoriteController.getFavorites(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("addFavorite", () => {
    it("should add a new favorite successfully", async () => {
      mockRequest.body = {
        mealName: "Sushi",
        restaurantName: "Sushi Bar",
        price: 3500,
        imageUrl: "https://example.com/sushi.jpg",
        notes: "Extra wasabi",
      };

      const mockFavorite = {
        _id: "fav123",
        userId: "user123",
        ...mockRequest.body,
        createdAt: new Date(),
      };

      (Favorite.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Favorite.create as jest.Mock) = jest.fn().mockResolvedValue(mockFavorite);

      await favoriteController.addFavorite(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Favorite.findOne).toHaveBeenCalledWith({
        userId: "user123",
        mealName: "Sushi",
      });
      expect(Favorite.create).toHaveBeenCalledWith({
        userId: "user123",
        mealName: "Sushi",
        restaurantName: "Sushi Bar",
        price: 3500,
        imageUrl: "https://example.com/sushi.jpg",
        notes: "Extra wasabi",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: { favorite: mockFavorite },
      });
    });

    it("should throw error if mealName is missing", async () => {
      mockRequest.body = {
        restaurantName: "Restaurant",
        price: 2000,
      };

      await expect(
        favoriteController.addFavorite(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow(AppError);

      await expect(
        favoriteController.addFavorite(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Meal name is required",
        statusCode: 400,
      });
    });

    it("should throw error if favorite already exists", async () => {
      mockRequest.body = {
        mealName: "Pizza",
        restaurantName: "Pizza Place",
      };

      const existingFavorite = {
        _id: "fav123",
        userId: "user123",
        mealName: "Pizza",
      };

      (Favorite.findOne as jest.Mock) = jest.fn().mockResolvedValue(existingFavorite);

      await expect(
        favoriteController.addFavorite(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow(AppError);

      await expect(
        favoriteController.addFavorite(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Meal already in favorites",
        statusCode: 400,
      });

      expect(Favorite.create).not.toHaveBeenCalled();
    });

    it("should add favorite with only required fields", async () => {
      mockRequest.body = {
        mealName: "Simple Meal",
      };

      const mockFavorite = {
        _id: "fav123",
        userId: "user123",
        mealName: "Simple Meal",
      };

      (Favorite.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Favorite.create as jest.Mock) = jest.fn().mockResolvedValue(mockFavorite);

      await favoriteController.addFavorite(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Favorite.create).toHaveBeenCalledWith({
        userId: "user123",
        mealName: "Simple Meal",
        restaurantName: undefined,
        price: undefined,
        imageUrl: undefined,
        notes: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it("should handle database errors during creation", async () => {
      mockRequest.body = {
        mealName: "Test Meal",
      };

      (Favorite.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);
      (Favorite.create as jest.Mock) = jest.fn().mockRejectedValue(
        new Error("Database write failed")
      );

      await expect(
        favoriteController.addFavorite(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow("Database write failed");
    });
  });

  describe("removeFavorite", () => {
    it("should remove a favorite successfully", async () => {
      mockRequest.params = { favoriteId: "fav123" };

      const mockFavorite = {
        _id: "fav123",
        userId: "user123",
        mealName: "Pizza",
      };

      (Favorite.findOneAndDelete as jest.Mock) = jest.fn().mockResolvedValue(mockFavorite);

      await favoriteController.removeFavorite(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(Favorite.findOneAndDelete).toHaveBeenCalledWith({
        _id: "fav123",
        userId: "user123",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Favorite removed successfully",
      });
    });

    it("should throw error if favorite not found", async () => {
      mockRequest.params = { favoriteId: "nonexistent" };

      (Favorite.findOneAndDelete as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        favoriteController.removeFavorite(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow(AppError);

      await expect(
        favoriteController.removeFavorite(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toMatchObject({
        message: "Favorite not found",
        statusCode: 404,
      });
    });

    it("should not allow removing another user's favorite", async () => {
      mockRequest.params = { favoriteId: "fav123" };

      // Mock returns null because userId doesn't match
      (Favorite.findOneAndDelete as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        favoriteController.removeFavorite(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow(AppError);

      expect(Favorite.findOneAndDelete).toHaveBeenCalledWith({
        _id: "fav123",
        userId: "user123",
      });
    });

    it("should handle database errors during deletion", async () => {
      mockRequest.params = { favoriteId: "fav123" };

      (Favorite.findOneAndDelete as jest.Mock) = jest.fn().mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        favoriteController.removeFavorite(
          mockRequest as Request,
          mockResponse as Response,
          nextFunction
        )
      ).rejects.toThrow("Database error");
    });
  });
});