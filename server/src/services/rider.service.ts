import Rider from "../models/Rider";
import Order from "../models/Order";
import { NotFoundError } from "../utils/AppError";
import { emitLocationUpdate } from "../config/socket/socket";
import Logger from "../utils/logger";

/**
 * Update rider location and emit real-time update
 */
export const updateRiderLocation = async (
  riderId: string,
  location: { lat: number; lng: number },
  orderId?: string,
) => {
  const rider = await Rider.findById(riderId);

  if (!rider) {
    throw new NotFoundError("Rider not found");
  }

  // Update rider's current location
  rider.currentLocation = {
    type: "Point",
    coordinates: [location.lng, location.lat], // MongoDB uses [lng, lat]
  };
  await rider.save();

  // If orderId is provided, add tracking event to order
  if (orderId) {
    const order = await Order.findById(orderId);

    if (order) {
      order.trackingEvents.push({
        status: "location_update",
        timestamp: new Date(),
        location: { lat: location.lat, lng: location.lng },
        note: "Rider location updated",
      });
      await order.save();

      // Emit real-time location update to tracking clients
      emitLocationUpdate(order.orderNumber, {
        lat: location.lat,
        lng: location.lng,
        timestamp: new Date(),
      });

      Logger.info("Location update emitted", {
        riderId,
        orderId,
        orderNumber: order.orderNumber,
        location,
      });
    }
  }

  return rider;
};

/**
 * Get rider performance metrics
 */
export const getRiderPerformance = async (riderId: string) => {
  const rider = await Rider.findById(riderId);

  if (!rider) {
    throw new NotFoundError("Rider not found");
  }

  return {
    name: rider.name,
    totalDeliveries: rider.totalDeliveries,
    onTimeDeliveries: rider.onTimeDeliveries,
    lateDeliveries: rider.lateDeliveries,
    onTimePercentage: rider.onTimePercentage,
    averageDeliveryTime: rider.averageDeliveryTime,
    rating: rider.rating,
  };
};
