import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AshityShop API',
      version: '1.0.0',
      description: 'E-commerce API documentation',
    },

    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:5000',
      },
    ],

    // 🔐 IMPORTANT PART
components: {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },

  // 🔥 NEW: SCHEMAS
  schemas: {
    User: {
      type: 'object',
      properties: {
        _id: {
          type: 'string',
          example: '64f1c2a9e4b0c123456789ab',
        },
        name: {
          type: 'string',
          example: 'John Doe',
        },
        email: {
          type: 'string',
          example: 'john@example.com',
        },
        role: {
          type: 'string',
          example: 'user',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
        },
      },
    },

    CreateUserDto: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: {
          type: 'string',
          example: 'John Doe',
        },
        email: {
          type: 'string',
          example: 'john@example.com',
        },
        password: {
          type: 'string',
          example: '12345678',
        },
      },
    },

    LoginDto: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          example: 'john@example.com',
        },
        password: {
          type: 'string',
          example: '12345678',
        },
      },
    },

    AuthResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        message: {
          type: 'string',
          example: 'Login successful',
        },
        data: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            accessToken: {
              type: 'string',
            },
            refreshToken: {
              type: 'string',
            },
          },
        },
      },
    },
  },
},

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);