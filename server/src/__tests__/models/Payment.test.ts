import mongoose from "mongoose";
import Payment from "../../models/Payment";

describe("Payment Model", () => {
  describe("Schema Validation", () => {
    it("should create a payment with all fields", () => {
      const paymentData = {
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        amount: 5000,
        currency: "NGN",
        reference: "SWM-123456",
        provider: "paystack" as const,
        status: "pending" as const,
        authorizationUrl: "https://checkout.paystack.com/abc123",
        accessCode: "abc123",
        providerResponse: { data: "test" },
        paidAt: new Date(),
      };

      const payment = new Payment(paymentData);

      expect(payment.orderId).toEqual(paymentData.orderId);
      expect(payment.orderNumber).toBe("ORD-001");
      expect(payment.userId).toEqual(paymentData.userId);
      expect(payment.amount).toBe(5000);
      expect(payment.currency).toBe("NGN");
      expect(payment.reference).toBe("SWM-123456");
      expect(payment.provider).toBe("paystack");
      expect(payment.status).toBe("pending");
      expect(payment.authorizationUrl).toBe("https://checkout.paystack.com/abc123");
      expect(payment.accessCode).toBe("abc123");
      expect(payment.paidAt).toEqual(paymentData.paidAt);
    });

    it("should create a payment with minimal fields", () => {
      const paymentData = {
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        amount: 5000,
        reference: "SWM-123456",
      };

      const payment = new Payment(paymentData);

      expect(payment.orderId).toEqual(paymentData.orderId);
      expect(payment.orderNumber).toBe("ORD-001");
      expect(payment.userId).toEqual(paymentData.userId);
      expect(payment.amount).toBe(5000);
      expect(payment.reference).toBe("SWM-123456");
      expect(payment.currency).toBe("NGN"); // Default value
      expect(payment.provider).toBe("paystack"); // Default value
      expect(payment.status).toBe("pending"); // Default value
    });

    it("should fail validation without orderId", async () => {
      const payment = new Payment({
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        amount: 5000,
        reference: "SWM-123456",
      });

      let error;
      try {
        await payment.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.orderId).toBeDefined();
    });

    it("should fail validation without orderNumber", async () => {
      const payment = new Payment({
        orderId: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        amount: 5000,
        reference: "SWM-123456",
      });

      let error;
      try {
        await payment.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.orderNumber).toBeDefined();
    });

    it("should fail validation without userId", async () => {
      const payment = new Payment({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        amount: 5000,
        reference: "SWM-123456",
      });

      let error;
      try {
        await payment.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.userId).toBeDefined();
    });

    it("should fail validation without amount", async () => {
      const payment = new Payment({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        reference: "SWM-123456",
      });

      let error;
      try {
        await payment.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.amount).toBeDefined();
    });

    it("should fail validation without reference", async () => {
      const payment = new Payment({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        amount: 5000,
      });

      let error;
      try {
        await payment.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.reference).toBeDefined();
    });

    it("should reject negative amount", async () => {
      const payment = new Payment({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        amount: -100,
        reference: "SWM-123456",
      });

      let error;
      try {
        await payment.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.amount).toBeDefined();
    });

    it("should accept zero amount", async () => {
      const payment = new Payment({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        amount: 0,
        reference: "SWM-123456",
      });

      const error = payment.validateSync();
      expect(error).toBeUndefined();
    });

    it("should uppercase currency", () => {
      const payment = new Payment({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        amount: 5000,
        reference: "SWM-123456",
        currency: "ngn",
      });

      expect(payment.currency).toBe("NGN");
    });

    it("should only accept paystack as provider", async () => {
      const payment = new Payment({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        amount: 5000,
        reference: "SWM-123456",
        provider: "stripe" as any,
      });

      let error;
      try {
        await payment.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.provider).toBeDefined();
    });

    it("should only accept valid status values", async () => {
      const payment = new Payment({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        amount: 5000,
        reference: "SWM-123456",
        status: "invalid" as any,
      });

      let error;
      try {
        await payment.validate();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.status).toBeDefined();
    });

    it("should accept all valid status values", async () => {
      const statuses = ["pending", "success", "failed", "cancelled"];

      for (const status of statuses) {
        const payment = new Payment({
          orderId: new mongoose.Types.ObjectId(),
          orderNumber: "ORD-001",
          userId: new mongoose.Types.ObjectId(),
          amount: 5000,
          reference: `SWM-${status}`,
          status: status as any,
        });

        const error = payment.validateSync();
        expect(error).toBeUndefined();
      }
    });

    it("should have timestamps", () => {
      const payment = new Payment({
        orderId: new mongoose.Types.ObjectId(),
        orderNumber: "ORD-001",
        userId: new mongoose.Types.ObjectId(),
        amount: 5000,
        reference: "SWM-123456",
      });

      expect(payment.createdAt).toBeDefined();
      expect(payment.updatedAt).toBeDefined();
    });
  });

  describe("Schema Indexes", () => {
    it("should have orderId index", () => {
      const indexes = Payment.schema.indexes();
      const orderIdIndex = indexes.find(
        (idx: any) => idx[0].orderId === 1
      );

      expect(orderIdIndex).toBeDefined();
    });

    it("should have userId index", () => {
      const indexes = Payment.schema.indexes();
      const userIdIndex = indexes.find(
        (idx: any) => idx[0].userId === 1
      );

      expect(userIdIndex).toBeDefined();
    });

    it("should have reference unique index", () => {
      const indexes = Payment.schema.indexes();
      const referenceIndex = indexes.find(
        (idx: any) => idx[0].reference === 1
      );

      expect(referenceIndex).toBeDefined();
      expect(referenceIndex[1].unique).toBe(true);
    });

    it("should have status index", () => {
      const indexes = Payment.schema.indexes();
      const statusIndex = indexes.find(
        (idx: any) => idx[0].status === 1
      );

      expect(statusIndex).toBeDefined();
    });
  });
});