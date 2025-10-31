/**
 * Encryption Utility
 *
 * Sprint 1: 규칙 기반 추천 시스템
 * Task 2.11: 암호화 유틸리티 작성
 *
 * Provides AES-256-GCM encryption and decryption for sensitive data.
 * Uses initialization vectors (IV) and authentication tags for security.
 */

const crypto = require('crypto');

// AES-256-GCM requires a 32-byte key
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 12 bytes for GCM

/**
 * Get encryption key from environment variable
 * 환경 변수에서 암호화 키 가져오기
 *
 * @returns {Buffer} 32-byte encryption key
 */
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Convert hex string to Buffer (must be 64 hex chars = 32 bytes)
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hexadecimal characters (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encrypt data using AES-256-GCM
 * AES-256-GCM으로 데이터 암호화
 *
 * @param {string} plaintext - Data to encrypt
 * @returns {string} Encrypted data in format: iv:authTag:ciphertext (hex encoded)
 */
function encrypt(plaintext) {
  if (typeof plaintext !== 'string') {
    throw new TypeError('Plaintext must be a string');
  }

  if (!plaintext) {
    throw new Error('Plaintext cannot be empty');
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return format: iv:authTag:ciphertext
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt data using AES-256-GCM
 * AES-256-GCM으로 데이터 복호화
 *
 * @param {string} encryptedData - Encrypted data in format: iv:authTag:ciphertext
 * @returns {string} Decrypted plaintext
 */
function decrypt(encryptedData) {
  if (typeof encryptedData !== 'string') {
    throw new TypeError('Encrypted data must be a string');
  }

  if (!encryptedData) {
    throw new Error('Encrypted data cannot be empty');
  }

  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format. Expected: iv:authTag:ciphertext');
  }

  const key = getEncryptionKey();
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate a new 32-byte encryption key
 * 새로운 32바이트 암호화 키 생성
 *
 * @returns {string} 64-character hex string (32 bytes)
 */
function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  encrypt,
  decrypt,
  generateKey,
};
