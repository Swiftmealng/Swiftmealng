import mongoose, { Document, Schema } from "mongoose";

export interface IRider extends Document {
  name: string;
  email: string;
  phone: string;
  photo?: string;
  currentLocation?: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  status: "available" | "busy" | "offline";
  totalDeliveries: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimePercentage: number;
  averageDeliveryTime: number; // in minutes
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const RiderSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Rider name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    photo: {
      type: String,
      default: null,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "offline",
    },
    totalDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
    onTimeDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
    lateDeliveries: {
      type: Number,
      default: 0,
      min: 0,
    },
    onTimePercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    averageDeliveryTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

// Create geospatial index for location queries
RiderSchema.index({ currentLocation: "2dsphere" });

// Index for faster queries
RiderSchema.index({ status: 1 });
RiderSchema.index({ email: 1 });

export default mongoose.model<IRider>("Rider", RiderSchema);
