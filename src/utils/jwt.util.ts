/**
 * JWT Utility
 * Handle JWT token generation and verification
 */

import jwt from 'jsonwebtoken';
import jwtConfig, { ITokenPayload } from '../config/jwt.config;
import logger from './logger.util;
import { AppError } from './app-error.util;
/**
 * Generate access token
 */
export const generateAccessToken = (payload: Omit<ITokenPayload, 'iat' | 'exp'>): string => {
  try {
    const config = jwtConfig.getAccessTokenConfig();
    const token = jwt.sign(payload, config.secret, {
      expiresIn: config.expiresIn as any,
      algorithm: 'HS256',
    });

    logger.debug('Access token generated');
    return token;
  } catch (error) {
    logger.error('Error generating access token', error);
    throw new AppError('Failed to generate access token', 500);
  }
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: Omit<ITokenPayload, 'iat' | 'exp'>): string => {
  try {
    const config = jwtConfig.getRefreshTokenConfig();
    const token = jwt.sign(payload, config.secret, {
      expiresIn: config.expiresIn as any,
      algorithm: 'HS256',
    });

    logger.debug('Refresh token generated');
    return token;
  } catch (error) {
    logger.error('Error generating refresh token', error);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: Omit<ITokenPayload, 'iat' | 'exp'>) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): ITokenPayload => {
  try {
    const config = jwtConfig.getAccessTokenConfig();
    const decoded = jwt.verify(token, config.secret, {
      algorithms: ['HS256'],
    });

    logger.debug('Access token verified');
    return decoded as ITokenPayload;
  } catch (error) {
    logger.warn('Access token verification failed', error);
    throw new AppError('Invalid or expired access token', 401, 'INVALID_ACCESS_TOKEN');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): ITokenPayload => {
  try {
    const config = jwtConfig.getRefreshTokenConfig();
    const decoded = jwt.verify(token, config.secret, {
      algorithms: ['HS256'],
    });

    logger.debug('Refresh token verified');
    return decoded as ITokenPayload;
  } catch (error) {
    logger.warn('Refresh token verification failed', error);
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

/**
 * Decode token without verification
 */
export const decodeToken = (token: string): any => {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    logger.error('Error decoding token', error);
    throw new Error('Failed to decode token');
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return true;
    }

    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  } catch (error) {
    logger.warn('Error checking token expiration', error);
    return true;
  }
};

/**
 * Get token expiration time
 */
export const getTokenExpirationTime = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  } catch (error) {
    logger.warn('Error getting token expiration time', error);
    return null;
  }
};

/**
 * Get time remaining until token expiration
 */
export const getTokenTimeRemaining = (token: string): number | null => {
  try {
    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) {
      return null;
    }

    const timeRemaining = expirationTime.getTime() - Date.now();
    return Math.max(timeRemaining, 0);
  } catch (error) {
    logger.warn('Error calculating token time remaining', error);
    return null;
  }
};

/**
 * Extract user ID from token
 */
export const extractUserIdFromToken = (token: string): string | null => {
  try {
    const decoded = jwt.decode(token) as any;
    return decoded?.userId || null;
  } catch (error) {
    logger.warn('Error extracting user ID from token', error);
    return null;
  }
};

/**
 * Extract role from token
 */
export const extractRoleFromToken = (token: string): string | null => {
  try {
    const decoded = jwt.decode(token) as any;
    return decoded?.role || null;
  } catch (error) {
    logger.warn('Error extracting role from token', error);
    return null;
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  getTokenExpirationTime,
  getTokenTimeRemaining,
  extractUserIdFromToken,
  extractRoleFromToken,
};
