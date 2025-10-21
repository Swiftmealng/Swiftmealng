import mongoose, { Document, Schema } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  mealName: string;
  restaurantName?: string;
  price?: number;
  imageUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mealName: {
      type: String,
      required: [true, "Meal name is required"],
      trim: true,
    },
    restaurantName: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate favorites for same user
favoriteSchema.index({ userId: 1, mealName: 1 }, { unique: true });

export default mongoose.model<IFavorite>("Favorite", favoriteSchema);
