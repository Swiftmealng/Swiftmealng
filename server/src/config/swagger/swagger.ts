import swaggerJsDoc from "swagger-jsdoc";
import { SwaggerDefinition } from "swagger-jsdoc";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "SWIFTMEAL API",
    version: "1.0.0",
    description:
      "Food delivery order tracking system with real-time location updates and delay analytics",
    contact: {
      name: "SWIFTMEAL Team",
      email: "support@swiftmeal.ng",
    },
    license: {
      name: "Proprietary",
      url: "https://swiftmeal.ng/license",
    },
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://swiftmealng-production.up.railway.app/api/v1'
        : `http://localhost:${process.env.PORT || 5000}/api/v1`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "JWT token stored in httpOnly cookie",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Error message",
          },
          statusCode: {
            type: "integer",
            example: 400,
          },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
          name: {
            type: "string",
            example: "John Doe",
          },
          email: {
            type: "string",
            example: "john@example.com",
          },
          phone: {
            type: "string",
            example: "+2348012345678",
          },
          role: {
            type: "string",
            enum: ["customer", "rider", "admin"],
            example: "customer",
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
      Order: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
          orderNumber: {
            type: "string",
            example: "ORD-1234567890123",
          },
          customer: {
            type: "object",
            properties: {
              customerId: { type: "string" },
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
            },
          },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                quantity: { type: "integer" },
                price: { type: "number" },
              },
            },
          },
          totalAmount: {
            type: "number",
            example: 5000,
          },
          deliveryAddress: {
            type: "object",
            properties: {
              street: { type: "string" },
              area: { type: "string" },
              city: { type: "string" },
              coordinates: {
                type: "object",
                properties: {
                  lat: { type: "number" },
                  lng: { type: "number" },
                },
              },
            },
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "confirmed",
              "preparing",
              "ready",
              "picked_up",
              "in_transit",
              "delivered",
            ],
            example: "pending",
          },
          estimatedDeliveryTime: {
            type: "string",
            format: "date-time",
          },
          actualDeliveryTime: {
            type: "string",
            format: "date-time",
          },
          isDelayed: {
            type: "boolean",
            example: false,
          },
          delayDuration: {
            type: "number",
            example: 0,
          },
          tracking: {
            type: "array",
            items: {
              type: "object",
              properties: {
                status: { type: "string" },
                timestamp: { type: "string", format: "date-time" },
                location: {
                  type: "object",
                  properties: {
                    coordinates: {
                      type: "array",
                      items: { type: "number" },
                    },
                  },
                },
              },
            },
          },
          createdAt: {
            type: "string",
            format: "date-time",
          },
        },
      },
    },
  },
  tags: [
    {
      name: "Authentication",
      description: "User authentication and authorization endpoints",
    },
    {
      name: "Orders",
      description: "Order management and tracking endpoints",
    },
    {
      name: "Tracking",
      description:
        "Public order tracking endpoints (no authentication required)",
    },
    {
      name: "Riders",
      description: "Rider management and location tracking endpoints",
    },
    {
      name: "Analytics",
      description: "Delay analytics and reporting endpoints",
    },
    {
      name: "Notifications",
      description: "Notification management endpoints (SMS/Email)",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/models/*.ts"],
};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;
