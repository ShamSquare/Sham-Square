/**
 * Infrastructure Quick Reference
 * Developer cheat sheet for common tasks
 */

# Infrastructure Quick Reference Guide

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
npm install mongoose jsonwebtoken cloudinary firebase-admin dotenv express cors

# 2. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 3. Initialize database
npm run dev  # App initializes configs automatically
```

---

## 📦 Import Patterns

### Configuration
```typescript
import { envConfig, databaseConfig, cloudinaryConfig, firebaseConfig, jwtConfig } from './config';
```

### Services
```typescript
import CloudinaryService from './services/CloudinaryService';
import FirebaseService from './services/FirebaseService';
import { notificationService } from './services/NotificationService';
```

### Models
```typescript
import UserDeviceModel from './database/models/UserDevice';
import { Notification } from './database/models/Notification';
```

### Utilities
```typescript
import logger from './utils/logger.util';
import { isValidEmail, isValidPrice } from './utils/validation.util';
import { generateTokenPair, verifyAccessToken } from './utils/jwt.util';
import { createSuccessResponse, throwNotFound } from './utils/error.util';
import { getPaginationQuery } from './utils/pagination.util';
import { registerDevice, getUserFCMTokens } from './utils/deviceToken.util';
import * as constants from './utils/constants.util';
```

---

## 🔧 Common Tasks

### Upload Image
```typescript
const result = await CloudinaryService.uploadProductImage(filePath, productId);
// { publicId, secureUrl, format, size, width, height }
```

### Send Notification
```typescript
await notificationService.createAndSendNotification({
  userId,
  title: 'Order Status',
  message: 'Your order has been shipped',
  type: NotificationType.ORDER,
  metadata: { orderId },
  sendPush: true,
  sendInApp: true
});
```

### Register Device
```typescript
await registerDevice({ userId, fcmToken, deviceType: 'web' });
```

### Generate JWT Tokens
```typescript
const { accessToken, refreshToken } = generateTokenPair({
  userId: user._id,
  email: user.email,
  role: user.role
});
```

### Verify Token
```typescript
const payload = verifyAccessToken(token);
// { userId, email, role, iat, exp }
```

### Validate Input
```typescript
if (!isValidEmail(email)) throw new Error('Invalid email');
if (!isValidPrice(price)) throw new Error('Invalid price');
const { valid, errors } = isStrongPassword(password);
```

### Handle Pagination
```typescript
const { skip, limit, page } = getPaginationQuery({ page: 1, limit: 20 });
const items = await Model.find().skip(skip).limit(limit);
res.json(createPaginatedResponse(items, page, limit, total));
```

### Log Events
```typescript
logger.info('User registered', { userId, email });
logger.error('Payment failed', error);
logger.warn('Quota exceeded', { quota: 100 });
```

### Send Error Response
```typescript
res.status(400).json(
  createErrorResponse(ErrorCode.BAD_REQUEST, 'Invalid input')
);
```

---

## 🗄️ Database Models

### UserDevice Fields
```typescript
{
  userId: ObjectId,
  fcmToken: string,
  deviceType: 'android' | 'web' | 'ios',
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Fields
```typescript
{
  userId: ObjectId,
  title: string,
  body: string,
  type: 'ORDER' | 'DELIVERY' | 'PROMOTION' | 'SYSTEM' | 'SUPPORT' | 'PAYMENT',
  isRead: boolean,
  metadata: object,
  createdAt: Date
}
```

---

## 🔐 Configuration Access

```typescript
// App
envConfig.app.port           // 5000
envConfig.app.nodeEnv        // 'development'

// Database
envConfig.database.mongodbUri

// JWT
envConfig.jwt.accessSecret
envConfig.jwt.refreshExpires // '7d'

// Cloudinary
envConfig.cloudinary.cloudName

// Firebase
envConfig.firebase.projectId

// Upload
envConfig.upload.maxFileSize // 5242880
```

---

## 🎯 HTTP Status Codes

```typescript
400 - BAD_REQUEST
401 - UNAUTHORIZED
403 - FORBIDDEN
404 - NOT_FOUND
409 - CONFLICT
422 - VALIDATION_ERROR
429 - RATE_LIMIT_EXCEEDED
500 - INTERNAL_SERVER_ERROR
503 - SERVICE_UNAVAILABLE
```

---

## 📊 Constants

```typescript
// Pagination defaults
PAGINATION.DEFAULT_PAGE         // 1
PAGINATION.DEFAULT_LIMIT        // 20
PAGINATION.MAX_LIMIT            // 100

// Cache TTL (seconds)
CACHE_TTL.SHORT                 // 300 (5 min)
CACHE_TTL.MEDIUM                // 3600 (1 hour)
CACHE_TTL.LONG                  // 86400 (24 hours)

// File sizes (bytes)
FILE_SIZE_LIMITS.IMAGE          // 5242880 (5MB)
FILE_SIZE_LIMITS.DOCUMENT       // 10485760 (10MB)

// Password rules
PASSWORD_REQUIREMENTS.MIN_LENGTH // 8
PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE

// Notification settings
NOTIFICATION.MAX_BATCH_SIZE     // 500
NOTIFICATION.RETRY_ATTEMPTS     // 3
```

---

## 🧪 Testing Pattern

```typescript
// Mock CloudinaryService
jest.mock('./services/CloudinaryService');
CloudinaryService.uploadProductImage.mockResolvedValue({
  publicId: 'test_id',
  secureUrl: 'https://...',
  format: 'jpg',
  size: 1024
});

// Mock Firebase
jest.mock('./services/FirebaseService');
FirebaseService.sendToDevice.mockResolvedValue({
  messageId: 'msg123',
  success: true
});

// Test with mocked services
await CloudinaryService.uploadProductImage(file, id);
expect(CloudinaryService.uploadProductImage).toHaveBeenCalled();
```

---

## 🛡️ Error Handling Pattern

```typescript
try {
  const user = await User.findById(userId);
  if (!user) throwNotFound('User');
  
  const result = await notificationService.sendPushNotification(...);
  if (!result.success) throw new Error('Push notification failed');
  
  res.json(createSuccessResponse(result, 'Operation successful'));
} catch (error) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      createErrorResponse(error.code, error.message, error.details)
    );
  }
  
  logger.error('Unhandled error', error);
  res.status(500).json(
    createErrorResponse(ErrorCode.INTERNAL_SERVER_ERROR, 'Server error')
  );
}
```

---

## 📝 API Response Pattern

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-06-22T10:30:00Z"
}
```

### Error
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": { "email": "Invalid email" },
  "timestamp": "2024-06-22T10:30:00Z"
}
```

