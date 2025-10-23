import { Request, Response, NextFunction } from 'express';
import validate from '../../middleware/validation.middleware';
import { z, ZodError } from 'zod';
import { ValidationError } from '../../utils/AppError';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate and pass valid data', async () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }),
    });

    mockRequest.body = {
      email: 'test@example.com',
      password: 'password123',
    };

    const middleware = validate(schema);

    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRequest.body).toEqual({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('should throw ValidationError for invalid data', async () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }),
    });

    mockRequest.body = {
      email: 'invalid-email',
      password: 'short',
    };

    const middleware = validate(schema);

    await expect(
      middleware(mockRequest as Request, mockResponse as Response, mockNext)
    ).rejects.toThrow(ValidationError);
  });

  it('should provide detailed error messages', async () => {
    const schema = z.object({
      body: z.object({
        age: z.number().min(18),
      }),
    });

    mockRequest.body = {
      age: 15,
    };

    const middleware = validate(schema);

    try {
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('body.age');
    }
  });

  it('should handle missing required fields', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
    });

    mockRequest.body = {
      name: 'Test User',
      // email missing
    };

    const middleware = validate(schema);

    await expect(
      middleware(mockRequest as Request, mockResponse as Response, mockNext)
    ).rejects.toThrow(ValidationError);
  });
});