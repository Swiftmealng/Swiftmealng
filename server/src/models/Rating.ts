import mongoose, { Document, Schema } from "mongoose";

export interface IRating extends Document {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  userId: mongoose.Types.ObjectId;
  riderId?: mongoose.Types.ObjectId;
  foodRating: number;
  deliveryRating: number;
  riderRating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // One rating per order
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: "Rider",
      index: true,
    },
    foodRating: {
      type: Number,
      required: [true, "Food rating is required"],
      min: 1,
      max: 5,
    },
    deliveryRating: {
      type: Number,
      required: [true, "Delivery rating is required"],
      min: 1,
      max: 5,
    },
    riderRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRating>("Rating", ratingSchema);
