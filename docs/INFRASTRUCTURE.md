/**
 * Infrastructure and Configuration Documentation
 * 
 * This document provides an overview of the infrastructure and configuration layer
 * for the AshityShop E-Commerce application.
 */

# AshityShop Infrastructure & Configuration Layer

## Overview

This infrastructure layer provides production-ready configuration, services, and utilities for the AshityShop E-Commerce platform built with Node.js, Express.js, MongoDB, and Firebase.

## Project Structure

```
src/
├── config/                  # Configuration modules
│   ├── env.config.ts       # Environment variables management
│   ├── database.config.ts  # MongoDB/Mongoose configuration
│   ├── cloudinary.config.ts # Image hosting configuration
│   ├── firebase.config.ts  # Firebase Admin SDK initialization
│   ├── jwt.config.ts       # JWT token configuration
│   └── index.ts            # Config exports
│
├── services/
│   ├── CloudinaryService.ts    # Image upload and management
│   ├── FirebaseService.ts      # FCM push notifications
│   ├── NotificationService.ts  # Notification system with database integration
│   └── ...
│
├── database/
│   ├── models/
│   │   ├── UserDevice.ts       # FCM token management
│   │   ├── Notification.ts     # Notification storage
│   │   └── ...
│   └── ...
│
├── utils/                   # Utility modules
│   ├── logger.util.ts       # Centralized logging
│   ├── validation.util.ts   # Input validation helpers
│   ├── fileUpload.util.ts   # File upload utilities
│   ├── jwt.util.ts          # JWT token utilities
│   ├── error.util.ts        # Error handling and responses
│   ├── constants.util.ts    # Application constants
│   ├── deviceToken.util.ts  # FCM device token management
│   ├── pagination.util.ts   # Pagination helpers
│   └── index.ts             # Utility exports
│
└── ...
```

## Configuration Modules

### 1. Environment Configuration (`env.config.ts`)

Manages all environment variables with validation.

**Features:**
- Type-safe environment variable access
- Automatic validation on initialization
- Support for default values
- Organized configuration structure

**Usage:**
```typescript
import { envConfig } from './config';

console.log(envConfig.app.port);
console.log(envConfig.database.mongodbUri);
```

### 2. Database Configuration (`database.config.ts`)

Handles MongoDB connection setup and lifecycle management.

**Features:**
- Automatic connection pooling
- Connection event handling
- Graceful disconnect
- Singleton pattern

**Usage:**
```typescript
import databaseConfig from './config/database.config';

// Initialize on app startup
await databaseConfig.initialize();

// Check connection status
const connected = databaseConfig.isConnectedToDatabase();

// Disconnect on app shutdown
await databaseConfig.disconnect();
```

### 3. Cloudinary Configuration (`cloudinary.config.ts`)

Sets up Cloudinary for image hosting and management.

**Features:**
- Secure API configuration
- Singleton pattern
- Easy instance access

**Usage:**
```typescript
import cloudinaryConfig from './config/cloudinary.config';

cloudinaryConfig.initialize();
const cloudinary = cloudinaryConfig.getInstance();
```

### 4. Firebase Configuration (`firebase.config.ts`)

Initializes Firebase Admin SDK for push notifications.

**Features:**
- Service account authentication
- Firebase Messaging instance
- Error handling

**Usage:**
```typescript
import firebaseConfig from './config/firebase.config';

firebaseConfig.initialize();
const messaging = firebaseConfig.getMessaging();
```

### 5. JWT Configuration (`jwt.config.ts`)

Manages JWT token configuration and secret validation.

**Features:**
- Separate access and refresh token configs
- Secret validation
- Expiration time management

**Usage:**
```typescript
import jwtConfig from './config/jwt.config';

const { accessToken, refreshToken } = jwtConfig.getConfig();
```

## Services

### CloudinaryService

Handles image uploads, deletion, and transformation.

**Methods:**
- `uploadImage()` - Upload single image
- `uploadProductImage()` - Upload product image
- `uploadCategoryImage()` - Upload category image
- `uploadUserProfileImage()` - Upload user profile
- `uploadBannerImage()` - Upload banner
- `uploadMultipleImages()` - Batch upload
- `deleteImage()` - Delete by publicId
- `deleteMultipleImages()` - Batch delete
- `getTransformedUrl()` - Get transformation URL
- `getResizedImageUrl()` - Get resized URL
- `getThumbnailUrl()` - Get thumbnail

**Usage:**
```typescript
import CloudinaryService from './services/CloudinaryService';

const result = await CloudinaryService.uploadProductImage(filePath, productId);
// Returns: { publicId, secureUrl, format, size, width, height }

const url = CloudinaryService.getThumbnailUrl(publicId, 200);

await CloudinaryService.deleteImage(publicId);
```

### FirebaseService

Sends push notifications via Firebase Cloud Messaging.