### Paginated
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2024-06-22T10:30:00Z"
}
```

---

## 🔗 Service Integration Example

```typescript
// In your controller or route handler
async function handleOrderDelivery(req, res) {
  try {
    const { orderId, userId } = req.body;
    
    // Validate input
    if (!isValidObjectId(orderId)) {
      return res.status(400).json(
        createErrorResponse(ErrorCode.BAD_REQUEST, 'Invalid order ID')
      );
    }
    
    // Update order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'DELIVERED' },
      { new: true }
    );
    
    if (!order) throwNotFound('Order');
    
    // Send notification
    await notificationService.sendOrderStatusNotification(
      order.userId,
      order.orderNumber,
      'DELIVERED',
      order._id
    );
    
    // Log event
    logger.info('Order delivered', { orderId, userId });
    
    // Send response
    res.json(createSuccessResponse(order, 'Order marked as delivered'));
  } catch (error) {
    // Handle error...
  }
}
```

---

## 📚 Documentation Links

- **Full Documentation**: See [INFRASTRUCTURE.md](./INFRASTRUCTURE.md)
- **Setup Guide**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Summary**: See [INFRASTRUCTURE_SUMMARY.md](./INFRASTRUCTURE_SUMMARY.md)

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| `Cannot find module` | Ensure import paths are correct (relative to file location) |
| `Config not initialized` | Call `config.initialize()` before using |
| `Firebase error` | Check FIREBASE_PRIVATE_KEY format (with `\n` newlines) |
| `Cloudinary error` | Verify API credentials and file permissions |
| `No devices found` | Check if FCM tokens are registered and active |
| `Token expired` | Call refresh token endpoint to get new access token |
| `Validation failed` | Check input format against validation rules |

---

## 💡 Tips & Tricks

1. **Always validate** user input before processing
2. **Always log** important events for debugging
3. **Always catch** errors in try-catch blocks
4. **Always return** standardized responses
5. **Always use** utility functions for common tasks
6. **Always check** if services are initialized
7. **Always handle** failed operations gracefully

---

## 📞 Support Files

```
docs/
├── INFRASTRUCTURE.md          # Complete API reference
├── SETUP_GUIDE.md            # Step-by-step setup
├── INFRASTRUCTURE_SUMMARY.md  # File-by-file summary
└── QUICK_REFERENCE.md        # This file
```

---

**Last Updated**: 2024-06-22
**Version**: 1.0.0
**Status**: Production Ready ✅

