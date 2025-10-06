import mongoose, { Document, Schema, Model, Types } from "mongoose";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "picked_up"
  | "delivering"
  | "delivered"
  | "cancelled"
  | "failed";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type DeliveryType = "delivery" | "pickup";

export interface IOrderItem {
  productId?: Types.ObjectId;
  name: string;
  qty: number;
  price: number; // unit price
  total?: number; // qty * price (computed)
  options?: Record<string, any>;
  notes?: string;
}

export interface IDeliveryAddress {
  name?: string; // e.g., "Home", "Office"
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  // GeoJSON point: [lng, lat] for geospatial queries
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
}

export interface IPaymentInfo {
  method?: string; // e.g. "card", "cash", "wallet"
  provider?: string; // e.g. "stripe", "paystack"
  transactionId?: string;
  status: PaymentStatus;
  amountPaid?: number;
  metadata?: Record<string, any>;
}

export interface IOrder extends Document {
  customer: Types.ObjectId; // reference to User
  restaurant?: Types.ObjectId; // reference to Restaurant collection (optional)
  rider?: Types.ObjectId | null; // assigned rider
  items: IOrderItem[];
  itemsTotal: number; // sum(items)
  deliveryFee: number;
  tax: number;
  discount: number;
  grandTotal: number; // itemsTotal + deliveryFee + tax - discount
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryAddress?: IDeliveryAddress;
  instructions?: string;
  payment: IPaymentInfo;
  estimatedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  canceledAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  calculateTotals(): void;
  canTransitionTo(nextStatus: OrderStatus): boolean;
}

interface IOrderModel extends Model<IOrder> {
  activeForRider(riderId: Types.ObjectId): Promise<IOrder[]>;
  recentForCustomer(
    customerId: Types.ObjectId,
    limit?: number
  ): Promise<IOrder[]>;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: false },
    name: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: false }, // computed
    options: { type: Schema.Types.Mixed },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const DeliveryAddressSchema = new Schema<IDeliveryAddress>(
  {
    name: { type: String, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    phone: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
      },
    },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPaymentInfo>(
  {
    method: { type: String, trim: true },
    provider: { type: String, trim: true },
    transactionId: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    amountPaid: { type: Number, min: 0 },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const OrderSchema: Schema<IOrder> = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant" },

    rider: { type: Schema.Types.ObjectId, ref: "Rider", default: null },

    items: { type: [OrderItemSchema], required: true, default: [] },

    itemsTotal: { type: Number, required: true, default: 0 },
    deliveryFee: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "picked_up",
        "delivering",
        "delivered",
        "cancelled",
        "failed",
      ],
      default: "pending",
    },

    deliveryType: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery",
    },

    deliveryAddress: { type: DeliveryAddressSchema },

    instructions: { type: String, trim: true },

    payment: { type: PaymentSchema, default: () => ({ status: "pending" }) },

    estimatedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    canceledAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ "deliveryAddress.location": "2dsphere" }); // allow geospatial queries on deliveryAddress.location

// Instance method: compute itemsTotal and grandTotal
OrderSchema.methods.calculateTotals = function (this: IOrder) {
  // compute each item total (qty * price) and sum
  let itemsTotal = 0;
  for (const it of this.items) {
    // coerce and guard against NaN
    const qty = Number(it.qty) || 0;
    const price = Number(it.price) || 0;
    it.total = Math.round(qty * price * 100) / 100; // keep 2 decimals for kobo
    itemsTotal += it.total;
  }

  this.itemsTotal = Math.round(itemsTotal * 100) / 100;
  // grand total = itemsTotal + deliveryFee + tax - discount - i.e if we're adding tax or discount.
  const gf =
    this.itemsTotal +
    (Number(this.deliveryFee) || 0) +
    (Number(this.tax) || 0) -
    (Number(this.discount) || 0);
  this.grandTotal = Math.round((gf + Number.EPSILON) * 100) / 100;
};

// Simple status transition guard (you can extend this)
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["accepted", "cancelled", "failed"],
  accepted: ["preparing", "cancelled", "failed"],
  preparing: ["ready", "cancelled", "failed"],
  ready: ["picked_up", "cancelled", "failed"],
  picked_up: ["delivering", "failed"],
  delivering: ["delivered", "failed"],
  delivered: [],
  cancelled: [],
  failed: [],
};

OrderSchema.methods.canTransitionTo = function (
  this: IOrder,
  nextStatus: OrderStatus
) {
  const allowed = ALLOWED_TRANSITIONS[this.status] || [];
  return allowed.includes(nextStatus);
};

// Pre-save: ensure totals are computed
OrderSchema.pre<IOrder>("save", function (next) {
  // compute totals every save in case items changed
  this.calculateTotals();
  next();
});

export default mongoose.model<IOrder, IOrderModel>("Order", OrderSchema);
