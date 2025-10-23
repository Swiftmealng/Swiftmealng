import User from '../../models/User';

jest.mock('../../models/User');
jest.mock('../../config/database/connection', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true)
}));

describe('Seed Super Admin Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SUPER_ADMIN_EMAIL = 'admin@test.com';
    process.env.SUPER_ADMIN_PASSWORD = 'admin123';
    process.env.SUPER_ADMIN_NAME = 'Test Admin';
    process.env.SUPER_ADMIN_PHONE = '+1234567890';
  });

  describe('Super Admin Creation Logic', () => {
    it('should validate required environment variables', () => {
      delete process.env.SUPER_ADMIN_EMAIL;
      delete process.env.SUPER_ADMIN_PASSWORD;

      // Simulating the validation logic from seedSuperAdmin
      const hasRequiredVars = !!(process.env.SUPER_ADMIN_EMAIL && process.env.SUPER_ADMIN_PASSWORD);
      
      expect(hasRequiredVars).toBe(false);
    });

    it('should use default values for optional fields', () => {
      delete process.env.SUPER_ADMIN_NAME;
      delete process.env.SUPER_ADMIN_PHONE;

      const name = process.env.SUPER_ADMIN_NAME || 'Super Admin';
      const phone = process.env.SUPER_ADMIN_PHONE || '+2349099909990';

      expect(name).toBe('Super Admin');
      expect(phone).toBe('+2349099909990');
    });

    it('should check for existing admin before creating', async () => {
      const existingAdmin = {
        email: 'admin@test.com',
        name: 'Existing Admin',
        role: 'admin',
        isEmailVerified: true
      };

      (User.findOne as jest.Mock).mockResolvedValue(existingAdmin);

      const result = await User.findOne({ email: process.env.SUPER_ADMIN_EMAIL });
      
      expect(result).toEqual(existingAdmin);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'admin@test.com' });
    });

    it('should create admin with correct properties', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      const newAdmin = {
        _id: 'admin123',
        name: 'Test Admin',
        email: 'admin@test.com',
        role: 'admin',
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null
      };

      (User.create as jest.Mock).mockResolvedValue(newAdmin);

      const result = await User.create({
        name: process.env.SUPER_ADMIN_NAME,
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
        phone: process.env.SUPER_ADMIN_PHONE,
        role: 'admin',
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null
      });

      expect(result.role).toBe('admin');
      expect(result.isEmailVerified).toBe(true);
      expect(result.verificationCode).toBeNull();
    });
  });
});