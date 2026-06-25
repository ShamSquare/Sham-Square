import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import env from './config/env.config.js';
import logger from './utils/logger.util.js';

// Routes
import {userRoutes} from './routes/userRoutes.js';
import {productRoutes} from './routes/productRoutes.js';
import {orderRoutes} from './routes/orderRoutes.js';
import {cartRoutes} from './routes/cartRoutes.js';
import {categoryRoutes} from './routes/categoryRoutes.js';
import {notificationRoutes} from './routes/notificationRoutes.js';

// Utils
import {errorHandler} from './middlewares/error.middleware.js';

//Swagger
import swaggerUi from 'swagger-ui-express';
import {swaggerSpec} from './config/swagger.config.js';

const app = express();

/* =========================
   1. SECURITY MIDDLEWARES
========================= */
app.use(helmet());

app.use(
  cors({
    origin: env.frontend.clientUrl || '*',
    credentials: true,
  })
);

/* =========================
   2. BODY PARSING
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* =========================
   3. LOGGER
========================= */
if (env.app.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

/* =========================
   4. HEALTH CHECK
========================= */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running 🚀',
  });
});
/* =========================
  5. SWAGGER DOCUMENTATION
========================= */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* =========================
   6. API ROUTES
========================= */
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/cart`, cartRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);

/* =========================
   7. 404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* =========================
   8. GLOBAL ERROR HANDLER
========================= */
app.use(errorHandler);

export default app;