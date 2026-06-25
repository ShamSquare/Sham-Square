/**
 * Pagination Utility
 * Handle pagination logic for list endpoints
 */

import { PAGINATION } from './constants.util.ts';

export interface IPaginationParams {
  page?: number;
  limit?: number;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: IPaginationMeta;
}

/**
 * Validate and sanitize pagination parameters
 */
export const validatePaginationParams = (params: IPaginationParams) => {
  let { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = params;

  // Ensure page is positive integer
  page = Math.max(PAGINATION.DEFAULT_PAGE, parseInt(String(page), 10));

  // Ensure limit is within allowed range
  limit = Math.min(Math.max(PAGINATION.MIN_LIMIT, parseInt(String(limit), 10)), PAGINATION.MAX_LIMIT);

  return { page, limit };
};

/**
 * Calculate pagination metadata
 */
export const calculatePaginationMeta = (
  page: number,
  limit: number,
  total: number
): IPaginationMeta => {
  const pages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    pages,
    hasNextPage: page < pages,
    hasPreviousPage: page > 1,
  };
};

/**
 * Calculate skip value for database query
 */
export const calculateSkip = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Create paginated response
 */
export const createPaginatedResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): IPaginatedResponse<T> => {
  const meta = calculatePaginationMeta(page, limit, total);

  return {
    data,
    meta,
  };
};

/**
 * Get pagination query for MongoDB
 */
export const getPaginationQuery = (
  params: IPaginationParams
): { skip: number; limit: number; page: number } => {
  const { page, limit } = validatePaginationParams(params);
  const skip = calculateSkip(page, limit);

  return { skip, limit, page };
};

/**
 * Format pagination for API response
 */
export const formatPaginationResponse = <T>(
  data: T[],
  total: number,
  params: IPaginationParams
) => {
  const { page, limit } = validatePaginationParams(params);
  const meta = calculatePaginationMeta(page, limit, total);

  return {
    success: true,
    data,
    pagination: meta,
  };
};

export default {
  validatePaginationParams,
  calculatePaginationMeta,
  calculateSkip,
  createPaginatedResponse,
  getPaginationQuery,
  formatPaginationResponse,
};
