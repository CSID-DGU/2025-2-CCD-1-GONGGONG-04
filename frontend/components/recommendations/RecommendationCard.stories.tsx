import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { RecommendationCard } from './RecommendationCard';
import type { CenterRecommendation } from '@/lib/api/recommendations';

const meta = {
  title: 'Recommendations/RecommendationCard',
  component: RecommendationCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    rank: {
      control: { type: 'number', min: 1, max: 20 },
      description: '추천 순위 (1부터 시작)',
    },
    onClick: { action: 'card-clicked' },
    onFavoriteClick: { action: 'favorite-clicked' },
    isFavorite: {
      control: 'boolean',
      description: '즐겨찾기 여부',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-2xl w-full p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RecommendationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 추천 데이터
 */
const baseRecommendation: CenterRecommendation = {
  centerId: '1',
  centerName: '서울시 중구 정신건강복지센터',
  totalScore: 85.5,
  scores: {
    distance: 95,
    operating: 90,
    specialty: 75,
    program: 80,
  },
  reasons: [
    '가까운 거리 (500m)',
    '현재 운영 중 (평일 09:00-18:00)',
    '정신건강의학과 전문의 2명 보유',
  ],
  center: {
    roadAddress: '서울특별시 중구 을지로 100',
    phoneNumber: '02-1234-5678',
    distance: 500,
    walkTime: '도보 7분',
  },
};

/**
 * 기본 추천 카드 (1순위)
 */
export const Default: Story = {
  args: {
    recommendation: baseRecommendation,
    rank: 1,
    onClick: fn(),
    onFavoriteClick: fn(),
    isFavorite: false,
  },
};

/**
 * 최우수 점수 (90점 이상)
 */
export const HighScore: Story = {
  args: {
    recommendation: {
      ...baseRecommendation,
      centerName: '강남 정신건강의학과의원',
      totalScore: 92.3,
      scores: {
        distance: 98,
        operating: 95,
        specialty: 90,
        program: 85,
      },
      reasons: [
        '매우 가까운 거리 (200m)',
        '24시간 운영',
        '정신건강의학과 전문의 5명 보유',
      ],
      center: {
        roadAddress: '서울특별시 강남구 테헤란로 123',
        phoneNumber: '02-2000-3000',
        distance: 200,
        walkTime: '도보 3분',
      },
    },
    rank: 1,
    onClick: fn(),
    onFavoriteClick: fn(),
  },
};

/**
 * 중간 점수 (70-80점)
 */
export const MediumScore: Story = {
  args: {
    recommendation: {
      ...baseRecommendation,
      centerName: '마포구 정신건강증진센터',
      totalScore: 75.8,
      scores: {
        distance: 80,
        operating: 75,
        specialty: 70,
        program: 78,
      },
      reasons: [
        '가까운 거리 (1.2km)',
        '다양한 프로그램 제공 (15개)',
        '무료 상담 가능',
      ],
      center: {
        roadAddress: '서울특별시 마포구 마포대로 45',
        phoneNumber: '02-3100-4200',
        distance: 1200,
        walkTime: '도보 15분',
      },
    },
    rank: 3,
    onClick: fn(),
    onFavoriteClick: fn(),
  },
};

/**
 * 낮은 점수 (60-70점)
 */
export const LowScore: Story = {
  args: {
    recommendation: {
      ...baseRecommendation,
      centerName: '은평구 정신건강복지센터',
      totalScore: 68.2,
      scores: {
        distance: 65,
        operating: 70,
        specialty: 68,
        program: 70,
      },
      reasons: [
        '주말 운영 (토요일 09:00-13:00)',
        '청소년 프로그램 매칭',
      ],
      center: {
        roadAddress: '서울특별시 은평구 은평로 88',
        phoneNumber: '02-4500-6700',
        distance: 3500,
        walkTime: '도보 44분',
      },
    },
    rank: 5,
    onClick: fn(),
    onFavoriteClick: fn(),
  },
};

/**
 * 즐겨찾기된 상태
 */
export const Favorited: Story = {
  args: {
    recommendation: baseRecommendation,
    rank: 1,
    onClick: fn(),
    onFavoriteClick: fn(),
    isFavorite: true,
  },
};

/**
 * 전화번호 없음
 */
export const NoPhone: Story = {
  args: {
    recommendation: {
      ...baseRecommendation,
      centerName: '용산구 정신건강복지센터',
      center: {
        ...baseRecommendation.center,
        roadAddress: '서울특별시 용산구 한강대로 405',
        phoneNumber: null,
      },
    },
    rank: 2,
    onClick: fn(),
    onFavoriteClick: fn(),
  },
};

/**
 * 긴 주소
 */
export const LongAddress: Story = {
  args: {
    recommendation: {
      ...baseRecommendation,
      centerName: '서울특별시 송파구 정신건강복지센터 및 자살예방센터',
      center: {
        ...baseRecommendation.center,
        roadAddress: '서울특별시 송파구 올림픽로 345 송파구민회관 지하1층 정신건강복지센터 사무실',
        phoneNumber: '02-2147-3142',
      },
    },
    rank: 4,
    onClick: fn(),
    onFavoriteClick: fn(),
  },
};

/**
 * 먼 거리 (10km 이상)
 */
export const FarDistance: Story = {
  args: {
    recommendation: {
      ...baseRecommendation,
      centerName: '노원구 정신건강복지센터',
      totalScore: 62.5,
      scores: {
        distance: 45,
        operating: 75,
        specialty: 70,
        program: 80,
      },
      reasons: [
        '다양한 프로그램 제공 (20개)',
        '야간 상담 가능 (평일 20:00까지)',
      ],
      center: {
        roadAddress: '서울특별시 노원구 노원로 555',
        phoneNumber: '02-5678-9012',
        distance: 12000,
        walkTime: '도보 2시간 30분',
      },
    },
    rank: 8,
    onClick: fn(),
    onFavoriteClick: fn(),
  },
};

/**
 * 추천 이유 1개만 있는 경우
 */
export const SingleReason: Story = {
  args: {
    recommendation: {
      ...baseRecommendation,
      centerName: '종로구 정신건강복지센터',
      totalScore: 70.0,
      scores: {
        distance: 85,
        operating: 60,
        specialty: 65,
        program: 70,
      },
      reasons: [
        '가까운 거리 (800m)',
      ],
      center: {
        roadAddress: '서울특별시 종로구 종로 99',
        phoneNumber: '02-7000-8000',
        distance: 800,
        walkTime: '도보 10분',
      },
    },
    rank: 6,
    onClick: fn(),
    onFavoriteClick: fn(),
  },
};

/**
 * 2순위 추천
 */
export const SecondRank: Story = {
  args: {
    recommendation: {
      ...baseRecommendation,
      centerName: '서초구 정신건강복지센터',
      totalScore: 83.7,
      scores: {
        distance: 88,
        operating: 85,
        specialty: 80,
        program: 82,
      },
      reasons: [
        '가까운 거리 (600m)',
        '현재 운영 중',
        '임상심리사 3명 보유',
      ],
      center: {
        roadAddress: '서울특별시 서초구 서초대로 200',
        phoneNumber: '02-3000-4000',
        distance: 600,
        walkTime: '도보 8분',
      },
    },
    rank: 2,
    onClick: fn(),
    onFavoriteClick: fn(),
  },
};

/**
 * 모바일 뷰포트 (Small)
 */
export const Mobile: Story = {
  args: {
    recommendation: baseRecommendation,
    rank: 1,
    onClick: fn(),
    onFavoriteClick: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * 태블릿 뷰포트 (Medium)
 */
export const Tablet: Story = {
  args: {
    recommendation: baseRecommendation,
    rank: 1,
    onClick: fn(),
    onFavoriteClick: fn(),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
