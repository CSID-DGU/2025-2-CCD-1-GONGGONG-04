import { formatPhoneNumber } from '../formatPhoneNumber';
import { getCenterShareUrl, createCenterShareOptions } from '../share';

describe('formatPhoneNumber', () => {
  describe('should format mobile numbers correctly', () => {
    it('formats 010 mobile number with hyphens', () => {
      expect(formatPhoneNumber('010-1234-5678')).toBe('010-1234-5678');
    });

    it('formats 010 mobile number without hyphens', () => {
      expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678');
    });

    it('formats 010 mobile number with spaces', () => {
      expect(formatPhoneNumber('010 1234 5678')).toBe('010-1234-5678');
    });

    it('formats other mobile prefixes (011, 016, 017, 018, 019)', () => {
      expect(formatPhoneNumber('01112345678')).toBe('011-1234-5678');
      expect(formatPhoneNumber('01612345678')).toBe('016-1234-5678');
      expect(formatPhoneNumber('01712345678')).toBe('017-1234-5678');
      expect(formatPhoneNumber('01812345678')).toBe('018-1234-5678');
      expect(formatPhoneNumber('01912345678')).toBe('019-1234-5678');
    });
  });

  describe('should format Seoul (02) numbers correctly', () => {
    it('formats 10-digit Seoul number', () => {
      expect(formatPhoneNumber('02-1234-5678')).toBe('02-1234-5678');
      expect(formatPhoneNumber('0212345678')).toBe('02-1234-5678');
    });

    it('formats 9-digit Seoul number', () => {
      expect(formatPhoneNumber('02-123-4567')).toBe('02-123-4567');
      expect(formatPhoneNumber('021234567')).toBe('02-123-4567');
    });
  });

  describe('should format regional numbers correctly', () => {
    it('formats 10-digit regional numbers', () => {
      expect(formatPhoneNumber('031-123-4567')).toBe('031-123-4567');
      expect(formatPhoneNumber('0311234567')).toBe('031-123-4567');
    });

    it('formats 11-digit regional numbers', () => {
      expect(formatPhoneNumber('031-1234-5678')).toBe('031-1234-5678');
      expect(formatPhoneNumber('03112345678')).toBe('031-1234-5678');
    });

    it('formats various regional codes', () => {
      expect(formatPhoneNumber('0321234567')).toBe('032-123-4567');
      expect(formatPhoneNumber('0511234567')).toBe('051-123-4567');
      expect(formatPhoneNumber('0641234567')).toBe('064-123-4567');
    });
  });

  describe('should handle edge cases', () => {
    it('returns null for null input', () => {
      expect(formatPhoneNumber(null)).toBe(null);
    });

    it('returns null for empty string', () => {
      expect(formatPhoneNumber('')).toBe(null);
    });

    it('returns null for string with only non-digit characters', () => {
      expect(formatPhoneNumber('---')).toBe(null);
      expect(formatPhoneNumber('abc')).toBe(null);
    });

    it('returns original for unrecognized patterns', () => {
      expect(formatPhoneNumber('12345')).toBe('12345');
      expect(formatPhoneNumber('123456789012')).toBe('123456789012');
    });
  });

  describe('should handle various input formats', () => {
    it('removes spaces, hyphens, and parentheses', () => {
      expect(formatPhoneNumber('(010) 1234-5678')).toBe('010-1234-5678');
      expect(formatPhoneNumber('010.1234.5678')).toBe('010-1234-5678');
      expect(formatPhoneNumber('010 - 1234 - 5678')).toBe('010-1234-5678');
    });
  });
});

describe('getCenterShareUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use NEXT_PUBLIC_SITE_URL when available', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mindconnect.com';
    const url = getCenterShareUrl(1);
    expect(url).toBe('https://mindconnect.com/centers/1');
  });

  it('should remove trailing slash from base URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mindconnect.com/';
    const url = getCenterShareUrl(1);
    expect(url).toBe('https://mindconnect.com/centers/1');
  });

  it('should handle different center IDs', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mindconnect.com';
    expect(getCenterShareUrl(1)).toBe('https://mindconnect.com/centers/1');
    expect(getCenterShareUrl(42)).toBe('https://mindconnect.com/centers/42');
    expect(getCenterShareUrl(999)).toBe('https://mindconnect.com/centers/999');
  });
});

describe('createCenterShareOptions', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mindconnect.com';
  });

  it('should create share options with all fields', () => {
    const options = createCenterShareOptions(
      1,
      '서울시 정신건강복지센터',
      '정신건강 상담 및 지원 서비스'
    );

    expect(options).toEqual({
      title: '서울시 정신건강복지센터',
      text: '정신건강 상담 및 지원 서비스',
      url: 'https://mindconnect.com/centers/1',
    });
  });

  it('should use default description when not provided', () => {
    const options = createCenterShareOptions(1, '서울시 정신건강복지센터');

    expect(options).toEqual({
      title: '서울시 정신건강복지센터',
      text: '서울시 정신건강복지센터 - 마음이음',
      url: 'https://mindconnect.com/centers/1',
    });
  });
});