**Methods:**
- `sendToDevice()` - Send to single device
- `sendToMultipleDevices()` - Send to multiple devices
- `sendToTopic()` - Send to topic
- `subscribeToTopic()` - Subscribe tokens to topic
- `unsubscribeFromTopic()` - Unsubscribe from topic
- `sendWithOptions()` - Send with custom options

**Usage:**
```typescript
import FirebaseService from './services/FirebaseService';

// Send to single device
await FirebaseService.sendToDevice(fcmToken, {
  title: 'Order Status',
  body: 'Your order has been shipped',
  data: { orderId: '123' }
});

// Send to multiple devices
const result = await FirebaseService.sendToMultipleDevices(fcmTokens, {
  title: 'Flash Sale',
  body: '50% off on electronics'
});
```

### NotificationService

Complete notification system with database integration.

**Methods:**
- `createAndSendNotification()` - Save and send notification
- `sendPushNotification()` - Send push to user's devices
- `sendOrderStatusNotification()` - Send order updates
- `sendPromotionalNotification()` - Batch promotional notifications
- `getUserNotifications()` - Fetch user notifications
- `markAsRead()` - Mark single notification as read
- `markAllAsRead()` - Mark all as read
- `deleteNotification()` - Delete notification
- `clearOldNotifications()` - Cleanup old records

**Usage:**
```typescript
import { notificationService } from './services/NotificationService';

// Send notification with both database save and push
await notificationService.createAndSendNotification({
  userId: new ObjectId('...'),
  title: 'Order Confirmed',
  message: 'Your order has been confirmed',
  type: NotificationType.ORDER,
  metadata: { orderId: '...' },
  sendPush: true,
  sendInApp: true
});

// Send order status update
await notificationService.sendOrderStatusNotification(
  userId,
  'ORD-12345',
  'DELIVERED',
  orderId
);

// Get user notifications
const { notifications, unreadCount } = await notificationService.getUserNotifications(
  userId,
  limit: 20,
  skip: 0
);
```

## Models

### UserDevice

Manages FCM tokens for push notifications.

**Fields:**
- `userId` (ObjectId) - Reference to User
- `fcmToken` (String) - Firebase Cloud Messaging token
- `deviceType` (Enum: android, web, ios)
- `isActive` (Boolean) - Active status
- `createdAt` (Date)
- `updatedAt` (Date)

**Usage:**
```typescript
import UserDeviceModel from './database/models/UserDevice';

// Register new device
const device = await UserDeviceModel.create({
  userId,
  fcmToken,
  deviceType: 'web',
  isActive: true
});

// Get active devices for user
const devices = await UserDeviceModel.find({
  userId,
  isActive: true
});
```

### Notification

Stores all notifications in the database.

**Fields:**
- `userId` (ObjectId) - User who receives notification
- `title` (String) - Notification title
- `message` (String) - Notification body
- `type` (Enum) - Notification type
- `isRead` (Boolean) - Read status
- `metadata` (Mixed) - Additional data
- `createdAt` (Date)

**Notification Types:**
- ORDER_CREATED, ORDER_CONFIRMED, ORDER_PREPARING, ORDER_PACKED
- ORDER_ASSIGNED, ORDER_OUT_FOR_DELIVERY, ORDER_DELIVERED, ORDER_CANCELLED
- SYSTEM

## Utility Modules

### Logger (`logger.util.ts`)

Centralized logging with color-coded console output.

**Methods:**
- `debug()` - Debug logs
- `info()` - Info logs
- `warn()` - Warning logs
- `error()` - Error logs

**Usage:**
```typescript
import logger from './utils/logger.util';

logger.info('Server started', { port: 5000 });
logger.error('Database error', error);
```

### Validation (`validation.util.ts`)

Common validation functions for user input.

**Functions:**
- `isValidEmail()` - Email validation
- `isValidPhone()` - Phone validation
- `isValidPrice()` - Price validation
- `isStrongPassword()` - Password strength check
- `isValidFCMToken()` - FCM token validation
- `isValidObjectId()` - MongoDB ObjectId validation
- And 10+ more validators

**Usage:**
```typescript
import { isValidEmail, isStrongPassword } from './utils/validation.util';

if (!isValidEmail(email)) throw new Error('Invalid email');

const { valid, errors } = isStrongPassword(password);
```

### File Upload (`fileUpload.util.ts`)

File upload validation and utilities.

**Functions:**
- `validateUploadedFile()` - Validate file
- `getFileExtension()` - Extract extension
- `generateUniqueFilename()` - Generate unique name
- `getFileSizeInMB()` - Convert size
- `sanitizeFilename()` - Sanitize filename

**Usage:**
```typescript
import { validateUploadedFile, generateUniqueFilename } from './utils/fileUpload.util';

const validation = validateUploadedFile(file);
if (!validation.valid) throw new Error(validation.error);

const filename = generateUniqueFilename(originalName);
```

### JWT (`jwt.util.ts`)

