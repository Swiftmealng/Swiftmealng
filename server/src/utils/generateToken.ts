import jwt from "jsonwebtoken";
import { Response } from "express";
import type { StringValue } from "ms";

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (
  payload: TokenPayload,
  customExpiresIn?: string,
): string => {
  const secret = process.env.JWT_SECRET;
  const expiresIn: StringValue = (customExpiresIn ||
    process.env.JWT_EXPIRES_IN ||
    "24h") as StringValue;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in env");
  }

  return jwt.sign(payload, secret, { expiresIn });
};

export const setTokenCookie = (res: Response, token: string): void => {
  const cookieOptions = {
    expires: new Date(
      Date.now() +
        parseInt(process.env.JWT_COOKIE_EXPIRES_IN || "1") *
          24 *
          60 *
          60 *
          1000,
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };

  res.cookie("jwt", token, cookieOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.verify(token, secret) as TokenPayload;
};
