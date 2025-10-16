import User from "../models/User";
import { AuthenticationError } from "../utils/AppError";
import { generateToken } from "../utils/generateToken";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "./email.service";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select(
    "+password +refreshToken +refreshTokenExpires",
  );

  if (!user) {
    throw new AuthenticationError("Invalid email or password");
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new AuthenticationError("Invalid email or password");
  }

  if (!user.isEmailVerified) {
    throw new AuthenticationError("Please verify your email before logging in");
  }

  const accessToken = generateToken(
    {
      id: String(user._id),
      email: user.email,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  );

  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  user.refreshToken = hashedRefreshToken;
  user.refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save();

  const userObject = user.toObject() as any;
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.refreshTokenExpires;

  return { user: userObject, accessToken, refreshToken };
};

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}) => {
  const existingUser = await User.findOne({ email: userData.email });

  if (existingUser) {
    throw new AuthenticationError("User with this email already exists");
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    ...userData,
    verificationCode,
    verificationCodeExpires,
    verificationAttempts: 0,
  });

  try {
    const emailSent = await sendVerificationEmail(user.email, verificationCode);

    if (!emailSent) {
      // Delete the user if email failed to send
      await User.deleteOne({ _id: user._id });
      throw new AuthenticationError(
        "Failed to send verification email. Please check your email configuration or try again later.",
      );
    }
  } catch (emailError) {
    // Delete the user if email sending throws an error
    await User.deleteOne({ _id: user._id });
    throw new AuthenticationError(
      "Email service temporarily unavailable. Please try again later.",
    );
  }

  const userObject = user.toObject() as any;
  delete userObject.password;
  delete userObject.verificationCode;
  delete userObject.verificationCodeExpires;

  return { user: userObject, message: "Verification code sent to your email" };
};

export const verifyEmail = async (email: string, code: string) => {
  const user = await User.findOne({ email }).select(
    "+verificationCode +verificationCodeExpires +verificationAttempts +verificationAttemptsResetAt",
  );

  if (!user) {
    throw new AuthenticationError("User not found");
  }

  if (user.isEmailVerified) {
    throw new AuthenticationError("Email already verified");
  }

  const now = new Date();

  if (
    user.verificationAttemptsResetAt &&
    user.verificationAttemptsResetAt > now
  ) {
    if (user.verificationAttempts >= 3) {
      throw new AuthenticationError(
        "Too many attempts. Please try again later",
      );
    }
  } else {
    user.verificationAttempts = 0;
    user.verificationAttemptsResetAt = new Date(now.getTime() + 60 * 60 * 1000);
  }

  user.verificationAttempts += 1;

  if (!user.verificationCode || !user.verificationCodeExpires) {
    throw new AuthenticationError(
      "No verification code found. Please request a new one",
    );
  }

  if (user.verificationCodeExpires < now) {
    throw new AuthenticationError(
      "Verification code expired. Please request a new one",
    );
  }

  if (user.verificationCode !== code) {
    await user.save();
    throw new AuthenticationError("Invalid verification code");
  }

  user.isEmailVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  user.verificationAttempts = 0;
  user.verificationAttemptsResetAt = undefined;
  await user.save();

  await sendWelcomeEmail(user.email,user.name);

  return { message: "Email verified successfully" };
};

export const resendVerificationCode = async (email: string) => {
  const user = await User.findOne({ email }).select(
    "+verificationAttempts +verificationAttemptsResetAt",
  );

  if (!user) {
    throw new AuthenticationError("User not found");
  }

  if (user.isEmailVerified) {
    throw new AuthenticationError("Email already verified");
  }

  const now = new Date();

  if (
    user.verificationAttemptsResetAt &&
    user.verificationAttemptsResetAt > now
  ) {
    if (user.verificationAttempts >= 3) {
      throw new AuthenticationError(
        "Too many resend attempts. Please try again later",
      );
    }
  } else {
    user.verificationAttempts = 0;
    user.verificationAttemptsResetAt = new Date(now.getTime() + 60 * 60 * 1000);
  }

  user.verificationAttempts += 1;

  const verificationCode = generateVerificationCode();
  user.verificationCode = verificationCode;
  user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendVerificationEmail(user.email, verificationCode);

  return { message: "New verification code sent to your email" };
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AuthenticationError("Refresh token required");
  }

  const user = await User.findOne({
    refreshTokenExpires: { $gt: new Date() },
  }).select("+refreshToken +refreshTokenExpires");

  if (!user || !user.refreshToken) {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  const isValidToken = await bcrypt.compare(refreshToken, user.refreshToken);

  if (!isValidToken) {
    throw new AuthenticationError("Invalid or expired refresh token");
  }

  const accessToken = generateToken(
    {
      id: String(user._id),
      email: user.email,
      role: user.role,
    },
    process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
  );

  return { accessToken };
};

export const logoutUser = async (userId: string) => {
  await User.findByIdAndUpdate(userId, {
    $unset: { refreshToken: 1, refreshTokenExpires: 1 },
  });

  return { message: "Logged out successfully" };
};

export const requestPasswordReset = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AuthenticationError("User not found");
  }

  const resetCode = generateVerificationCode();
  user.verificationCode = resetCode;
  user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendPasswordResetEmail(user.email, resetCode);

  return { message: "Password reset code sent to your email" };
};

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string,
) => {
  const user = await User.findOne({ email }).select(
    "+verificationCode +verificationCodeExpires",
  );

  if (!user) {
    throw new AuthenticationError("User not found");
  }

  if (!user.verificationCode || !user.verificationCodeExpires) {
    throw new AuthenticationError(
      "No reset code found. Please request a new one",
    );
  }

  if (user.verificationCodeExpires < new Date()) {
    throw new AuthenticationError(
      "Reset code expired. Please request a new one",
    );
  }

  if (user.verificationCode !== code) {
    throw new AuthenticationError("Invalid reset code");
  }

  user.password = newPassword;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  user.refreshToken = undefined;
  user.refreshTokenExpires = undefined;
  await user.save();

  return { message: "Password reset successfully" };
};
