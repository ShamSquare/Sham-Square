/**
 * Infrastructure Setup Guide
 * Quick start guide for configuring and using the infrastructure layer
 */

# Infrastructure & Configuration Setup Guide

## Quick Start

### 1. Environment Configuration

Create `.env` file from the template:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```env
# App Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ashityshop

# JWT Tokens
JWT_ACCESS_SECRET=your_secret_key_here_min_32_chars
JWT_REFRESH_SECRET=your_secret_key_here_min_32_chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:3000

# Upload Limits
MAX_FILE_SIZE=5242880
```

### 2. Initialize on Application Startup

**In your main app file (e.g., `server.ts` or `index.ts`):**

```typescript
import express from 'express';
import { databaseConfig, cloudinaryConfig, firebaseConfig } from './config';
import logger from './utils/logger.util';

const app = express();

// Initialize on startup
async function initializeApp() {
  try {
    // Initialize database
    await databaseConfig.initialize();
    logger.info('Database initialized');

    // Initialize Cloudinary
    cloudinaryConfig.initialize();
    logger.info('Cloudinary initialized');

    // Initialize Firebase
    firebaseConfig.initialize();
    logger.info('Firebase initialized');

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Initialization failed', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await databaseConfig.disconnect();
  process.exit(0);
});

initializeApp();
```

### 3. Using Configuration Modules

**Access Configuration:**

```typescript
import { envConfig } from './config';

const port = envConfig.app.port;
const mongoUri = envConfig.database.mongodbUri;
const maxFileSize = envConfig.upload.maxFileSize;
```

**Check Configuration Status:**

```typescript
import { databaseConfig, cloudinaryConfig, firebaseConfig } from './config';

if (databaseConfig.isConnectedToDatabase()) {
  console.log('Database is connected');
}

if (cloudinaryConfig.isInitialized()) {
  console.log('Cloudinary is ready');
}

if (firebaseConfig.isInitializedStatus()) {
  console.log('Firebase is initialized');
}
```

## Services Usage Examples

### Image Upload with Cloudinary

```typescript
import CloudinaryService from './services/CloudinaryService';

// Upload product image
const result = await CloudinaryService.uploadProductImage(
  '/path/to/image.jpg',
  'product123'
);

console.log(result.publicId);   // ashityshop/products/product_123_timestamp
console.log(result.secureUrl);  // https://res.cloudinary.com/.../image.jpg
console.log(result.size);       // File size in bytes

// Save to database
await Product.findByIdAndUpdate(productId, {
  image: {
    publicId: result.publicId,
    url: result.secureUrl
  }
});

// Get thumbnail URL
const thumbUrl = CloudinaryService.getThumbnailUrl(result.publicId, 200);

// Delete image
await CloudinaryService.deleteImage(result.publicId);
```

### Send Push Notifications

```typescript
import { notificationService } from './services/NotificationService';

// Send order confirmation notification
await notificationService.createAndSendNotification({
  userId: new ObjectId(userId),
  title: 'Order Confirmed',
  message: `Your order #${orderNumber} has been confirmed`,
  type: NotificationType.ORDER,
  metadata: {
    orderId: orderId,
    orderNumber: orderNumber,
    amount: totalAmount
  },
  sendPush: true,
  sendInApp: true
});

// Track order status changes
async function updateOrderStatus(orderId, newStatus) {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status: newStatus },
    { new: true }
  );

  await notificationService.sendOrderStatusNotification(
    order.userId,
    order.orderNumber,
    newStatus,
    orderId
  );
}

// Send promotional notification to multiple users
const userIds = [userId1, userId2, userId3];
await notificationService.sendPromotionalNotification(
  userIds,
  'Flash Sale',
  '50% off on electronics! Limited time only.',
  { saleId: 'FLASH_SALE_001', expiresAt: '2024-12-31' }
);

// Get user notifications
const { notifications, unreadCount, total } = 
  await notificationService.getUserNotifications(userId, 20, 0);

// Mark as read
await notificationService.markAsRead(notificationId);
await notificationService.markAllAsRead(userId);

// Cleanup old notifications
await notificationService.clearOldNotifications(30); // Delete notifications older than 30 days
```

### Device Token Management

```typescript
import * as deviceTokenUtil from './utils/deviceToken.util';

// Register device when user logs in
await deviceTokenUtil.registerDevice({
  userId: new ObjectId(userId),
  fcmToken: deviceToken,
  deviceType: 'web' // or 'android', 'ios'
});

// Get all active FCM tokens for a user
const tokens = await deviceTokenUtil.getUserFCMTokens(userId);

// Get user devices
const { devices, total } = await deviceTokenUtil.getUserDevices(userId);

// Unregister device (on logout)
await deviceTokenUtil.unregisterDevice(fcmToken);

// Delete specific device
await deviceTokenUtil.deleteDevice(deviceId);

// Cleanup inactive devices
await deviceTokenUtil.clearInactiveDevices(userId);

// Cleanup devices not accessed in 30 days
await deviceTokenUtil.cleanupExpiredDevices(30);

// Get device statistics
const stats = await deviceTokenUtil.getDeviceStatistics();
// Returns: { totalDevices, activeDevices, inactiveDevices, devicesByType }
```

## Utility Usage Examples

### Validation

```typescript
import {
  isValidEmail,
  isValidPhone,
  isValidPrice,
  isStrongPassword,
  isValidFCMToken,
  isValidObjectId
} from './utils/validation.util';

