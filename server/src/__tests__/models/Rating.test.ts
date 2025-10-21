import mongoose from "mongoose";
import Rating from "../../models/Rating";

describe("Rating Model", () => {
  describe("Schema Validation", () => {
    it("should create a rating with all fields", () => {
      const ratingData = {
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        riderId: new mongoose.Types.ObjectId(),
        foodRating: 5,
        deliveryRating: 4,
        riderRating: 5,
        review: "Excellent service!",
      };

      const rating = new Rating(ratingData);

      expect(rating.orderId).toEqual(ratingData.orderId);
      expect(rating.orderNumber).toBe("ORD-001");
      expect(rating.userId).toEqual(ratingData.userId);
      expect(rating.riderId).toEqual(ratingData.riderId);
      expect(rating.foodRating).toBe(5);
      expect(rating.deliveryRating).toBe(4);
      expect(rating.riderRating).toBe(5);
      expect(rating.review).toBe("Excellent service!");
    });

    it("should create a rating without optional fields", () => {
      const ratingData = {
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 5,
        deliveryRating: 4,
      };

      const rating = new Rating(ratingData);

      expect(rating.riderId).toBeUndefined();
      expect(rating.riderRating).toBeUndefined();
      expect(rating.review).toBeUndefined();
    });

    it("should fail validation without orderId", async () => {
      const rating = new Rating({
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 5,
        deliveryRating: 4,
      });

      let error;
      try {
        await rating.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.orderId).toBeDefined();
    });

    it("should fail validation without orderNumber", async () => {
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        foodRating: 5,
        deliveryRating: 4,
      });

      let error;
      try {
        await rating.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.orderNumber).toBeDefined();
    });

    it("should fail validation without userId", async () => {
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        foodRating: 5,
        deliveryRating: 4,
      });

      let error;
      try {
        await rating.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
    });

    it("should fail validation without foodRating", async () => {
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        deliveryRating: 4,
      });

      let error;
      try {
        await rating.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.foodRating).toBeDefined();
    });

    it("should fail validation without deliveryRating", async () => {
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 5,
      });

      let error;
      try {
        await rating.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.deliveryRating).toBeDefined();
    });

    it("should reject foodRating below 1", async () => {
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 0,
        deliveryRating: 4,
      });

      let error;
      try {
        await rating.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.foodRating).toBeDefined();
    });

    it("should reject foodRating above 5", async () => {
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 6,
        deliveryRating: 4,
      });

      let error;
      try {
        await rating.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.foodRating).toBeDefined();
    });

    it("should reject deliveryRating below 1", async () => {
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 5,
        deliveryRating: 0,
      });

      let error;
      try {
        await rating.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.deliveryRating).toBeDefined();
    });

    it("should reject deliveryRating above 5", async () => {
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 5,
        deliveryRating: 6,
      });

      let error;
      try {
        await rating.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.deliveryRating).toBeDefined();
    });

    it("should reject riderRating below 1", async () => {
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 5,
        deliveryRating: 4,
        riderRating: 0,
      });

      let error;
      try {
        await rating.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.riderRating).toBeDefined();
    });

    it("should reject riderRating above 5", async () => {
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 5,
        deliveryRating: 4,
        riderRating: 6,
      });

      let error;
      try {
        await rating.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.riderRating).toBeDefined();
    });

    it("should trim whitespace from review", () => {
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 5,
        deliveryRating: 4,
        review: "  Great service  ",
      });

      expect(rating.review).toBe("Great service");
    });

    it("should enforce review maxlength of 500 characters", async () => {
      const longReview = "a".repeat(501);
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 5,
        deliveryRating: 4,
        review: longReview,
      });

      let error;
      try {
        await rating.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.review).toBeDefined();
    });

    it("should accept review with 500 characters", async () => {
      const exactLengthReview = "a".repeat(500);
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 5,
        deliveryRating: 4,
        review: exactLengthReview,
      });

      const error = rating.validateSync();
      expect(error).toBeUndefined();
    });

    it("should have timestamps", () => {
      const rating = new Rating({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        foodRating: 5,
        deliveryRating: 4,
      });

      expect(rating.createdAt).toBeDefined();
      expect(rating.updatedAt).toBeDefined();
    });
  });

  describe("Schema Indexes", () => {
    it("should have orderId unique index", () => {
      const indexes = Rating.schema.indexes();
      const orderIdIndex = indexes.find(
        (idx: any) => idx[0].orderId === 1
      );

      expect(orderIdIndex).toBeDefined();
      expect(orderIdIndex[1].unique).toBe(true);
    });

    it("should have userId index", () => {
      const indexes = Rating.schema.indexes();
      const userIdIndex = indexes.find(
        (idx: any) => idx[0].userId === 1
      );

      expect(userIdIndex).toBeDefined();
    });

    it("should have riderId index", () => {
      const indexes = Rating.schema.indexes();
      const riderIdIndex = indexes.find(
        (idx: any) => idx[0].riderId === 1
      );

      expect(riderIdIndex).toBeDefined();
    });
  });
});