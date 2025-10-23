# SWIFTMEAL Application Flows Documentation

## Overview
SWIFTMEAL is a modern food delivery application with three main user roles: **Customers**, **Riders**, and **Admins**. This document outlines the complete user flows, API endpoints, and page routing for each role from start to finish.

## Table of Contents
1. [Customer Flow](#customer-flow)
2. [Rider Flow](#rider-flow)
3. [Admin Flow](#admin-flow)
4. [Authentication Flow](#authentication-flow)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Page Routing Reference](#page-routing-reference)

---

## Customer Flow

### 1. Registration & Onboarding
**Pages:** `/` → `/signup` → `/verify-email` → `/login`

**Flow Steps:**
1. **Landing Page** (`/`)
   - View hero section, features, testimonials
   - Click "Get Started" or "Sign Up"
   - No authentication required

2. **Sign Up** (`/signup`)
   - Fill registration form:
     - Full Name (required)
     - Email (required)
     - Phone (optional)
     - Password (min 6 chars, required)
     - Confirm Password (required)
   - Role automatically set to "customer"
   - **API:** `POST /api/v1/auth/register`
   - On success: Navigate to `/verify-email`

3. **Email Verification** (`/verify-email`)
   - Enter 6-digit verification code sent to email
   - Auto-focus input fields, paste support
   - **API:** `POST /api/v1/auth/verify-email`
   - Resend code option: `POST /api/v1/auth/resend-code`
   - On success: Navigate to `/login`

4. **Login** (`/login`)
   - Enter email and password
   - **API:** `POST /api/v1/auth/login`
   - On success: Redirect to dashboard/home

### 2. Order Creation & Payment
**Pages:** `/create-order` → `/payment/:orderId` → `/OrderDetails/:orderID`

**Flow Steps:**
1. **Create Order** (`/create-order`)
   - Customer Information:
     - Name, Phone, Email (pre-filled if logged in)
   - Order Items:
     - Dynamic item list (add/remove items)
     - Item name, quantity, price per item
     - Automatic total calculation
   - Delivery Address:
     - Street, Area, City (Lagos default)
     - GPS coordinates (auto-detected or manual)
   - **API:** `POST /api/v1/orders`
   - On success: Navigate to `/payment/:orderId`

2. **Payment** (`/payment/:orderId`)
   - View order summary
   - Select payment method (Card, Bank Transfer, Wallet)
   - Paystack integration for card payments
   - **APIs:**
     - `GET /api/v1/orders/:orderId` (get order details)
     - `POST /api/v1/payments` (initiate payment)
     - `GET /api/v1/payments/verify/:reference` (verify payment)
   - On success: Navigate to `/OrderDetails/:orderID`

3. **Order Details** (`/OrderDetails/:orderID`)
   - View complete order information
   - Order status, items, delivery address
   - **API:** `GET /api/v1/orders/:orderId`
   - Access: Requires authentication

### 3. Order Tracking & Management
**Pages:** `/track-order` → `/OrderDetails/:orderID` → `/DeliveryDetails/:orderID`

**Flow Steps:**
1. **Track Order** (`/track-order`) - Public Access
   - Enter order number (ORD-XXXXXXXXXXXX)
   - **API:** `GET /api/v1/track/:orderNumber`
   - No authentication required
   - On success: Show order status and details

2. **Order Details** (`/OrderDetails/:orderID`)
   - Detailed order view with status updates
   - **API:** `GET /api/v1/orders/:orderId`
   - Requires authentication

3. **Delivery Details** (`/DeliveryDetails/:orderID`)
   - Real-time delivery tracking with map
   - Rider information and location
   - **API:** `GET /api/v1/track/:orderNumber`
   - Public access (no auth required)

### 4. Post-Order Features
**Pages:** `/orders/history` → `/ratings/:orderId` → `/favorites`

**Flow Steps:**
1. **Order History** (`/orders/history`)
   - View past orders with filters (All, Completed, Cancelled)
   - Reorder functionality
   - Rate order links
   - **API:** `GET /api/v1/orders?customerId={customerId}`

2. **Rate Order** (`/ratings/:orderId`)
   - 5-star food quality rating
   - Rider rating (1-5 stars)
   - Review text (500 char limit)
   - **API:** `POST /api/v1/ratings`

3. **Favorites** (`/favorites`)
   - View saved meals/restaurants
   - Remove from favorites
   - Quick reorder functionality
   - **APIs:**
     - `GET /api/v1/favorites`
     - `POST /api/v1/favorites`
     - `DELETE /api/v1/favorites/:favoriteId`

### 5. Profile Management
**Pages:** `/profile`

**Flow Steps:**
1. **Profile Page** (`/profile`)
   - Edit personal information (name, phone, email)
   - Change password
   - Upload profile photo
   - Account settings
   - **APIs:**
     - `GET /api/v1/users/:userId`
     - `PATCH /api/v1/users/:userId`
     - `PATCH /api/v1/users/:userId/password`
     - `POST /api/v1/users/:userId/photo`
   - Logout functionality: `POST /api/v1/auth/logout`

---

## Rider Flow

### 1. Rider Registration
**Pages:** `/signup?token=...` (via admin invitation)

**Flow Steps:**
1. **Admin Invitation**
   - Admin generates invitation link
   - **API:** `POST /api/v1/auth/admin/invite`
   - Link format: `/signup?token=JWT_TOKEN`

2. **Rider Sign Up** (`/signup?token=...`)
   - Pre-filled email from invitation
   - Role automatically set to "rider"
   - Complete registration form
   - **API:** `POST /api/v1/auth/register` (with invite token)
   - Email verification same as customer flow

3. **Login** (`/login`)
   - Standard login process
   - On success: Redirect to `/rider/dashboard`

### 2. Rider Dashboard Operations
**Pages:** `/rider/dashboard` → `/rider/profile`

**Flow Steps:**
1. **Rider Dashboard** (`/rider/dashboard`)
   - **Online/Offline Status Toggle**
     - Toggle availability for orders
     - **API:** `PATCH /api/v1/riders/:riderId`
   
   - **Active Orders Display**
     - View assigned orders (ready_for_pickup, picked_up, delivering)
     - **API:** `GET /api/v1/orders?riderId={riderId}&status=active`
   
   - **Order Status Updates**
     - ready_for_pickup → picked_up
     - picked_up → delivering
     - delivering → delivered
     - **API:** `PATCH /api/v1/orders/:orderId/status`
   
   - **Location Updates**
     - Real-time GPS location sharing
     - **API:** `POST /api/v1/riders/location`
   
   - **Performance Stats**
     - Today's deliveries count
     - Today's earnings
     - Overall rating
     - Total deliveries
     - **API:** `GET /api/v1/riders/:riderId/performance`

2. **Rider Profile** (`/rider/profile`)
   - Edit rider information
   - Upload profile photo (Cloudinary)
   - Vehicle information
   - Performance statistics
   - **APIs:**
     - `GET /api/v1/riders/:riderId`
     - `PATCH /api/v1/riders/:riderId`
     - `POST /api/v1/riders/:riderId/photo`
     - `GET /api/v1/riders/:riderId/performance`

---

## Admin Flow

### 1. Admin Creation (Super Admin Only)
**Pages:** `/admin/invite`

**Flow Steps:**
1. **Admin Invite Generation** (`/admin/invite`)
   - Super admin only access
   - Enter email for new admin
   - Select role (admin, operations, support)
   - Generate secure invitation link
   - **API:** `POST /api/v1/auth/admin/invite`
   - Returns invitation link with JWT token

2. **Admin Registration** (`/signup?token=...`)
   - Pre-filled email from invitation
   - Role locked based on invitation
   - Complete registration
   - Email verification
   - Login to access admin features

### 2. Admin Dashboard Operations
**Pages:** `/admin/dashboard`

**Flow Steps:**
1. **Admin Dashboard** (`/admin/dashboard`)
   - **Analytics Overview**
     - Total Orders, Active Orders, Completed Orders
     - Cancelled Orders, Total Revenue, Active Riders
     - **APIs:**
       - `GET /api/v1/orders` (with analytics calculations)
       - `GET /api/v1/analytics/riders/performance`
   
   - **Order Management**
     - View all orders with filters (all, pending, active, completed, cancelled)
     - Search by order ID, customer name, phone
     - Update order status
     - **APIs:**
       - `GET /api/v1/orders` (filtered)
       - `PATCH /api/v1/orders/:orderId/status`
   
   - **User Management**
     - View user accounts
     - Manage user roles and permissions
   
   - **Rider Performance Monitoring**
     - View rider statistics and performance
     - **API:** `GET /api/v1/riders/:riderId/performance`

---

## Authentication Flow

### Password Recovery
**Pages:** `/forgot-password` → `/reset-password`

**Flow Steps:**
1. **Forgot Password** (`/forgot-password`)
   - Enter email address
   - **API:** `POST /api/v1/auth/forgot-password`
   - On success: Navigate to `/reset-password`

2. **Reset Password** (`/reset-password`)
   - Enter 6-digit reset code
   - Enter new password (min 6 chars)
   - Confirm new password
   - **API:** `POST /api/v1/auth/reset-password`

### Session Management
- **Token Refresh:** `POST /api/v1/auth/refresh-token` (automatic)
- **Logout:** `POST /api/v1/auth/logout` (manual)
- JWT tokens stored in httpOnly cookies
- Automatic token refresh on API calls

---

## API Endpoints Reference

### Authentication
```
POST /api/v1/auth/register          - User registration
POST /api/v1/auth/login             - User login
POST /api/v1/auth/logout            - User logout
POST /api/v1/auth/verify-email      - Email verification
POST /api/v1/auth/resend-code       - Resend verification code
POST /api/v1/auth/forgot-password   - Request password reset
POST /api/v1/auth/reset-password    - Reset password
POST /api/v1/auth/refresh-token     - Refresh access token
POST /api/v1/auth/admin/invite      - Generate admin invitation
```

### Orders
```
POST /api/v1/orders                 - Create new order
GET  /api/v1/orders                 - Get orders (with filters)
GET  /api/v1/orders/:orderId        - Get specific order
PATCH /api/v1/orders/:orderId/status - Update order status
```

### Tracking
```
GET /api/v1/track/:orderNumber      - Public order tracking
```

### Riders
```
POST /api/v1/riders/location        - Update rider location
GET  /api/v1/riders/:riderId/performance - Get rider performance
POST /api/v1/riders/:riderId/photo  - Upload rider photo
```

### Payments
```
POST /api/v1/payments               - Initiate payment
GET  /api/v1/payments/verify/:reference - Verify payment
POST /api/v1/payments/webhook       - Paystack webhook
```

### Users
```
GET  /api/v1/users/:userId          - Get user profile
PATCH /api/v1/users/:userId         - Update user profile
PATCH /api/v1/users/:userId/password - Change password
POST /api/v1/users/:userId/photo    - Upload profile photo
```

### Favorites
```
GET  /api/v1/favorites              - Get user favorites
POST /api/v1/favorites              - Add to favorites
DELETE /api/v1/favorites/:favoriteId - Remove from favorites
```

### Ratings
```
POST /api/v1/ratings                - Submit rating/review
```

### Notifications
```
GET  /api/v1/notifications          - Get notifications
PATCH /api/v1/notifications/:id/read - Mark as read
PATCH /api/v1/notifications/read-all - Mark all as read
```

### Analytics
```
GET /api/v1/analytics/delays/heatmap - Delay analytics heatmap
GET /api/v1/analytics/delays/trends  - Delay trends
GET /api/v1/analytics/riders/performance - Rider performance analytics
```

---

## Page Routing Reference

### Public Pages (No Auth Required)
```
/                    - Landing page
/track-order         - Public order tracking
/signup              - User registration
/login               - User login
/verify-email        - Email verification
/forgot-password     - Password reset request
/reset-password      - Password reset
```

### Protected Pages (Auth Required)
```
/create-order        - Create new order
/payment/:orderId    - Payment processing
/OrderDetails/:orderID - Order details
/DeliveryDetails/:orderID - Delivery tracking
/orders/history      - Order history
/profile             - User profile
/favorites           - Favorite items
/ratings/:orderId    - Rate order
```

### Admin Pages (Admin Role Required)
```
/admin/dashboard     - Admin dashboard
/admin/invite        - Generate admin invites
```

### Rider Pages (Rider Role Required)
```
/rider/dashboard     - Rider dashboard
/rider/profile       - Rider profile
```

### Route Protection
- **ProtectedRoute Component**: Wraps protected pages
- **Role-based Access**: Admin routes check for admin role
- **Authentication Check**: Redirects to `/login` if not authenticated
- **Auto-redirect**: After login, redirects to appropriate dashboard based on role

---

## Real-time Features

### WebSocket Events
- `notification` - New notification received
- `order:status` - Order status updates
- `rider:location` - Rider location updates

### Notification Types
- Order confirmations
- Delivery updates
- Rider assignments
- Payment confirmations
- System announcements

---

## Security Features

### Authentication
- JWT tokens with httpOnly cookies
- Automatic token refresh
- Secure logout (token invalidation)

### Authorization
- Role-based access control (customer, rider, support, operations, admin)
- Route-level protection
- API endpoint restrictions

### Admin Invitation System
- Secure JWT-based invitations
- 7-day token expiration
- Email and role validation
- Admin-only invite generation

### Data Validation
- Zod schema validation on all inputs
- SQL injection prevention
- XSS protection
- Rate limiting on auth endpoints

---

## Error Handling

### Client-side
- Form validation with error messages
- Toast notifications for API errors
- Loading states for async operations
- Graceful fallbacks for GPS failures

### Server-side
- Structured error responses
- Input validation middleware
- Database error handling
- Email service error handling

### Network
- Automatic retry for failed requests
- Offline detection
- API interceptor for auth errors

---

## Third-party Integrations

### Payment
- **Paystack**: Card and bank transfer payments
- Webhook handling for payment confirmations
- Secure payment verification

### File Upload
- **Cloudinary**: Image storage for profile photos
- Secure upload with authentication
- Image optimization and CDN delivery

### Maps & Location
- **Google Maps**: Delivery tracking and rider location
- GPS coordinate handling
- Real-time location updates

### Communication
- **SMS Service**: Order notifications and updates
- **Email Service**: Verification codes and notifications
- Template-based messaging

---

## Database Models

### Core Models
- **User**: Authentication and profile data
- **Order**: Order information and status
- **Rider**: Rider profile and performance
- **Payment**: Payment transactions
- **Rating**: Customer reviews and ratings
- **Favorite**: Saved items and restaurants
- **Notification**: User notifications

### Relationships
- User → Orders (one-to-many)
- Order → Rider (many-to-one)
- Order → Payment (one-to-one)
- Order → Rating (one-to-one)
- User → Favorites (one-to-many)
- User → Notifications (one-to-many)

---

## Deployment & Infrastructure

### Environment Configuration
- Separate configs for development/staging/production
- Environment variables for secrets
- Database connection management

### Monitoring
- Error logging with Winston
- Performance monitoring
- API response time tracking

### Scalability
- Rate limiting implementation
- Database query optimization
- CDN for static assets
- Horizontal scaling ready</content>
<parameter name="filePath">/home/damola/Swiftmealng/COMPREHENSIVE_FLOWS.md