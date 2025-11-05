/**
 * Unit tests for Encryption Utility
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.11: 암호화 유틸리티 단위 테스트
 */

const { encrypt, decrypt, generateKey } = require('../../../src/utils/encryption');

describe('Encryption Utility', () => {
  const originalEnv = process.env.ENCRYPTION_KEY;

  beforeAll(() => {
    // Set a test encryption key (64 hex chars = 32 bytes)
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  afterAll(() => {
    // Restore original environment variable
    process.env.ENCRYPTION_KEY = originalEnv;
  });

  describe('encrypt()', () => {
    test('should encrypt plaintext and return encrypted string', () => {
      const plaintext = 'Hello, World!';
      const encrypted = encrypt(plaintext);

      // Encrypted format: iv:authTag:ciphertext
      expect(typeof encrypted).toBe('string');
      expect(encrypted.split(':')).toHaveLength(3);
    });

    test('should produce different ciphertexts for same plaintext (due to random IV)', () => {
      const plaintext = 'Same message';
      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      // Different IVs mean different ciphertexts
      expect(encrypted1).not.toBe(encrypted2);
    });

    test('should throw error for empty plaintext', () => {
      expect(() => encrypt('')).toThrow('Plaintext cannot be empty');
    });

    test('should throw error for non-string plaintext', () => {
      expect(() => encrypt(123)).toThrow('Plaintext must be a string');
      expect(() => encrypt(null)).toThrow('Plaintext must be a string');
      expect(() => encrypt(undefined)).toThrow('Plaintext must be a string');
    });

    test('should throw error when ENCRYPTION_KEY is not set', () => {
      const oldKey = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;

      expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY environment variable is not set');

      process.env.ENCRYPTION_KEY = oldKey;
    });

    test('should throw error when ENCRYPTION_KEY is invalid length', () => {
      const oldKey = process.env.ENCRYPTION_KEY;
      process.env.ENCRYPTION_KEY = '1234'; // Too short

      expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY must be 64 hexadecimal characters');

      process.env.ENCRYPTION_KEY = oldKey;
    });
  });

  describe('decrypt()', () => {
    test('should decrypt encrypted data back to plaintext', () => {
      const plaintext = 'Secret message';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test('should handle Unicode characters', () => {
      const plaintext = '안녕하세요! 🎉 Hello 世界';
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test('should handle long text', () => {
      const plaintext = 'A'.repeat(1000);
      const encrypted = encrypt(plaintext);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    test('should throw error for empty encrypted data', () => {
      expect(() => decrypt('')).toThrow('Encrypted data cannot be empty');
    });

    test('should throw error for non-string encrypted data', () => {
      expect(() => decrypt(123)).toThrow('Encrypted data must be a string');
      expect(() => decrypt(null)).toThrow('Encrypted data must be a string');
    });

    test('should throw error for invalid encrypted data format', () => {
      expect(() => decrypt('invalid:format')).toThrow('Invalid encrypted data format');
      expect(() => decrypt('only-one-part')).toThrow('Invalid encrypted data format');
    });

    test('should throw error when auth tag verification fails (tampered data)', () => {
      const plaintext = 'Original message';
      const encrypted = encrypt(plaintext);
      const parts = encrypted.split(':');

      // Tamper with ciphertext
      parts[2] = parts[2].substring(0, parts[2].length - 2) + 'ff';
      const tampered = parts.join(':');

      expect(() => decrypt(tampered)).toThrow();
    });
  });

  describe('generateKey()', () => {
    test('should generate a 64-character hex string', () => {
      const key = generateKey();

      expect(typeof key).toBe('string');
      expect(key).toHaveLength(64);
      expect(key).toMatch(/^[0-9a-f]{64}$/);
    });

    test('should generate different keys each time', () => {
      const key1 = generateKey();
      const key2 = generateKey();
      const key3 = generateKey();

      expect(key1).not.toBe(key2);
      expect(key2).not.toBe(key3);
      expect(key1).not.toBe(key3);
    });
  });

  describe('Encryption Roundtrip', () => {
    test('should handle various data types converted to strings', () => {
      const testCases = [
        'Simple text',
        'With special chars: !@#$%^&*()',
        'Numbers: 123456789',
        JSON.stringify({ user: 'test', id: 123 }),
        'Long text: ' + 'x'.repeat(500),
      ];

      testCases.forEach(plaintext => {
        const encrypted = encrypt(plaintext);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(plaintext);
      });
    });
  });
});
