export interface ISuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface IErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Record<string, any>;
}

export function successResponse<T>(
  data: T,
  message = 'Success'
): ISuccessResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(
  message: string,
  code?: string,
  errors?: Record<string, any>
): IErrorResponse {
  return {
    success: false,
    message,
    code,
    errors,
  };
}

export const response = {
  success: successResponse,
  error: errorResponse,
};