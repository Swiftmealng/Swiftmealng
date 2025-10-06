import mongoose, { Document, Schema } from "mongoose";
export interface INotification extends Document {
  phoneNumber?: string; // for sending SMS
  email: string;
  notificationChannels: "sms" | "email";
  notificationKind:
    | "order_notification"
    | "delay_notification"
    | "delivery_notification"
    | "system_notification"; // System updates etc
  notificationMessage: string;
  scheduledAt?: Date | null;
  expiresAt?: Date | null;
  isRead: boolean;
  readAt?: Date | null;
  deliveredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  phoneNumber: {
    type: String,
    required: false,
    index: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  notificationChannels: {
    type: String,
    required: true,
    default: "email",
  },
  notificationKind: {
    type: String,
    required: true,
  },
  notificationMessage: {
    type: String,
    required: true,
  },
  scheduledAt: {
    type: Date,
    required: false,
  },
  expiresAt: { type: Date, default: null },
  isRead: { type: Boolean, default: false, index: true },
  readAt: { type: Date, default: null },
  deliveredAt: { type: Date, default: null },
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});

NotificationSchema.index({ phoneNumber: 1, email: 1, isRead: 1 });

export default mongoose.model<INotification>(
  "DelayAnalytics",
  NotificationSchema
);
