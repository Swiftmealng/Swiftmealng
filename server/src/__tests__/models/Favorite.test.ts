import mongoose from "mongoose";
import Favorite from "../../models/Favorite";

describe("Favorite Model", () => {
  describe("Schema Validation", () => {
    it("should create a favorite with all fields", () => {
      const favoriteData = {
        userId: new mongoose.Types.ObjectId(),
        mealName: "Pizza Margherita",
        restaurantName: "Pizza Palace",
        price: 2500,
        imageUrl: "https://example.com/pizza.jpg",
        notes: "Extra cheese please",
      };

      const favorite = new Favorite(favoriteData);

      expect(favorite.userId).toEqual(favoriteData.userId);
      expect(favorite.mealName).toBe("Pizza Margherita");
      expect(favorite.restaurantName).toBe("Pizza Palace");
      expect(favorite.price).toBe(2500);
      expect(favorite.imageUrl).toBe("https://example.com/pizza.jpg");
      expect(favorite.notes).toBe("Extra cheese please");
    });

    it("should create a favorite with only required fields", () => {
      const favoriteData = {
        userId: new mongoose.Types.ObjectId(),
        mealName: "Simple Burger",
      };

      const favorite = new Favorite(favoriteData);

      expect(favorite.userId).toEqual(favoriteData.userId);
      expect(favorite.mealName).toBe("Simple Burger");
      expect(favorite.restaurantName).toBeUndefined();
      expect(favorite.price).toBeUndefined();
      expect(favorite.imageUrl).toBeUndefined();
      expect(favorite.notes).toBeUndefined();
    });

    it("should fail validation without userId", async () => {
      const favorite = new Favorite({
        mealName: "Pizza",
      });

      let error;
      try {
        await favorite.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
    });

    it("should fail validation without mealName", async () => {
      const favorite = new Favorite({
        userId: new mongoose.Types.ObjectId(),
      });

      let error;
      try {
        await favorite.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.mealName).toBeDefined();
    });

    it("should trim whitespace from mealName", () => {
      const favorite = new Favorite({
        userId: new mongoose.Types.ObjectId(),
        mealName: "  Pizza Margherita  ",
      });

      expect(favorite.mealName).toBe("Pizza Margherita");
    });

    it("should trim whitespace from restaurantName", () => {
      const favorite = new Favorite({
        userId: new mongoose.Types.ObjectId(),
        mealName: "Pizza",
        restaurantName: "  Pizza Palace  ",
      });

      expect(favorite.restaurantName).toBe("Pizza Palace");
    });

    it("should trim whitespace from imageUrl", () => {
      const favorite = new Favorite({
        userId: new mongoose.Types.ObjectId(),
        mealName: "Pizza",
        imageUrl: "  https://example.com/pizza.jpg  ",
      });

      expect(favorite.imageUrl).toBe("https://example.com/pizza.jpg");
    });

    it("should trim whitespace from notes", () => {
      const favorite = new Favorite({
        userId: new mongoose.Types.ObjectId(),
        mealName: "Pizza",
        notes: "  Extra cheese  ",
      });

      expect(favorite.notes).toBe("Extra cheese");
    });

    it("should reject negative price", async () => {
      const favorite = new Favorite({
        userId: new mongoose.Types.ObjectId(),
        mealName: "Pizza",
        price: -100,
      });

      let error;
      try {
        await favorite.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.price).toBeDefined();
    });

    it("should accept zero price", async () => {
      const favorite = new Favorite({
        userId: new mongoose.Types.ObjectId(),
        mealName: "Free Sample",
        price: 0,
      });

      const error = favorite.validateSync();
      expect(error).toBeUndefined();
    });

    it("should enforce notes maxlength of 200 characters", async () => {
      const longNotes = "a".repeat(201);
      const favorite = new Favorite({
        userId: new mongoose.Types.ObjectId(),
        mealName: "Pizza",
        notes: longNotes,
      });

      let error;
      try {
        await favorite.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.notes).toBeDefined();
    });

    it("should accept notes with 200 characters", async () => {
      const exactLengthNotes = "a".repeat(200);
      const favorite = new Favorite({
        userId: new mongoose.Types.ObjectId(),
        mealName: "Pizza",
        notes: exactLengthNotes,
      });

      const error = favorite.validateSync();
      expect(error).toBeUndefined();
    });

    it("should have timestamps", () => {
      const favorite = new Favorite({
        userId: new mongoose.Types.ObjectId(),
        mealName: "Pizza",
      });

      expect(favorite.createdAt).toBeDefined();
      expect(favorite.updatedAt).toBeDefined();
    });
  });

  describe("Schema Indexes", () => {
    it("should have userId index", () => {
      const indexes = Favorite.schema.indexes();
      const userIdIndex = indexes.find(
        (idx: any) => idx[0].userId === 1
      );

      expect(userIdIndex).toBeDefined();
    });

    it("should have compound unique index on userId and mealName", () => {
      const indexes = Favorite.schema.indexes();
      const compoundIndex = indexes.find(
        (idx: any) => idx[0].userId === 1 && idx[0].mealName === 1
      );

      expect(compoundIndex).toBeDefined();
      expect(compoundIndex[1].unique).toBe(true);
    });
  });
});