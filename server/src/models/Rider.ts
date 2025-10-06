// models/Rider.ts
import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IRider extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "rider";
  isAvailable: boolean; // available to accept orders
  vehicle?: {
    type: "car" | "motorbike" | "van" | "other";
    plateNumber?: string;
    color?: string;
    model?: string;
  };
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  rating?: {
    average: number;
    count: number;
  };
  completedDeliveries?: number;
  verified?: boolean;
  documents?: {
    idCardUrl?: string;
    licenseUrl?: string;
    vehicleRegistrationUrl?: string;
  };
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IRiderModel extends Model<IRider> {
  findNearby(
    lng: number,
    lat: number,
    maxDistanceMeters?: number,
    limit?: number
  ): Promise<IRider[]>;
}

const RiderSchema: Schema<IRider> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["rider"],
      default: "rider",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    vehicle: {
      type: {
        type: String,
        enum: ["car", "motorbike", "van", "other"],
        default: "motorbike",
      },
      plateNumber: { type: String, trim: true },
      color: { type: String, trim: true },
      model: { type: String, trim: true },
    },

    // GeoJSON point for geospatial queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },

    rating: {
      average: { type: Number, default: 5 },
      count: { type: Number, default: 0 },
    },

    completedDeliveries: {
      type: Number,
      default: 0,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    documents: {
      idCardUrl: { type: String, trim: true },
      licenseUrl: { type: String, trim: true },
      vehicleRegistrationUrl: { type: String, trim: true },
    },

    lastSeen: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

RiderSchema.index({ location: "2dsphere" });

RiderSchema.pre<IRider>("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

RiderSchema.methods.comparePassword = async function (
  this: IRider,
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password as string);
};

// static helper to find nearby available riders
RiderSchema.statics.findNearby = function (
  lng: number,
  lat: number,
  maxDistanceMeters = 5000,
  limit = 10
) {
  return this.find({
    isAvailable: true,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistanceMeters,
      },
    },
  })
    .limit(limit)
    .select("+password") // remove if you do not want password ever returned; keep consistent with your security policy
    .exec();
};

export default mongoose.model<IRider, IRiderModel>("Rider", RiderSchema);
