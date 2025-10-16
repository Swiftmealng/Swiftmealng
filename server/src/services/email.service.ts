import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import Logger from "../utils/logger";

let transporter: nodemailer.Transporter | null = null;
let useSendGridAPI = false;

const initializeEmailService = () => {
  if (!process.env.EMAIL_PASSWORD) {
    Logger.warn("Email credentials not found. Email functionality disabled.");
    return null;
  }

  try {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
    const isSendGrid = process.env.EMAIL_HOST === 'smtp.sendgrid.net';
    
    // Use SendGrid API in production (Railway blocks SMTP)
    if (isProduction && isSendGrid) {
      sgMail.setApiKey(process.env.EMAIL_PASSWORD);
      useSendGridAPI = true;
      Logger.info("Email service initialized with SendGrid API", {
        mode: "API",
        environment: "production"
      });
      return null; // Return null since we're not using nodemailer
    }
    
    // Use SMTP for local development
    const port = Number(process.env.EMAIL_PORT) || 587;
    const timeout = 10000;
    
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: timeout,
      greetingTimeout: timeout,
      socketTimeout: timeout,
    });

    Logger.info("Email service initialized with SMTP", {
      host: process.env.EMAIL_HOST,
      user: process.env.EMAIL_USER,
      port: process.env.EMAIL_PORT,
      environment: "development"
    });

    return transporter;
  } catch (error) {
    Logger.error("Failed to initialize email service", { error });
    return null;
  }
};

transporter = initializeEmailService();

// Helper function to send emails
const sendEmail = async (to: string, subject: string, html: string, text?: string): Promise<boolean> => {
  try {
    // Generate plain text version if not provided
    const plainText = text || html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    // Use SendGrid API in production
    if (useSendGridAPI) {
      await sgMail.send({
        to,
        from: process.env.EMAIL_FROM || "noreply@swiftmeal.com",
        subject,
        html,
        text: plainText,
        // Add tracking settings to improve deliverability
        trackingSettings: {
          clickTracking: { enable: false },
          openTracking: { enable: false },
        },
      });
      return true;
    }

    // Use SMTP for local development
    if (!transporter) {
      Logger.warn("Email service not configured");
      return false;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: plainText,
    });
    return true;
  } catch (error) {
    Logger.error("Failed to send email", { to, subject, error });
    return false;
  }
};

export const sendVerificationEmail = async (
  email: string,
  code: string,
): Promise<boolean> => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Welcome to SWIFTMEAL!</h2>
      <p>Thank you for registering with SWIFTMEAL. Please verify your email address using the code below:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
        <h1 style="color: #007bff; letter-spacing: 5px; margin: 0; font-size: 32px;">${code}</h1>
      </div>
      <p style="color: #666;">This verification code will expire in 10 minutes.</p>
      <p style="color: #666;">If you did not create an account with SWIFTMEAL, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        SWIFTMEAL Order Tracking System<br>
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  `;

  const plainText = `
Welcome to SWIFTMEAL!

Thank you for registering with SWIFTMEAL. Please verify your email address using the code below:

${code}

This verification code will expire in 10 minutes.

If you did not create an account with SWIFTMEAL, please ignore this email.

---
SWIFTMEAL Order Tracking System
This is an automated message, please do not reply to this email.
  `;

  const sent = await sendEmail(email, "Verify Your Email - SWIFTMEAL", htmlContent, plainText);
  if (sent) {
    Logger.info("Verification email sent", { email, method: useSendGridAPI ? "API" : "SMTP" });
  }
  return sent;
};

export const sendWelcomeEmail = async (
  email: string,
  name: string,
): Promise<boolean> => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Welcome to SWIFTMEAL, ${name}!</h2>
      <p>Your email has been verified successfully. Thank you for joining us!</p>
      <p>You can now start tracking your food orders in real-time with SWIFTMEAL.</p>
      <p>Get started by placing your first order or exploring our features.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        SWIFTMEAL Order Tracking System<br>
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  `;

  const plainText = `
Welcome to SWIFTMEAL, ${name}!

Your email has been verified successfully. Thank you for joining us!

You can now start tracking your food orders in real-time with SWIFTMEAL.

Get started by placing your first order or exploring our features.

---
SWIFTMEAL Order Tracking System
This is an automated message, please do not reply to this email.
  `;

  const sent = await sendEmail(email, "Welcome to SWIFTMEAL!", htmlContent, plainText);
  if (sent) {
    Logger.info("Welcome email sent", { email, method: useSendGridAPI ? "API" : "SMTP" });
  }
  return sent;
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
): Promise<boolean> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested to reset your password for your SWIFTMEAL account.</p>
      <p>Please use the link below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #666; font-size: 14px;">Or copy and paste this URL into your browser:</p>
      <p style="color: #007bff; font-size: 12px; word-break: break-all;">${resetUrl}</p>
      <p style="color: #666;">This link will expire in 1 hour.</p>
      <p style="color: #666;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        SWIFTMEAL Order Tracking System<br>
        This is an automated message, please do not reply to this email.
      </p>
    </div>
  `;

  const plainText = `
Password Reset Request

You requested to reset your password for your SWIFTMEAL account.

Please use the link below to reset your password:

${resetUrl}

This link will expire in 1 hour.

If you did not request a password reset, please ignore this email. Your password will remain unchanged.

---
SWIFTMEAL Order Tracking System
This is an automated message, please do not reply to this email.
  `;

  const sent = await sendEmail(email, "Reset Your Password - SWIFTMEAL", htmlContent, plainText);
  if (sent) {
    Logger.info("Password reset email sent", { email, method: useSendGridAPI ? "API" : "SMTP" });
  }
  return sent;
};

export const isEmailServiceConfigured = (): boolean => {
  return transporter !== null;
};

export const verifyEmailConnection = async (): Promise<boolean> => {
  if (!transporter) {
    Logger.warn("Email transporter not initialized");
    return false;
  }

  try {
    await transporter.verify();
    Logger.info("Email service connection verified successfully");
    return true;
  } catch (error) {
    Logger.error("Email service connection verification failed", { error });
    return false;
  }
};
