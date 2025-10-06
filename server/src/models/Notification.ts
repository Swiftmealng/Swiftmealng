import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  type: 'order_placed' | 'order_confirmed' | 'out_for_delivery' | 'delivered' | 'delay_alert' | 'cancelled';
  channel: 'sms' | 'email' | 'push';
  recipient: {
    name: string;
    phone?: string;
    email?: string;
  };
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  attempts: number;
  maxAttempts: number;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  providerResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    orderNumber: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['order_placed', 'order_confirmed', 'out_for_delivery', 'delivered', 'delay_alert', 'cancelled'],
      required: true,
      index: true
    },
    channel: {
      type: String,
      enum: ['sms', 'email', 'push'],
      required: true
    },
    recipient: {
      name: {
        type: String,
        required: true
      },
      phone: String,
      email: String
    },
    message: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending',
      index: true
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0
    },
    maxAttempts: {
      type: Number,
      default: 3,
      min: 1
    },
    sentAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
      default: null
    },
    failedAt: {
      type: Date,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    },
    providerResponse: {
      type: Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for queries
NotificationSchema.index({ status: 1, createdAt: -1 });
NotificationSchema.index({ orderId: 1, type: 1 });
NotificationSchema.index({ channel: 1, status: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
