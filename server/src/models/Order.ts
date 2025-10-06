
import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  customerName: string; // Denormalized for performance
  customerPhone: string;
  riderId?: mongoose.Types.ObjectId;
  riderName?: string; // Denormalized
  riderPhone?: string;
  status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  deliveryAddress: {
    street: string;
    area: string;
    city: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  restaurantAddress?: {
    street: string;
    area: string;
    city: string;
    coordinates: [number, number];
  };
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  isDelayed: boolean;
  delayMinutes?: number;
  delayReason?: string;
  trackingEvents: Array<{
    status: string;
    timestamp: Date;
    location?: {
      lat: number;
      lng: number;
    };
    note?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer ID is required']
    },
    customerName: {
      type: String,
      required: true
    },
    customerPhone: {
      type: String,
      required: true
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'Rider',
      default: null
    },
    riderName: {
      type: String,
      default: null
    },
    riderPhone: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
      index: true
    },
    items: [
      {
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryAddress: {
      street: {
        type: String,
        required: true
      },
      area: {
        type: String,
        required: true,
        index: true
      },
      city: {
        type: String,
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere'
      }
    },
    restaurantAddress: {
      street: String,
      area: String,
      city: String,
      coordinates: {
        type: [Number]
      }
    },
    estimatedDeliveryTime: {
      type: Date,
      required: true
    },
    actualDeliveryTime: {
      type: Date,
      default: null
    },
    isDelayed: {
      type: Boolean,
      default: false,
      index: true
    },
    delayMinutes: {
      type: Number,
      default: 0,
      min: 0
    },
    delayReason: {
      type: String,
      default: null
    },
    trackingEvents: [
      {
        status: {
          type: String,
          required: true
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        location: {
          lat: Number,
          lng: Number
        },
        note: String
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound indexes for common queries
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ riderId: 1, status: 1 });
OrderSchema.index({ 'deliveryAddress.area': 1, isDelayed: 1 });
OrderSchema.index({ isDelayed: 1, createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
