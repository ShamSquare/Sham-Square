import swaggerJSDoc from 'swagger-jsdoc';
import envConfig from './env.config.ts';
import { schemas } from './swagger/schemas.ts';

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'AshityShop API',
      version: '1.0.0',
      description: 'E-commerce API documentation',
    },

    servers: [
      {
        url: `http://localhost:${envConfig.app.port}`,
        description: 'Development server',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas,
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    './src/config/swagger/paths.ts',
    './src/routes/*.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
