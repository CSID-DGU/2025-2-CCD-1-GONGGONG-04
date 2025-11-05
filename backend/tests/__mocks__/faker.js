/**
 * Faker Mock for Jest
 *
 * Provides a simple mock for @faker-js/faker to avoid ES module issues
 */

const faker = {
  datatype: {
    uuid: () => `test-uuid-${Math.random().toString(36).substr(2, 9)}`,
    number: (opts) => {
      if (opts && typeof opts === 'object') {
        const min = opts.min || 0;
        const max = opts.max || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      return Math.floor(Math.random() * 100);
    },
    boolean: () => Math.random() > 0.5,
    float: (opts) => {
      const min = opts?.min || 0;
      const max = opts?.max || 100;
      const precision = opts?.precision || 2;
      const value = Math.random() * (max - min) + min;
      return parseFloat(value.toFixed(precision));
    }
  },
  location: {
    latitude: (opts) => {
      const min = opts?.min || 33;
      const max = opts?.max || 38;
      return parseFloat((Math.random() * (max - min) + min).toFixed(6));
    },
    longitude: (opts) => {
      const min = opts?.min || 126;
      const max = opts?.max || 130;
      return parseFloat((Math.random() * (max - min) + min).toFixed(6));
    }
  },
  company: {
    name: () => `테스트 센터 ${Math.floor(Math.random() * 1000)}`
  },
  location: {
    streetAddress: () => '서울시 강남구 테헤란로 123',
    city: () => '서울시',
    state: () => '서울',
    zipCode: () => '12345',
    latitude: () => parseFloat((37.5 + Math.random()).toFixed(6)),
    longitude: () => parseFloat((127 + Math.random()).toFixed(6))
  },
  phone: {
    number: () => '02-1234-5678'
  },
  internet: {
    url: () => 'https://example.com',
    email: () => 'test@example.com'
  },
  date: {
    recent: () => new Date(),
    past: () => new Date(Date.now() - 86400000 * 30),
    future: () => new Date(Date.now() + 86400000 * 30)
  },
  helpers: {
    arrayElement: (arr) => arr[Math.floor(Math.random() * arr.length)],
    arrayElements: (arr, count) => {
      const n = count || Math.floor(Math.random() * arr.length) + 1;
      const result = [];
      for (let i = 0; i < n; i++) {
        result.push(arr[Math.floor(Math.random() * arr.length)]);
      }
      return result;
    }
  },
  word: {
    words: (count = 3) => {
      const words = ['테스트', '샘플', '데이터', '모의', '예제'];
      return Array.from({ length: count }, () =>
        words[Math.floor(Math.random() * words.length)]
      ).join(' ');
    }
  }
};

module.exports = { faker };
