import { Request, Response, NextFunction } from "express";
import { AuthenticationError, AuthorizationError } from "../utils/AppError";
import { verifyToken } from "../utils/generateToken";
import User from "../models/User";
import asyncHandler from "../utils/asyncHandler";

// Extend Express Request type
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new AuthenticationError("Not authorized. Please log in.");
    }

    try {
      const decoded = verifyToken(token);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        throw new AuthenticationError("User no longer exists");
      }

      req.user = {
        id: String(user._id),
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      throw new AuthenticationError("Invalid token. Please log in again.");
    }
  },
);

export const protect = authenticate;

// Restrict routes to specific roles
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError("Not authorized");
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError(
        `You do not have permission to perform this action. Required roles: ${roles.join(", ")}`,
      );
    }

    next();
  };
};
