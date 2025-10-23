import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";
import { generateToken } from "../utils/generateToken";
import User from "../models/User";
import bcrypt from "bcryptjs";

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  const { user, accessToken, refreshToken } = await authService.loginUser(
    email,
    password,
    rememberMe,
  );

  // Set cookie expiration based on rememberMe
  const accessTokenExpiry = rememberMe 
    ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    : new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  res.cookie("accessToken", accessToken, {
    expires: accessTokenExpiry,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.cookie("refreshToken", refreshToken, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    data: {
      user,
      accessToken,
      refreshToken,  // ✅ Add refreshToken to response body
    },
  });
});

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, role, inviteToken } = req.body;

  // Block admin/operations role signup without invite token
  if (['admin', 'operations'].includes(role)) {
    if (!inviteToken) {
      throw new AppError('Admin invitation required for this role', 403);
    }

    // Validate invite token
    try {
      const decoded = jwt.verify(inviteToken, process.env.JWT_SECRET!) as {
        email: string;
        role: string;
        type: string;
      };

      // Verify token type, email, and role match
      if (decoded.type !== 'admin-invite') {
        throw new AppError('Invalid invitation token', 403);
      }
      if (decoded.email !== email) {
        throw new AppError('Invitation email does not match', 403);
      }
      if (decoded.role !== role) {
        throw new AppError('Invitation role does not match', 403);
      }
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Invitation link has expired', 403);
      }
      if (error.name === 'JsonWebTokenError') {
        throw new AppError('Invalid invitation token', 403);
      }
      throw error;
    }
  }

  const { user, message } = await authService.registerUser({
    name,
    email,
    password,
    phone,
    role,
  });

  res.status(201).json({
    success: true,
    message,
    data: {
      user,
    },
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;

  if (authReq.user) {
    await authService.logoutUser(authReq.user.id);
  }

  res.cookie("accessToken", "", {
    expires: new Date(0),
    httpOnly: true,
  });

  res.cookie("refreshToken", "", {
    expires: new Date(0),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/**
 * @desc    Verify email
 * @route   POST /api/v1/auth/verify-email
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { email, code } = req.body;

  const result = await authService.verifyEmail(email, code);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * @desc    Resend verification code
 * @route   POST /api/v1/auth/resend-code
 * @access  Public
 */
export const resendCode = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const result = await authService.resendVerificationCode(email);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    // Check both request body and cookies for refresh token
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    res.cookie("accessToken", accessToken, {
      expires: new Date(Date.now() + 15 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
  },
);

/**
 * @desc    Request password reset
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await authService.requestPasswordReset(email);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  },
);

/**
 * @desc    Reset password with code
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body;

    const result = await authService.resetPassword(email, code, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  },
);

/**
 * @desc    Generate admin invitation link
 * @route   POST /api/v1/auth/admin/invite
 * @access  Private (Admin only)
 */
export const sendAdminInvite = asyncHandler(
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    const { email, role } = req.body;

    // Ensure only admins can send invites
    if (authReq.user?.role !== 'admin') {
      throw new AppError('Only admins can send invitations', 403);
    }

    // Validate role
    const allowedRoles = ['admin', 'operations', 'support'];
    if (!allowedRoles.includes(role)) {
      throw new AppError(
        `Invalid role. Allowed: ${allowedRoles.join(', ')}`,
        400,
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new AppError('Valid email is required', 400);
    }

    // Generate invite token (7-day expiry)
    const inviteToken = jwt.sign(
      {
        email,
        role,
        type: 'admin-invite',
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    );

    // Generate invite link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const inviteLink = `${frontendUrl}/signup?token=${inviteToken}`;

    res.status(200).json({
      success: true,
      message: 'Invitation generated successfully',
      data: {
        inviteLink,
        inviteToken,
        email,
        role,
        expiresIn: '7 days',
      },
    });
  },
);

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError('Refresh token is required', 400);
  }

  const user = await User.findOne({
    refreshToken: { $exists: true },
    refreshTokenExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Verify the refresh token
  const isValidRefreshToken = await bcrypt.compare(token, user.refreshToken!);

  if (!isValidRefreshToken) {
    throw new AppError('Invalid refresh token', 401);
  }

  // Generate new access token
  // If refresh token is still valid (within 7 days), user originally had rememberMe
  // Otherwise, use short expiry
  const daysRemaining = Math.ceil((user.refreshTokenExpires!.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const accessTokenExpiry = daysRemaining > 1 ? "7d" : "15m";

  const accessToken = generateToken(
    {
      id: String(user._id),
      email: user.email,
      role: user.role,
    },
    accessTokenExpiry,
  );

  res.status(200).json({
    success: true,
    data: {
      accessToken,
    },
  });
});
