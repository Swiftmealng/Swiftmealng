import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.loginUser(
    email,
    password,
  );

  res.cookie("accessToken", accessToken, {
    expires: new Date(Date.now() + 15 * 60 * 1000),
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
    },
  });
});

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;

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
    const refreshToken = req.cookies.refreshToken;

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
