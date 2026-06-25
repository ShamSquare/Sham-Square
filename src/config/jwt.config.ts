/**
 * JWT Configuration
 * JSON Web Token configuration and utilities
 */

import envConfig from './env.config.js';

export interface IJWTConfig {
  accessToken: {
    secret: string;
    expiresIn: string;
  };
  refreshToken: {
    secret: string;
    expiresIn: string;
  };
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin' | 'delivery';
  iat?: number;
  exp?: number;
}

class JWTConfig {
  private config: IJWTConfig;

  constructor() {
    this.config = {
      accessToken: {
        secret: envConfig.jwt.accessSecret,
        expiresIn: envConfig.jwt.accessExpires,
      },
      refreshToken: {
        secret: envConfig.jwt.refreshSecret,
        expiresIn: envConfig.jwt.refreshExpires,
      },
    };
  }

  /**
   * Get JWT configuration
   */
  getConfig(): IJWTConfig {
    return this.config;
  }

  /**
   * Get access token configuration
   */
  getAccessTokenConfig() {
    return this.config.accessToken;
  }

  /**
   * Get refresh token configuration
   */
  getRefreshTokenConfig() {
    return this.config.refreshToken;
  }

  /**
   * Validate JWT secrets
   */
  validateSecrets(): boolean {
    return (
      this.config.accessToken.secret &&
      this.config.refreshToken.secret &&
      this.config.accessToken.secret.length >= 32 &&
      this.config.refreshToken.secret.length >= 32
    );
  }
}

export default new JWTConfig();
