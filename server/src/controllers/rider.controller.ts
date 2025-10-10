import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import Rider from "../models/Rider";
import { NotFoundError } from "../utils/AppError";
import * as riderService from "../services/rider.service";

/**
 * @desc    Update rider location
 * @route   POST /api/v1/riders/location
 * @access  Private (Rider)
 */
export const updateLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const { riderId, location, orderId } = req.body;

    const rider = await riderService.updateRiderLocation(
      riderId,
      location,
      orderId,
    );

    res.status(200).json({
      success: true,
      data: { rider },
    });
  },
);

/**
 * @desc    Get rider performance
 * @route   GET /api/v1/riders/:riderId/performance
 * @access  Private (Operations/Admin)
 */
export const getRiderPerformance = asyncHandler(
  async (req: Request, res: Response) => {
    const { riderId } = req.params;

    if (!riderId) {
      throw new NotFoundError("Rider ID is required");
    }

    const riderPerformance = await riderService.getRiderPerformance(riderId);

    res.status(200).json({
      success: true,
      data: { rider: riderPerformance },
    });
  },
);

/**
 * @desc    Upload rider photo
 * @route   POST /api/v1/riders/:riderId/photo
 * @access  Private (Admin)
 */
export const uploadPhoto = asyncHandler(async (req: Request, res: Response) => {
  const { riderId } = req.params;

  if (!req.file) {
    res.status(400).json({
      success: false,
      error: "Please upload an image file",
    });
    return;
  }

  const rider = await Rider.findById(riderId);

  if (!rider) {
    throw new NotFoundError("Rider not found");
  }

  // Upload to Cloudinary
  const { uploadRiderPhoto, isCloudinaryConfigured } = await import(
    "../config/cloudinary/cloudinary"
  );

  if (!isCloudinaryConfigured()) {
    res.status(503).json({
      success: false,
      error: "Image upload service not configured",
    });
    return;
  }

  const photoUrl = await uploadRiderPhoto(req.file.buffer);

  // Update rider with new photo URL
  rider.photo = photoUrl;
  await rider.save();

  res.status(200).json({
    success: true,
    data: { rider },
  });
});
