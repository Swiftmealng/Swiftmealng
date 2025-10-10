import { v2 as cloudinary } from "cloudinary";
import Logger from "../../utils/logger";

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  Logger.info("Cloudinary configured", { cloudName });
} else {
  Logger.warn(
    "Cloudinary credentials not found. Image upload functionality disabled.",
  );
}

interface UploadOptions {
  folder?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  };
  resource_type?: "image" | "video" | "raw" | "auto";
}

/**
 * Upload file buffer to Cloudinary
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  options: UploadOptions = {},
): Promise<{ url: string; publicId: string }> => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary not configured. Please add credentials to .env",
    );
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: options.folder || "swiftmeal",
      resource_type: options.resource_type || "image",
    };

    // Apply transformations if provided
    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          Logger.error("Cloudinary upload failed", { error: error.message });
          reject(error);
        } else if (result) {
          Logger.info("File uploaded to Cloudinary", {
            publicId: result.public_id,
            url: result.secure_url,
          });
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error("Upload failed - no result returned"));
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload rider photo with automatic transformations
 */
export const uploadRiderPhoto = async (fileBuffer: Buffer): Promise<string> => {
  const result = await uploadToCloudinary(fileBuffer, {
    folder: "swiftmeal/riders",
    transformation: {
      width: 500,
      height: 500,
      crop: "fill",
      quality: "auto",
    },
  });

  return result.url;
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary not configured");
  }

  try {
    await cloudinary.uploader.destroy(publicId);
    Logger.info("File deleted from Cloudinary", { publicId });
  } catch (error: any) {
    Logger.error("Cloudinary deletion failed", {
      error: error.message,
      publicId,
    });
    throw error;
  }
};

/**
 * Check if Cloudinary is configured
 */
export const isCloudinaryConfigured = (): boolean => {
  return !!(cloudName && apiKey && apiSecret);
};
