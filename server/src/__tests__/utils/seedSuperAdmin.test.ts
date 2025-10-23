import User from '../../models/User';
import connectDB from '../../config/database/connection';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../config/database/connection');
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('seedSuperAdmin Utility', () => {
  const originalEnv = process.env;
  const originalExit = process.exit;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  let mockExit: jest.Mock;
  let mockConsoleLog: jest.Mock;
  let mockConsoleError: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    mockExit = jest.fn() as any;
    mockConsoleLog = jest.fn();
    mockConsoleError = jest.fn();
    process.exit = mockExit;
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    
    (connectDB as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
    process.exit = originalExit;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should create a new super admin when none exists', async () => {
      process.env.SUPER_ADMIN_EMAIL = 'admin@test.com';
      process.env.SUPER_ADMIN_PASSWORD = 'SecurePass123!';
      process.env.SUPER_ADMIN_NAME = 'Test Admin';
      process.env.SUPER_ADMIN_PHONE = '+1234567890';

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      await require('../../utils/seedSuperAdmin');

      expect(connectDB).toHaveBeenCalledTimes(1);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'admin@test.com' });
      expect(User.create).toHaveBeenCalledWith({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'SecurePass123!',
        phone: '+1234567890',
        role: 'admin',
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Super admin created successfully!'));
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('should use default values for name and phone when not provided', async () => {
      process.env.SUPER_ADMIN_EMAIL = 'admin@test.com';
      process.env.SUPER_ADMIN_PASSWORD = 'SecurePass123!';
      delete process.env.SUPER_ADMIN_NAME;
      delete process.env.SUPER_ADMIN_PHONE;

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'admin@test.com',
        name: 'Super Admin',
        role: 'admin',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      await require('../../utils/seedSuperAdmin');

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Super Admin',
          phone: '+2349099909990',
        })
      );
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('should exit successfully when super admin already exists', async () => {
      process.env.SUPER_ADMIN_EMAIL = 'admin@test.com';
      process.env.SUPER_ADMIN_PASSWORD = 'SecurePass123!';

      const existingAdmin = {
        email: 'admin@test.com',
        name: 'Existing Admin',
        role: 'admin',
        isEmailVerified: true,
      };

      (User.findOne as jest.Mock).mockResolvedValue(existingAdmin);

      await require('../../utils/seedSuperAdmin');

      expect(User.findOne).toHaveBeenCalledWith({ email: 'admin@test.com' });
      expect(User.create).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Super admin already exists'));
      expect(mockExit).toHaveBeenCalledWith(0);
    });
  });

  describe('Error Cases', () => {
    it('should exit with error when email is not provided', async () => {
      delete process.env.SUPER_ADMIN_EMAIL;
      process.env.SUPER_ADMIN_PASSWORD = 'SecurePass123!';

      await require('../../utils/seedSuperAdmin');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Super admin credentials not found'));
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should exit with error when password is not provided', async () => {
      process.env.SUPER_ADMIN_EMAIL = 'admin@test.com';
      delete process.env.SUPER_ADMIN_PASSWORD;

      await require('../../utils/seedSuperAdmin');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Super admin credentials not found'));
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle database connection errors', async () => {
      process.env.SUPER_ADMIN_EMAIL = 'admin@test.com';
      process.env.SUPER_ADMIN_PASSWORD = 'SecurePass123!';

      const dbError = new Error('Database connection failed');
      (connectDB as jest.Mock).mockRejectedValue(dbError);

      await require('../../utils/seedSuperAdmin');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Error seeding super admin:'), expect.any(String));
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should handle user creation errors', async () => {
      process.env.SUPER_ADMIN_EMAIL = 'admin@test.com';
      process.env.SUPER_ADMIN_PASSWORD = 'SecurePass123!';

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockRejectedValue(new Error('Duplicate key error'));

      await require('../../utils/seedSuperAdmin');

      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('Error seeding super admin:'), expect.any(String));
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});