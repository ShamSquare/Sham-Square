import swaggerJSDoc from 'swagger-jsdoc';
import envConfig from './env.config';
import { schemas } from './swagger/schemas';

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
        url: `http://localhost:5000`,
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
    './src/config/swagger/paths',
    './src/routes/*',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
