import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "customer" | "support" | "operations" | "admin";
  phone?: string;
  isEmailVerified: boolean;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  verificationAttempts: number;
  verificationAttemptsResetAt?: Date;
  refreshToken?: string;
  refreshTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name must be less than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) => validator.isEmail(v),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "support", "operations", "admin"],
      default: "customer",
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) =>
          !v || validator.isMobilePhone(v, "any", { strictMode: false }),
        message: "Invalid phone number",
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeExpires: {
      type: Date,
      select: false,
    },
    verificationAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    verificationAttemptsResetAt: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    refreshTokenExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== "production",
  },
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

userSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password as string);
};

export default mongoose.model<IUser>("User", userSchema);
