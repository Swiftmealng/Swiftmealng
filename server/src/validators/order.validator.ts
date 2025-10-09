import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string({ message: 'Customer ID is required' }),
    customerName: z.string({ message: 'Customer name is required' }),
    customerPhone: z.string({ message: 'Customer phone is required' }),
    items: z
      .array(
        z.object({
          name: z.string({ message: 'Item name is required' }),
          quantity: z
            .number({ message: 'Quantity is required' })
            .int()
            .positive('Quantity must be positive'),
          price: z
            .number({ message: 'Price is required' })
            .positive('Price must be positive')
        })
      )
      .min(1, 'At least one item is required'),
    deliveryAddress: z.object({
      street: z.string({ message: 'Street is required' }),
      area: z.string({ message: 'Area is required' }),
      city: z.string({ message: 'City is required' }),
      coordinates: z
        .array(z.number())
        .length(2, 'Coordinates must be [longitude, latitude]')
    })
  })
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string()
  }),
  body: z.object({
    status: z.enum([
      'placed',
      'confirmed',
      'preparing',
      'ready',
      'out_for_delivery',
      'delivered',
      'cancelled'
    ]),
    location: z
      .object({
        lat: z.number(),
        lng: z.number()
      })
      .optional()
  })
});

export const getOrdersSchema = z.object({
  query: z.object({
    status: z.string().optional(),
    area: z.string().optional(),
    isDelayed: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional()
  })
});
