/**
 * Environment Configuration
 * Validates and provides typed access to all environment variables.
 *
 * IMPORTANT: This module calls dotenv.config() as its very first statement.
 * It must be the first import in server.ts (after the dns fix) so that
 * process.env is populated before any other module reads from it.
 */

import dotenv from 'dotenv';
import path from 'path'; // ✅ FIXED: was 'path/win32' — that forces Windows-only path
                         //    separators and silently breaks .env loading on Linux/macOS/Docker.

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});
// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

/**
 * Reads an environment variable. Throws a descriptive error at startup
 * if a required variable is missing — far better than a silent undefined
 * that surfaces as a cryptic runtime error later.
 */
const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(
      `❌ Missing required environment variable: "${key}". ` +
      `Check your .env file and ensure dotenv is loaded before this module.`
    );
  }
  return value ?? defaultValue ?? '';
};

// ─────────────────────────────────────────────
// Config object
// ─────────────────────────────────────────────

const envConfig: IEnvConfig = {
  app: {
    port: parseInt(getEnvVariable('PORT', '5000'), 10),
    nodeEnv: getEnvVariable('NODE_ENV', 'development') as IEnvConfig['app']['nodeEnv'],
  },

  database: {
    mongodbUri: getEnvVariable('MONGODB_URI'),
  },

  jwt: {
    accessSecret:  getEnvVariable('JWT_ACCESS_SECRET'),
    refreshSecret: getEnvVariable('JWT_REFRESH_SECRET'),
    accessExpires: getEnvVariable('JWT_ACCESS_EXPIRES', '15m'),
    refreshExpires: getEnvVariable('JWT_REFRESH_EXPIRES', '7d'),
  },

  cloudinary: {
    cloudName: getEnvVariable('CLOUDINARY_CLOUD_NAME'),
    apiKey:    getEnvVariable('CLOUDINARY_API_KEY'),
    apiSecret: getEnvVariable('CLOUDINARY_API_SECRET'),
  },

  firebase: {
    projectId:   getEnvVariable('FIREBASE_PROJECT_ID'),
    // .env stores \n as a literal two-character sequence; convert to real newlines
    privateKey:  getEnvVariable('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    clientEmail: getEnvVariable('FIREBASE_CLIENT_EMAIL'),
  },

  email: {
    smtpHost:     getEnvVariable('SMTP_HOST', 'smtp.gmail.com'),
    smtpPort:     parseInt(getEnvVariable('SMTP_PORT', '587'), 10),
    smtpEmail:    getEnvVariable('SMTP_EMAIL'),
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