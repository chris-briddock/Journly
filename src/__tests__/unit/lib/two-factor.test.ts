import {
  encrypt,
  decrypt,
  generateTwoFactorSecret,
  generateBackupCodes,
  encryptBackupCodes,
  decryptBackupCodes,
  verifyBackupCode,
  removeUsedBackupCode,
  isTwoFactorEnabled,
  validateTwoFactorSetup,
} from '@/lib/two-factor';

// Mock environment variable
process.env.TWO_FACTOR_ENCRYPTION_KEY = 'test-key-32-characters-long-123';

describe('Two-Factor Authentication Utils', () => {
  describe('Encryption/Decryption', () => {
    it('should encrypt and decrypt text correctly', () => {
      const originalText = 'test-secret-key';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(encrypted).not.toBe(originalText);
      expect(decrypted).toBe(originalText);
    });

    it('should produce different encrypted values for the same input', () => {
      const text = 'same-input';
      const encrypted1 = encrypt(text);
      const encrypted2 = encrypt(text);

      expect(encrypted1).not.toBe(encrypted2);
      expect(decrypt(encrypted1)).toBe(text);
      expect(decrypt(encrypted2)).toBe(text);
    });
  });

  describe('Secret Generation', () => {
    it('should generate a 2FA secret with correct properties', () => {
      const email = 'test@example.com';
      const result = generateTwoFactorSecret(email);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCodeUrl');
      expect(typeof result.secret).toBe('string');
      expect(typeof result.qrCodeUrl).toBe('string');
      expect(result.secret.length).toBeGreaterThan(0);
      expect(result.qrCodeUrl).toContain('otpauth://totp/');
      expect(result.qrCodeUrl).toContain(encodeURIComponent(email));
    });

    it('should generate different secrets each time', () => {
      const email = 'test@example.com';
      const result1 = generateTwoFactorSecret(email);
      const result2 = generateTwoFactorSecret(email);

      expect(result1.secret).not.toBe(result2.secret);
      expect(result1.qrCodeUrl).not.toBe(result2.qrCodeUrl);
    });
  });

  describe('Backup Codes', () => {
    it('should generate the correct number of backup codes', () => {
      const codes = generateBackupCodes(8);
      expect(codes).toHaveLength(8);
    });

    it('should generate unique backup codes', () => {
      const codes = generateBackupCodes(10);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should generate 8-character uppercase codes', () => {
      const codes = generateBackupCodes(5);
      codes.forEach(code => {
        expect(code).toHaveLength(8);
        expect(code).toMatch(/^[A-F0-9]{8}$/);
      });
    });

    it('should encrypt and decrypt backup codes correctly', () => {
      const originalCodes = ['ABCD1234', 'EFGH5678', 'IJKL9012'];
      const encrypted = encryptBackupCodes(originalCodes);
      const decrypted = decryptBackupCodes(encrypted);

      expect(encrypted).not.toEqual(originalCodes);
      expect(decrypted).toEqual(originalCodes);
    });

    it('should verify backup codes correctly', () => {
      const codes = ['ABCD1234', 'EFGH5678', 'IJKL9012'];
      const encrypted = encryptBackupCodes(codes);

      expect(verifyBackupCode('ABCD1234', encrypted)).toBe(true);
      expect(verifyBackupCode('abcd1234', encrypted)).toBe(true); // Case insensitive
      expect(verifyBackupCode('INVALID1', encrypted)).toBe(false);
      expect(verifyBackupCode('', encrypted)).toBe(false);
    });

    it('should remove used backup codes correctly', () => {
      const codes = ['ABCD1234', 'EFGH5678', 'IJKL9012'];
      const encrypted = encryptBackupCodes(codes);
      const updatedEncrypted = removeUsedBackupCode('EFGH5678', encrypted);
      const updatedCodes = decryptBackupCodes(updatedEncrypted);

      expect(updatedCodes).toHaveLength(2);
      expect(updatedCodes).toContain('ABCD1234');
      expect(updatedCodes).toContain('IJKL9012');
      expect(updatedCodes).not.toContain('EFGH5678');
    });
  });

  describe('2FA Status Check', () => {
    it('should return true when 2FA is enabled and secret exists', () => {
      const user = {
        twoFactorEnabled: true,
        twoFactorSecret: 'encrypted-secret',
      };

      expect(isTwoFactorEnabled(user)).toBe(true);
    });

    it('should return false when 2FA is disabled', () => {
      const user = {
        twoFactorEnabled: false,
        twoFactorSecret: 'encrypted-secret',
      };

      expect(isTwoFactorEnabled(user)).toBe(false);
    });

    it('should return false when secret is null', () => {
      const user = {
        twoFactorEnabled: true,
        twoFactorSecret: null,
      };

      expect(isTwoFactorEnabled(user)).toBe(false);
    });

    it('should return false when both are false/null', () => {
      const user = {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      };

      expect(isTwoFactorEnabled(user)).toBe(false);
    });
  });

  describe('Setup Validation', () => {
    it('should return false for empty token or secret', () => {
      expect(validateTwoFactorSetup('', 'secret')).toBe(false);
      expect(validateTwoFactorSetup('123456', '')).toBe(false);
      expect(validateTwoFactorSetup('', '')).toBe(false);
    });

    // Note: We can't easily test the actual TOTP verification without mocking speakeasy
    // or using a known secret and time, which would be complex for unit tests
  });
});
