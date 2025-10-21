/**
 * Test Data Fixtures
 * E2E 테스트용 테스트 데이터
 */

export const testCenters = {
  // 유효한 센터 데이터 (모든 필드 포함)
  valid: {
    id: 1,
    center_name: '서울시 정신건강복지센터',
    center_type: '정신건강복지센터',
    contact: {
      phone: '02-1234-5678',
      road_address: '서울특별시 중구 세종대로 110',
      jibun_address: '서울특별시 중구 태평로1가 31',
    },
    location: {
      latitude: 37.5665,
      longitude: 126.9780,
      distance: 500,
    },
    business_content: '서울시민의 정신건강 증진을 위한 종합 상담 및 지원 서비스를 제공합니다.',
    stats: {
      avg_rating: 4.5,
      review_count: 23,
      view_count: 1024,
      favorite_count: 45,
    },
  },

  // 전화번호 없는 센터
  noPhone: {
    id: 2,
    center_name: '강남구 정신건강복지센터',
    center_type: '정신건강복지센터',
    contact: {
      phone: null,
      road_address: '서울특별시 강남구 테헤란로 123',
      jibun_address: null,
    },
    location: {
      latitude: 37.4979,
      longitude: 127.0276,
      distance: 1200,
    },
    business_content: '강남구민의 정신건강 증진을 위한 서비스를 제공합니다.',
    stats: {
      avg_rating: 4.2,
      review_count: 15,
      view_count: 512,
      favorite_count: 22,
    },
  },

  // 최소 정보만 있는 센터
  minimal: {
    id: 3,
    center_name: '송파구 정신건강복지센터',
    center_type: '정신건강복지센터',
    contact: {
      phone: '02-9876-5432',
      road_address: '서울특별시 송파구 올림픽로 326',
      jibun_address: null,
    },
    location: {
      latitude: 37.5146,
      longitude: 127.1060,
      distance: null,
    },
    business_content: null,
    stats: {
      avg_rating: 0,
      review_count: 0,
      view_count: 0,
      favorite_count: 0,
    },
  },

  // 존재하지 않는 센터 ID
  invalid: {
    id: 999999,
  },
};

/**
 * 테스트용 사용자 위치
 */
export const testLocations = {
  // 서울 시청 근처
  seoulCityHall: {
    lat: 37.5665,
    lng: 126.9780,
  },

  // 강남역 근처
  gangnamStation: {
    lat: 37.4979,
    lng: 127.0276,
  },
};

/**
 * 반응형 뷰포트 설정
 */
export const viewports = {
  mobile: {
    width: 375,
    height: 667,
  },
  mobileLarge: {
    width: 428,
    height: 926,
  },
  tablet: {
    width: 768,
    height: 1024,
  },
  desktop: {
    width: 1920,
    height: 1080,
  },
  desktopWide: {
    width: 2560,
    height: 1440,
  },
};

/**
 * 접근성 테스트용 키보드 키
 */
export const keyboardKeys = {
  tab: 'Tab',
  enter: 'Enter',
  space: 'Space',
  escape: 'Escape',
  arrowDown: 'ArrowDown',
  arrowUp: 'ArrowUp',
};

/**
 * 에러 메시지
 */
export const errorMessages = {
  notFound: '센터를 찾을 수 없습니다',
  serverError: '일시적인 오류가 발생했습니다',
  networkError: '네트워크 연결을 확인해주세요',
};

/**
 * 성공 메시지
 */
export const successMessages = {
  addressCopied: '주소가 복사되었습니다',
};