// Validate email
if (!isValidEmail(email)) {
  throw new Error('Invalid email address');
}

// Validate password strength
const { valid, errors } = isStrongPassword(password);
if (!valid) {
  console.error('Password too weak:', errors);
}

// Validate price
if (!isValidPrice(price)) {
  throw new Error('Invalid price format');
}

// Validate MongoDB ID
if (!isValidObjectId(productId)) {
  throw new Error('Invalid product ID');
}

// Validate FCM token
if (!isValidFCMToken(fcmToken)) {
  throw new Error('Invalid FCM token');
}
```

### JWT Tokens

```typescript
import {
  generateTokenPair,
  verifyAccessToken,
  isTokenExpired,
  extractUserIdFromToken
} from './utils/jwt.util';

// Generate tokens on login
const { accessToken, refreshToken } = generateTokenPair({
  userId: user._id.toString(),
  email: user.email,
  role: user.role
});

// Verify access token
try {
  const payload = verifyAccessToken(accessToken);
  console.log('User ID:', payload.userId);
  console.log('Role:', payload.role);
} catch (error) {
  console.error('Invalid token');
}

// Check if token is expired
if (isTokenExpired(accessToken)) {
  console.log('Token expired, refresh needed');
}

// Extract user ID from token
const userId = extractUserIdFromToken(accessToken);
```

### Error Handling

```typescript
import {
  throwNotFound,
  throwUnauthorized,
  throwBadRequest,
  createErrorResponse,
  createSuccessResponse
} from './utils/error.util';

// Throw specific errors
if (!user) {
  throwNotFound('User');  // Throws 404
}

if (!isAuthorized) {
  throwUnauthorized();    // Throws 401
}

if (!validInput) {
  throwBadRequest('Invalid input', { field: 'email' });  // Throws 400
}

// Send responses
res.status(200).json(
  createSuccessResponse(data, 'Operation successful')
);

res.status(400).json(
  createErrorResponse(
    ErrorCode.BAD_REQUEST,
    'Invalid email address',
    { field: 'email' }
  )
);
```

### Pagination

```typescript
import {
  getPaginationQuery,
  createPaginatedResponse
} from './utils/pagination.util';

// Handle pagination in API endpoint
const { page = 1, limit = 20 } = req.query;
const { skip, limit: pageLimit } = getPaginationQuery({
  page: parseInt(page),
  limit: parseInt(limit)
});

// Query database
const items = await Model.find()
  .skip(skip)
  .limit(pageLimit)
  .exec();

const total = await Model.countDocuments();

// Return paginated response
const response = createPaginatedResponse(
  items,
  page,
  pageLimit,
  total
);

res.json(response);
// Returns: { data: [], meta: { page, limit, total, pages, hasNextPage, hasPreviousPage } }
```

### Logging

```typescript
import logger from './utils/logger.util';

logger.debug('Debug information', { userId: '123' });
logger.info('User logged in', { email: 'user@example.com' });
logger.warn('High memory usage detected', { memory: '512MB' });
logger.error('Database connection failed', error);
```

## Middleware Integration

Add these middleware to your Express app:

```typescript
import express from 'express';
import cors from 'cors';

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS
app.use(cors({
  origin: envConfig.frontend.clientUrl,
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      createErrorResponse(error.code, error.message, error.details)
    );
  }

  logger.error('Unhandled error', error);
  res.status(500).json(
    createErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Internal server error'
    )
  );
});
```

## Testing

### Sample Test for Notification Service

```typescript
import { notificationService } from './services/NotificationService';

describe('NotificationService', () => {
  it('should create and send notification', async () => {
    const result = await notificationService.createAndSendNotification({
      userId: new ObjectId(),
      title: 'Test',
      message: 'Test message',
      type: NotificationType.SYSTEM,
      sendPush: false,
      sendInApp: true
    });

    expect(result.success).toBe(true);
    expect(result.notificationId).toBeDefined();
  });
});
```

## Production Checklist

- [ ] All environment variables set correctly
- [ ] Database connection pooling configured
- [ ] Firebase credentials validated
- [ ] Cloudinary API keys verified
- [ ] JWT secrets secured and long enough
- [ ] Error logging enabled
- [ ] CORS properly configured
- [ ] File upload limits set
- [ ] Password requirements enforced
- [ ] Rate limiting implemented
- [ ] HTTPS enabled
- [ ] Database backups configured
- [ ] Monitoring and alerts setup
- [ ] Log rotation configured

## Troubleshooting

### MongoDB Connection Failed
- Verify MONGODB_URI is correct
- Check network connectivity
- Ensure MongoDB credentials are valid
- Check firewall rules

### Firebase Initialization Failed
- Verify FIREBASE_PROJECT_ID
- Check FIREBASE_PRIVATE_KEY format (with newlines)
- Ensure FIREBASE_CLIENT_EMAIL is correct
- Verify service account permissions

### Cloudinary Upload Failed
- Verify API credentials
- Check file size limit
- Ensure file format is supported
- Check network connectivity

### Notifications Not Received
- Verify FCM tokens are valid
- Check Firebase project is active
- Ensure device is subscribed
- Check Firebase quota limits

## Support

For detailed documentation, see:
- [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) - Comprehensive documentation
- [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) - Database schema

