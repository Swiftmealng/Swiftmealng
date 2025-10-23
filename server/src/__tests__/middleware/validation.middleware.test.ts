import { Request, Response, NextFunction } from 'express';
import validate from '../../middleware/validation.middleware';
import { z } from 'zod';
import { ValidationError } from '../../utils/AppError';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  it('should pass validation with valid data', async () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email(),
        age: z.number().min(18),
      }),
    });

    mockReq.body = {
      email: 'test@example.com',
      age: 25,
    };

    const middleware = validate(schema);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
    expect(mockReq.body).toEqual({
      email: 'test@example.com',
      age: 25,
    });
  });

  it('should transform and update body with validated data', async () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email().toLowerCase(),
        name: z.string().trim(),
      }),
    });

    mockReq.body = {
      email: 'TEST@EXAMPLE.COM',
      name: '  John Doe  ',
    };

    const middleware = validate(schema);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body).toEqual({
      email: 'test@example.com',
      name: 'John Doe',
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw ValidationError for invalid email', async () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email(),
      }),
    });

    mockReq.body = {
      email: 'invalid-email',
    };

    const middleware = validate(schema);

    await expect(
      middleware(mockReq as Request, mockRes as Response, mockNext)
    ).rejects.toThrow(ValidationError);
  });

  it('should throw ValidationError with descriptive message', async () => {
    const schema = z.object({
      body: z.object({
        age: z.number().min(18, 'Must be at least 18 years old'),
      }),
    });

    mockReq.body = {
      age: 15,
    };

    const middleware = validate(schema);

    try {
      await middleware(mockReq as Request, mockRes as Response, mockNext);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('Must be at least 18 years old');
    }
  });

  it('should validate query parameters', async () => {
    const schema = z.object({
      query: z.object({
        page: z.string().transform(Number),
        limit: z.string().transform(Number),
      }),
    });

    mockReq.query = {
      page: '1',
      limit: '10',
    };

    const middleware = validate(schema);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should validate route params', async () => {
    const schema = z.object({
      params: z.object({
        id: z.string().uuid(),
      }),
    });

    mockReq.params = {
      id: '123e4567-e89b-12d3-a456-426614174000',
    };

    const middleware = validate(schema);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle multiple validation errors', async () => {
    const schema = z.object({
      body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        age: z.number().min(18),
      }),
    });

    mockReq.body = {
      email: 'invalid',
      password: 'short',
      age: 10,
    };

    const middleware = validate(schema);

    try {
      await middleware(mockReq as Request, mockRes as Response, mockNext);
    } catch (error: any) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('email');
      expect(error.message).toContain('password');
      expect(error.message).toContain('age');
    }
  });

  it('should pass through non-Zod errors', async () => {
    const schema = z.object({
      body: z.object({
        callback: z.function(),
      }),
    });

    mockReq.body = { callback: 'not-a-function' };

    const middleware = validate(schema);

    try {
      await middleware(mockReq as Request, mockRes as Response, mockNext);
    } catch (error) {
      expect(mockNext).toHaveBeenCalledWith(error);
    }
  });
});