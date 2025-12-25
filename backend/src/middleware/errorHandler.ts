import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super(400, 'Validation failed', 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn(`${err.code}: ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
    return;
  }

  // Database errors
  if (err.message.includes('duplicate key')) {
    logger.warn('Database conflict error');
    res.status(409).json({
      success: false,
      error: {
        message: 'Resource already exists',
        code: 'CONFLICT',
      },
    });
    return;
  }

  if (err.message.includes('foreign key')) {
    logger.warn('Database foreign key error');
    res.status(400).json({
      success: false,
      error: {
        message: 'Invalid reference to related resource',
        code: 'INVALID_REFERENCE',
      },
    });
    return;
  }

  // Log unexpected errors
  logger.error('Unexpected error:', err);

  // Don't expose internal errors in production
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

  res.status(500).json({
    success: false,
    error: {
      message,
      code: 'INTERNAL_ERROR',
    },
  });
};
