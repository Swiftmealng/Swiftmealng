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
const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    // Use SendGrid API in production
    if (useSendGridAPI) {
      await sgMail.send({
        to,
        from: process.env.EMAIL_FROM || "noreply@swiftmeal.com",
        subject,
        html,
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
  `;

  const sent = await sendEmail(email, "Verify Your Email - SWIFTMEAL", htmlContent);
  if (sent) {
    Logger.info("Verification email sent", { email, method: useSendGridAPI ? "API" : "SMTP" });
  }
  return sent;
};

export const sendWelcomeEmail = async (email: string): Promise<boolean> => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; font-weight: bold;">Welcome to SWIFTMEAL!</h2>
      <p>Hello,</p>
      <p>Thank you for verifying your email address. Your account is now active.</p>
      <p>You can now login and start using our platform.</p>
      <p style="margin-top: 30px;">Best regards,<br>The SWIFTMEAL team</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">SWIFTMEAL Order Tracking System</p>
    </div>
  `;

  const sent = await sendEmail(email, "Welcome to SWIFTMEAL!", htmlContent);
  if (sent) {
    Logger.info("Welcome email sent", { email });
  }
  return sent;
};

export const sendPasswordResetEmail = async (
  email: string,
  code: string,
): Promise<boolean> => {
  const htmlContent = `
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
  `;

  const sent = await sendEmail(email, "Password Reset - SWIFTMEAL", htmlContent);
  if (sent) {
    Logger.info("Password reset email sent", { email });
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
