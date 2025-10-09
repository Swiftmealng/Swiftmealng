import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import DelayAnalytics from '../models/DelayAnalytics';
import Rider from '../models/Rider';

/**
 * @desc    Get delay heatmap data
 * @route   GET /api/v1/analytics/delays/heatmap
 * @access  Private (Operations/Admin)
 */
export const getDelayHeatmap = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate, area } = req.query;

    const filter: any = {};

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    if (area) {
      filter.area = area;
    }

    const heatmapData = await DelayAnalytics.find(filter)
      .select('area coordinates delayedOrders averageDelayMinutes')
      .lean();

    const formattedData = heatmapData.map(item => ({
      area: item.area,
      lat: item.coordinates.coordinates[1],
      lng: item.coordinates.coordinates[0],
      delayCount: item.delayedOrders,
      averageDelayMinutes: item.averageDelayMinutes
    }));

    res.status(200).json({
      success: true,
      data: { heatmapData: formattedData }
    });
  }
);

/**
 * @desc    Get delay trends over time
 * @route   GET /api/v1/analytics/delays/trends
 * @access  Private (Operations/Admin)
 */
export const getDelayTrends = asyncHandler(
  async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    const filter: any = {};

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    }

    const trends = await DelayAnalytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalOrders: { $sum: '$totalOrders' },
          delayedOrders: { $sum: '$delayedOrders' }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalOrders: 1,
          delayedOrders: 1,
          delayPercentage: {
            $multiply: [
              { $divide: ['$delayedOrders', '$totalOrders'] },
              100
            ]
          }
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: { trends }
    });
  }
);

/**
 * @desc    Get all riders performance comparison
 * @route   GET /api/v1/analytics/riders/performance
 * @access  Private (Operations/Admin)
 */
export const getRidersPerformance = asyncHandler(
  async (_req: Request, res: Response) => {
    const riders = await Rider.find()
      .select('name onTimePercentage totalDeliveries averageDeliveryTime rating')
      .sort({ onTimePercentage: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: { riders }
    });
  }
);
