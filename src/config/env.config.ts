/**
 * Environment Configuration
 * Validates and provides access to environment variables
 */

import dotenv from 'dotenv';
import path from 'path/win32';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});
export interface IEnvConfig {
  app: {
    port: number;
    nodeEnv: 'development' | 'production' | 'testing';
  };
  database: {
    mongodbUri: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpires: string;
    refreshExpires: string;
  };
  cloudinary: {
    cloudName: string;
    apiKey: string;
    apiSecret: string;
  };
  firebase: {
    projectId: string;
    privateKey: string;
    clientEmail: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpEmail: string;
    smtpPassword: string;
  };
  frontend: {
    clientUrl: string;
  };
  upload: {
    maxFileSize: number;
  };
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || '';
};

const envConfig: IEnvConfig = {
  app: {
    port: parseInt(getEnvVariable('PORT', '5000'), 10),
    nodeEnv: (getEnvVariable('NODE_ENV', 'development') as any),
  },
  database: {
    mongodbUri: getEnvVariable('MONGODB_URI'),
  },
  jwt: {
    accessSecret: getEnvVariable('JWT_ACCESS_SECRET'),
    refreshSecret: getEnvVariable('JWT_REFRESH_SECRET'),
    accessExpires: getEnvVariable('JWT_ACCESS_EXPIRES', '15m'),
    refreshExpires: getEnvVariable('JWT_REFRESH_EXPIRES', '7d'),
  },
  cloudinary: {
    cloudName: getEnvVariable('CLOUDINARY_CLOUD_NAME'),
    apiKey: getEnvVariable('CLOUDINARY_API_KEY'),
    apiSecret: getEnvVariable('CLOUDINARY_API_SECRET'),
  },
  firebase: {
    projectId: getEnvVariable('FIREBASE_PROJECT_ID'),
    privateKey: getEnvVariable('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    clientEmail: getEnvVariable('FIREBASE_CLIENT_EMAIL'),
  },
  email: {
    smtpHost: getEnvVariable('SMTP_HOST'),
    smtpPort: parseInt(getEnvVariable('SMTP_PORT', '587'), 10),
    smtpEmail: getEnvVariable('SMTP_EMAIL'),
    smtpPassword: getEnvVariable('SMTP_PASSWORD'),
  },
  frontend: {
    clientUrl: getEnvVariable('CLIENT_URL', 'http://localhost:3000'),
  },
  upload: {
    maxFileSize: parseInt(getEnvVariable('MAX_FILE_SIZE', '5242880'), 10),
  },
};

export default envConfig;
