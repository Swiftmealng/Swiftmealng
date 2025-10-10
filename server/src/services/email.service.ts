import nodemailer from "nodemailer";
import Logger from "../utils/logger";

let transporter: nodemailer.Transporter | null = null;

const initializeEmailService = () => {
  if (
    !process.env.EMAIL_HOST ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASSWORD
  ) {
    Logger.warn("Email credentials not found. Email functionality disabled.");
    return null;
  }

  try {
    const port = Number(process.env.EMAIL_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: port,
      secure: port === 465, // true for 465, false for other ports like 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    Logger.info("Email service initialized", {
      host: process.env.EMAIL_HOST,
      user: process.env.EMAIL_USER,
      port: process.env.EMAIL_PORT,
    });

    return transporter;
  } catch (error) {
    Logger.error("Failed to initialize email service", { error });
    return null;
  }
};

transporter = initializeEmailService();

export const sendVerificationEmail = async (
  email: string,
  code: string,
): Promise<boolean> => {
  if (!transporter) {
    Logger.warn("Email service not configured. Skipping verification email.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Verify Your Email - SWIFTMEAL",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to SWIFTMEAL!</h2>
          <p>Thank you for registering. Please verify your email address using the code below:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">SWIFTMEAL Order Tracking System</p>
        </div>
      `,
    });

    Logger.info("Verification email sent", { email });
    return true;
  } catch (error) {
    Logger.error("Failed to send verification email", { email, error });
    return false;
  }
};

export const sendWelcomeEmail = async (email: string): Promise<boolean> => {
  if (!transporter) {
    Logger.warn("Email service not configured. Skipping welcome email.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Welcome to SWIFTMEAL!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; font-weight: bold;">Welcome to SWIFTMEAL!</h2>
          <p>Hello,</p>
          <p>Thank you for verifying your email address. Your account is now active.</p>
          <p>You can now login and start using our platform.</p>
          <p style="margin-top: 30px;">Best regards,<br>The SWIFTMEAL team</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">SWIFTMEAL Order Tracking System</p>
        </div>
      `,
    });

    Logger.info("Welcome email sent", { email });
    return true;
  } catch (error) {
    Logger.error("Failed to send welcome email", { email, error });
    return false;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  code: string,
): Promise<boolean> => {
  if (!transporter) {
    Logger.warn("Email service not configured. Skipping password reset email.");
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Password Reset - SWIFTMEAL",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset</h2>
          <p>You requested a password reset. Please use the following code to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666;">If you didn't request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">SWIFTMEAL Order Tracking System</p>
        </div>
      `,
    });

    Logger.info("Password reset email sent", { email });
    return true;
  } catch (error) {
    Logger.error("Failed to send password reset email", { email, error });
    return false;
  }
};

export const isEmailServiceConfigured = (): boolean => {
  return transporter !== null;
};
