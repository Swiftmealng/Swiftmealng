# SWIFTMEAL Backend Server

> Order Tracking System API - Built with Node.js, TypeScript, and Express

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Guidelines](#development-guidelines)
- [API Documentation](#api-documentation)
- [Testing](#testing)

---

## Overview

### What This Does (Non-Technical)
This is the backend server for SWIFTMEAL, a food delivery tracking system. Think of it as the brain behind the delivery app - it:
- Keeps track of all orders and their status
- Monitors where delivery riders are in real-time
- Sends notifications to customers about their orders
- Provides data for support teams to help customers
- Analyzes delivery performance to improve service

### Technical Summary
RESTful API backend with real-time WebSocket support for order tracking. Built following MVC architecture with TypeScript for type safety and Express.js for routing. Includes JWT authentication, role-based access control, real-time location tracking, SMS notifications, and analytics dashboard endpoints.

**Project Timeline:** 4 weeks
**Base URL (Dev):** http://localhost:5000/api/v1
**Documentation:** http://localhost:5000/api-docs

---

## Architecture

### Backend Architecture Pattern: MVC + Service Layer

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│                  (React Apps / HTTP Clients)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Express.js + TypeScript REST API               │ │
│  │                                                         │ │
│  │  ┌────────┐   ┌────────────┐   ┌────────────┐        │ │
│  │  │ Routes │──▶│ Middleware │──▶│Controllers │        │ │
│  │  └────────┘   └────────────┘   └─────┬──────┘        │ │
│  │   • auth        • auth.middleware      │              │ │
│  │   • orders      • validation           │              │ │
│  │   • riders      • error.middleware     ▼              │ │
│  │   • analytics   • upload.middleware  ┌────────┐       │ │
│  │   • track                            │Services│       │ │
│  │                                      └────┬───┘       │ │
│  │                                           │            │ │
│  │                                           ▼            │ │
│  │                                      ┌────────┐       │ │
│  │                                      │ Models │       │ │
│  │                                      └────────┘       │ │
│  │                                       • User          │ │
│  │                                       • Order         │ │
│  │                                       • Rider         │ │
│  │                                       • Notification  │ │
│  │                                       • DelayAnalytics│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Socket.io (Real-time WebSockets)             │ │
│  │         Namespaces: /tracking, /dashboard              │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 DATA & SERVICES LAYER                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ MongoDB  │  │Cloudinary│  │  Twilio  │  │  Google  │   │
│  │(Mongoose)│  │ (Images) │  │  (SMS)   │  │Maps API  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│   Database      File Upload   Notifications  Geolocation   │
└─────────────────────────────────────────────────────────────┘
```

### Current Project Structure Map

```
server/src/
├── routes/           → Define endpoints (auth, orders, riders, analytics, track)
├── middleware/       → Auth, validation, error handling, file upload
├── controllers/      → Handle requests (auth, orders, riders, analytics, track)
├── services/         → Business logic (auth, orders, riders, analytics, notification)
├── models/           → Database schemas (User, Order, Rider, Notification, DelayAnalytics)
├── validators/       → Zod schemas (auth, order, rider)
├── utils/            → Helpers (AppError, asyncHandler, generateToken, logger)
├── config/           → Configuration (database, logger, swagger)
└── types/            → TypeScript type definitions
```

### Request Flow

```
1. HTTP Request
   ↓
2. Routes (routes/*.routes.ts)
   ↓
3. Middleware (middleware/*.middleware.ts)
   - Authentication (JWT verification)
   - Validation (Zod schemas)
   - File upload (Multer)
   ↓
4. Controllers (controllers/*.controller.ts)
   - Extract request data
   - Call service layer
   ↓
5. Services (services/*.service.ts)
   - Business logic
   - Database operations
   - External API calls
   ↓
6. Models (models/*.ts)
   - MongoDB via Mongoose
   ↓
7. Response
   - Success: { success: true, data: {...} }
   - Error: { success: false, error: "..." }
```

### Layer Responsibilities

**Routes (`/routes`)**
- Define API endpoints and HTTP methods
- Apply middleware (authentication, validation)
- Route requests to appropriate controllers

**Controllers (`/controllers`)**
- Handle HTTP request/response
- Extract data from request
- Call service layer
- Format and send response

**Services (`/services`)**
- Business logic implementation
- Database operations
- External API calls (Twilio, Cloudinary, Google Maps)
- Data transformation

**Models (`/models`)**
- Database schema definitions (Mongoose)
- Data validation rules
- Relationships between entities

**Middleware (`/middleware`)**
- Authentication (JWT verification)
- Authorization (role-based access)
- Request validation (Zod schemas)
- Error handling
- Logging

**Validators (`/validators`)**
- Zod schemas for request validation
- Type-safe input validation
- Automatic error responses

**Utils (`/utils`)**
- Helper functions
- Custom error classes
- Token generation
- Logger configuration

---

## Technology Stack

### Core Technologies

**Node.js 20.x LTS**
- Runtime environment
- Why: Stable, performant, large ecosystem
- Usage: Executes all backend JavaScript code

**TypeScript 5.x**
- Programming language
- Why: Type safety, better IDE support, catches errors early
- Usage: All application code written in TypeScript

**Express.js 4.x**
- Web framework
- Why: Minimal, flexible, industry standard
- Usage: HTTP server, routing, middleware

**MongoDB 7.x + Mongoose 8.x**
- Database + ODM (Object Document Mapper)
- Why: Flexible schema, geospatial queries, scales well
- Usage: Store users, orders, riders, analytics data

### Real-Time Communication

**Socket.io 4.x**
- WebSocket library
- Why: Real-time bidirectional communication
- Usage: Live order tracking, dashboard updates, location streaming

### Authentication & Security

**jsonwebtoken 9.x**
- JWT implementation
- Why: Stateless authentication, secure
- Usage: User authentication, session management

**bcryptjs**
- Password hashing
- Why: Secure password storage
- Usage: Hash passwords before saving to database

**helmet**
- Security middleware
- Why: Sets security HTTP headers
- Usage: Protect against common vulnerabilities

**express-rate-limit**
- Rate limiting
- Why: Prevent abuse and DDoS
- Usage: Limit API requests per IP

### Validation & Type Safety

**Zod 3.x**
- Schema validation
- Why: TypeScript-first, runtime validation
- Usage: Validate all incoming request data

### Logging

**Winston 3.x**
- Logger library
- Why: Flexible, multiple transports, production-ready
- Usage: Application logging (info, error, debug)

**Morgan**
- HTTP request logger
- Why: Simple HTTP logging middleware
- Usage: Log all incoming HTTP requests

### External Services Integration

**Twilio SDK**
- SMS service
- Why: Reliable SMS delivery
- Usage: Send order notifications and delay alerts

**Cloudinary SDK**
- Image hosting
- Why: CDN, image optimization
- Usage: Store and serve rider photos

**Google Maps API**
- Mapping and geolocation
- Why: Accurate distance/time calculations
- Usage: Route optimization, delivery estimates

**Multer**
- File upload middleware
- Why: Handle multipart/form-data
- Usage: Process rider photo uploads

### Documentation

**Swagger/OpenAPI 3.x**
- API documentation
- Why: Interactive docs, standard format
- Usage: Auto-generate API documentation from code

### Testing

**Jest**
- Testing framework
- Why: Fast, easy to use, great TypeScript support
- Usage: Unit and integration tests

**Supertest**
- HTTP testing
- Why: Test Express routes easily
- Usage: API endpoint testing

### Code Quality

**ESLint**
- Linting tool
- Why: Enforce code standards
- Usage: Catch errors and style issues

**Prettier**
- Code formatter
- Why: Consistent code style
- Usage: Auto-format code on save

### Process Management (Production)

**PM2 5.x**
- Process manager
- Why: Keep app running, auto-restart, load balancing
- Usage: Production deployment

---

## Project Structure

```
server/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database/        # MongoDB connection
│   │   ├── logger/          # Winston setup
│   │   └── swagger/         # API documentation config
│   │
│   ├── controllers/         # Route handlers (HTTP layer)
│   │   ├── auth.controller.ts
│   │   ├── order.controller.ts
│   │   ├── rider.controller.ts
│   │   ├── analytics.controller.ts
│   │   └── track.controller.ts
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── error.middleware.ts     # Global error handler
│   │   ├── validation.middleware.ts # Zod validation
│   │   └── upload.middleware.ts    # Multer config
│   │
│   ├── models/              # Mongoose schemas
│   │   ├── User.ts          # Users (auth + roles)
│   │   ├── Rider.ts         # Rider info + location
│   │   ├── Order.ts         # Orders + tracking
│   │   ├── Notification.ts  # SMS/Email logs
│   │   └── DelayAnalytics.ts # Pre-aggregated delay data
│   │
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── order.routes.ts
│   │   ├── rider.routes.ts
│   │   ├── analytics.routes.ts
│   │   └── track.routes.ts
│   │
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── order.service.ts
│   │   ├── rider.service.ts
│   │   ├── analytics.service.ts
│   │   └── notification.service.ts
│   │
│   ├── validators/          # Zod schemas
│   │   ├── auth.validator.ts
│   │   ├── order.validator.ts
│   │   └── rider.validator.ts
│   │
│   ├── utils/               # Helper functions
│   │   ├── AppError.ts      # Custom error class
│   │   ├── asyncHandler.ts  # Async error wrapper
│   │   ├── generateToken.ts # JWT utilities
│   │   └── logger.ts        # Logger instance
│   │
│   ├── types/               # TypeScript types/interfaces
│   │
│   ├── tests/               # Test files
│   │
│   ├── app.ts               # Express app setup
│   └── server.ts            # Entry point
│
├── logs/                    # Log files (gitignored)
├── dist/                    # Compiled JS (gitignored)
├── node_modules/            # Dependencies (gitignored)
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
├── tsconfig.json            # TypeScript configuration
├── eslintrc.json            # ESLint rules
├── .prettierrc              # Prettier config
├── jest.config.js           # Jest configuration
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

---

## Getting Started

### Prerequisites
- Node.js 20.x or higher
- MongoDB 7.x (local or Atlas)
- npm or yarn package manager

### Installation

1. **Navigate to server directory**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/swiftmeal

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Twilio (optional for dev)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Cloudinary (optional for dev)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google Maps (optional for dev)
GOOGLE_MAPS_API_KEY=

# Client URL
CLIENT_URL=http://localhost:3000
```

4. **Start development server**
```bash
npm run dev
```

Server will start at `http://localhost:5000`

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production build
npm test             # Run tests with coverage
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code for errors
npm run lint:fix     # Fix linting errors automatically
npm run format       # Format code with Prettier
```

---

## Development Guidelines

### Coding Standards

**TypeScript Strict Mode**
- All TypeScript strict checks enabled
- No `any` types allowed (use `unknown` if needed)
- Proper typing for all functions and variables

**No Console.log**
- Use Winston logger instead
- `Logger.info()`, `Logger.error()`, `Logger.warn()`, `Logger.debug()`

**Error Handling**
- Always use `asyncHandler` wrapper for async routes
- Throw `AppError` for operational errors
- Never use try-catch in controllers (middleware handles it)

**Validation**
- All request bodies validated with Zod schemas
- Validation happens in middleware before controller

**Naming Conventions**
- Files: kebab-case (`auth.controller.ts`)
- Classes: PascalCase (`AppError`)
- Functions/variables: camelCase (`getUserById`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### Git Workflow

**Branch Naming**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `chore/task-name` - Maintenance

**Commit Messages**
- Follow conventional commits
- Use `npm run commit` for guided commits
- Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`

**Example:**
```bash
feat: add rider location tracking endpoint
fix: resolve JWT token expiration issue
chore: update dependencies
```

---

## API Documentation

### Access Swagger UI
```
http://localhost:5000/api-docs
```

### Base Endpoints

**Authentication**
- `POST /api/v1/auth/login` - Admin/Support login
- `POST /api/v1/auth/logout` - Logout

**Public Tracking**
- `GET /api/v1/track/:orderNumber` - Track order (no auth)

**Orders** (Auth Required)
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get all orders (with filters)
- `GET /api/v1/orders/:orderId` - Get single order
- `PATCH /api/v1/orders/:orderId/status` - Update order status

**Riders** (Auth Required)
- `POST /api/v1/riders/location` - Update rider location
- `GET /api/v1/riders/:riderId/performance` - Get rider metrics
- `POST /api/v1/riders/:riderId/photo` - Upload rider photo

**Analytics** (Operations/Admin Only)
- `GET /api/v1/analytics/delays/heatmap` - Delay heatmap data
- `GET /api/v1/analytics/delays/trends` - Delay trends
- `GET /api/v1/analytics/riders/performance` - Rider comparison

### WebSocket Namespaces

**Customer Tracking:** `/tracking`
- Join: `join-tracking` with `{ orderNumber }`
- Receive: `location-update`, `status-update`, `delay-alert`

**Dashboard:** `/dashboard`
- Join: `join-dashboard` with `{ userId }`
- Receive: `order-update`, `new-order`, `delay-alert`

---

## Testing

### Run Tests
```bash
npm test              # Run all tests with coverage
npm run test:watch    # Watch mode for development
```

### Test Structure
```
src/tests/
├── unit/             # Unit tests (services, utils)
├── integration/      # API endpoint tests
└── __mocks__/        # Mock data and functions
```

### Coverage Target
- Minimum 70% for business logic
- 100% for critical paths (auth, payments)

### Writing Tests
```typescript
// Example: Testing order service
describe('OrderService', () => {
  it('should create order with valid data', async () => {
    const orderData = { /* ... */ };
    const order = await OrderService.createOrder(orderData);
    expect(order).toHaveProperty('orderNumber');
  });
});
```

---

## Database Collections

### Users
- Authentication and authorization
- Roles: customer, support, operations, admin
- Fields: email, password (hashed), name, role, createdAt

### Riders
- Rider information and performance
- Fields: name, phone, photo, currentLocation, totalDeliveries, onTimePercentage, rating
- Index: 2dsphere on currentLocation for geospatial queries

### Orders
- Order details and tracking
- Embedded: customer info, rider info, tracking events
- Denormalized for performance
- Fields: orderNumber, status, items, deliveryAddress, estimatedDeliveryTime, isDelayed
- Indexes: orderNumber (unique), status, area, coordinates (2dsphere)

### Notifications
- SMS and email logs
- Fields: orderId, type, channel, status, sentAt, deliveredAt

### DelayAnalytics
- Pre-aggregated delay statistics
- Fields: date, area, coordinates, delayCount, averageDelayMinutes
- Used for heatmap visualization

---

## Security Features

**JWT Authentication**
- Token stored in httpOnly cookie
- 24-hour expiration
- Secure flag in production

**Rate Limiting**
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

**Input Validation**
- All requests validated with Zod
- XSS protection via helmet
- SQL injection N/A (NoSQL database)

**Password Security**
- bcrypt hashing with 12 salt rounds
- Never stored in plain text

**CORS**
- Configured for specific client origins
- Credentials allowed for httpOnly cookies

---

## Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure MongoDB Atlas connection
- [ ] Set up Twilio account
- [ ] Configure Cloudinary
- [ ] Get Google Maps API key
- [ ] Set up PM2 process manager
- [ ] Configure Nginx reverse proxy
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up monitoring and alerts

### Build for Production
```bash
npm run build
node dist/server.js
```

### Using PM2
```bash
pm2 start dist/server.js --name swiftmeal
pm2 save
pm2 startup
```

---

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | development |
| `PORT` | Server port | Yes | 5000 |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret for JWT signing | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | Yes | 24h |
| `TWILIO_ACCOUNT_SID` | Twilio account ID | No | - |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | No | - |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | No | - |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No | - |
| `CLOUDINARY_API_SECRET` | Cloudinary secret | No | - |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | No | - |
| `CLIENT_URL` | Frontend URL (CORS) | Yes | http://localhost:3000 |

---

## Troubleshooting

**Cannot connect to MongoDB**
- Check MongoDB is running: `mongod --version`
- Verify connection string in `.env`
- For Atlas: Check network access whitelist

**Port already in use**
- Change PORT in `.env`
- Or kill process: `lsof -ti:5000 | xargs kill -9`

**TypeScript errors**
- Run `npm run lint:fix`
- Check `tsconfig.json` configuration
- Ensure all dependencies have type definitions

**Tests failing**
- Check MongoDB test connection
- Clear test database between runs
- Verify environment variables for tests

---

## Performance Optimization

**Database**
- Indexes on frequently queried fields
- Denormalize for read-heavy operations
- Use aggregation pipelines for analytics

**Caching**
- Redis for session storage (future)
- Cache analytics data (future)

**API**
- Pagination for list endpoints
- Field selection to reduce payload
- Compression middleware

---

## License

Copyright (c) 2025 Swiftmeal Team. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use is strictly prohibited.

---

## Support

For questions or issues, contact the development team or create an issue in the repository.

**Project Timeline:** 4 weeks (October 2025)
**Current Phase:** Week 1 - Foundation Setup
