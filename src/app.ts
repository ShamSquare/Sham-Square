import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import env from './config/env.config';
import logger from './utils/logger.util';

// Routes
import { apiRouter } from './routes/index';

// Utils
import {errorHandler} from './middlewares/error.middleware';

//Swagger
import swaggerUi from 'swagger-ui-express';
import {swaggerSpec} from './config/swagger.config';

const app = express();

/* =========================
   1. SECURITY MIDDLEWARES
========================= */
app.use(helmet());

const allowedOrigins = process.env.CLIENT_URL!.split(',');

app.use(cors({
  origin: true,
  credentials: true,
}));

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
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (env.app.nodeEnv !== 'production') {
  app.get('/', (req, res) => {
    res.redirect('/api/docs');
  });
}

/* =========================
   6. API ROUTES
========================= */
app.use('/api/v1', apiRouter);

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