import mongoose, { Document, Schema } from "mongoose";
export interface IDelayAnalytics extends Document {
  date: Date;
  area: string;
  city: string;
  coordinates: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  totalOrders: number;
  delayedOrders: number;
  delayPercentage: number;
  averageDelayMinutes: number;
  maxDelayMinutes: number;
  minDelayMinutes: number;
  delayReasons: Array<{
    reason: string;
    count: number;
  }>;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  weekday: number; // 0-6 (Sunday-Saturday)
  createdAt: Date;
  updatedAt: Date;
}

const DelayAnalyticsSchema: Schema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    area: {
      type: String,
      required: true,
      index: true,
    },
    city: {
      type: String,
      required: true,
    },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    totalOrders: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    delayedOrders: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    delayPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    averageDelayMinutes: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    maxDelayMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },
    minDelayMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },
    delayReasons: [
      {
        reason: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    timeOfDay: {
      type: String,
      enum: ["morning", "afternoon", "evening", "night"],
      required: true,
    },
    weekday: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
  },
  {
    timestamps: true,
  },
);

// Geospatial index for heatmap queries
DelayAnalyticsSchema.index({ coordinates: "2dsphere" });

// Compound indexes for analytics queries
DelayAnalyticsSchema.index({ date: -1, area: 1 });
DelayAnalyticsSchema.index({ area: 1, date: -1 });
DelayAnalyticsSchema.index({ delayPercentage: -1, date: -1 });
DelayAnalyticsSchema.index({ timeOfDay: 1, weekday: 1 });

// Unique constraint to prevent duplicate analytics entries
DelayAnalyticsSchema.index(
  { date: 1, area: 1, timeOfDay: 1 },
  { unique: true },
);

export default mongoose.model<IDelayAnalytics>(
  "DelayAnalytics",
  DelayAnalyticsSchema,
);