JWT token generation and verification utilities.

**Functions:**
- `generateAccessToken()` - Create access token
- `generateRefreshToken()` - Create refresh token
- `generateTokenPair()` - Create both tokens
- `verifyAccessToken()` - Verify access token
- `verifyRefreshToken()` - Verify refresh token
- `isTokenExpired()` - Check expiration
- `extractUserIdFromToken()` - Extract userId
- `extractRoleFromToken()` - Extract role

**Usage:**
```typescript
import { generateTokenPair, verifyAccessToken } from './utils/jwt.util';

const { accessToken, refreshToken } = generateTokenPair({
  userId: '...',
  email: 'user@example.com',
  role: 'user'
});

const payload = verifyAccessToken(token);
```

### Error Handling (`error.util.ts`)

Standardized error handling and responses.

**Error Codes:**
- BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND
- CONFLICT, VALIDATION_ERROR, INTERNAL_SERVER_ERROR
- SERVICE_UNAVAILABLE, RATE_LIMIT_EXCEEDED

**Usage:**
```typescript
import { 
  createErrorResponse, 
  createSuccessResponse,
  throwNotFound 
} from './utils/error.util';

if (!user) throwNotFound('User');

res.status(200).json(createSuccessResponse(data, 'Success'));
res.status(400).json(createErrorResponse(ErrorCode.BAD_REQUEST, 'Invalid input'));
```

### Constants (`constants.util.ts`)

Application-wide constants.

**Exports:**
- PAGINATION - Default pagination settings
- CACHE_TTL - Cache expiration times
- FILE_SIZE_LIMITS - Max file sizes
- API_ENDPOINTS - API paths
- PASSWORD_REQUIREMENTS - Password rules
- And 10+ more constant groups

**Usage:**
```typescript
import { PAGINATION, constants } from './utils/constants.util';

const { page = PAGINATION.DEFAULT_PAGE } = req.query;
const MAX_SIZE = constants.FILE_SIZE_LIMITS.IMAGE;
```

### Device Token (`deviceToken.util.ts`)

FCM device token management utilities.

**Functions:**
- `registerDevice()` - Register new device
- `unregisterDevice()` - Unregister device
- `getUserFCMTokens()` - Get user tokens
- `getUserDevices()` - Get all devices
- `deleteDevice()` - Delete device
- `clearInactiveDevices()` - Remove inactive
- `cleanupExpiredDevices()` - Cleanup old devices
- `getDeviceStatistics()` - Device stats

**Usage:**
```typescript
import { registerDevice, getUserFCMTokens } from './utils/deviceToken.util';

await registerDevice({
  userId,
  fcmToken: token,
  deviceType: 'web'
});

const tokens = await getUserFCMTokens(userId);
```

### Pagination (`pagination.util.ts`)

Pagination helper functions.

**Functions:**
- `validatePaginationParams()` - Validate page/limit
- `calculateSkip()` - Calculate skip value
- `getPaginationQuery()` - Get query object
- `createPaginatedResponse()` - Format response
- `formatPaginationResponse()` - Format with meta

**Usage:**
```typescript
import { getPaginationQuery, createPaginatedResponse } from './utils/pagination.util';

const { skip, limit, page } = getPaginationQuery({ page: 1, limit: 20 });
const items = await Model.find().skip(skip).limit(limit);
const response = createPaginatedResponse(items, page, limit, totalCount);
```

## Best Practices

### 1. Configuration Management
- All secrets stored in `.env` file (never commit)
- Use `.env.example` as template
- Validate all required variables on startup

### 2. Error Handling
- Use `AppError` for custom errors
- Return standardized error responses
- Log all errors with context

### 3. Logging
- Use logger for all console output
- Log at appropriate levels (debug, info, warn, error)
- Include relevant context data

### 4. Validation
- Validate all user inputs
- Use validation utilities
- Return meaningful error messages

### 5. File Uploads
- Validate file size and type
- Generate unique filenames
- Store URLs and publicIds only

### 6. Database
- Use connection pooling
- Handle connection events
- Implement proper error handling

### 7. Notifications
- Always handle failures gracefully
- Log notification events
- Clean up old/inactive tokens

## Initialization Checklist

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Update .env with actual values
   ```

2. **On Application Startup**
   ```typescript
   // Initialize configs
   await databaseConfig.initialize();
   cloudinaryConfig.initialize();
   firebaseConfig.initialize();
   ```

3. **On Application Shutdown**
   ```typescript
   await databaseConfig.disconnect();
   ```

## Dependencies

Install required packages:
```bash
npm install mongoose jsonwebtoken cloudinary firebase-admin dotenv express cors
npm install --save-dev @types/node @types/express
```

## Additional Resources

- MongoDB Documentation: https://docs.mongodb.com
- Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging
- Cloudinary Documentation: https://cloudinary.com/documentation
- Express.js: https://expressjs.com
