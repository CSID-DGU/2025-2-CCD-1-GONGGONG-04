/**
 * MarkerInfoPopup Storybook
 *
 * 지도 마커 클릭 시 표시되는 센터 정보 팝업의 다양한 상태를 시연합니다
 */

import type { Meta, StoryObj } from '@storybook/react';
import { MarkerInfoPopup } from './MarkerInfoPopup';
import { CenterMarkerData } from '@/lib/api/centers';
import { fn } from '@storybook/test';

const meta = {
  title: 'Map/MarkerInfoPopup',
  component: MarkerInfoPopup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '지도 마커 클릭 시 표시되는 센터 정보 팝업 카드입니다. 운영 상태, 평점, 거리, 전화번호 등 센터의 핵심 정보를 제공하고, 상세보기와 길찾기 액션을 지원합니다.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    center: {
      description: '센터 데이터',
      control: 'object',
    },
    onClose: {
      description: '닫기 버튼 클릭 핸들러',
      action: 'closed',
    },
    onNavigate: {
      description: '상세보기 버튼 클릭 핸들러',
      action: 'navigated',
    },
  },
  args: {
    onClose: fn(),
    onNavigate: fn(),
  },
} satisfies Meta<typeof MarkerInfoPopup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 센터 데이터
 */
const defaultCenter: CenterMarkerData = {
  id: 1,
  name: '서울시 정신건강복지센터',
  latitude: 37.5665,
  longitude: 126.978,
  distance: 800,
  walkTime: '10분',
  operatingStatus: 'OPEN',
  closingTime: '18:00',
  nextOpenDate: null,
  avgRating: 4.5,
  reviewCount: 42,
  centerType: '정신건강복지센터',
  roadAddress: '서울특별시 중구 세종대로 110',
  phoneNumber: '02-1234-5678',
};

/**
 * 기본 상태 (영업중)
 */
export const Default: Story = {
  args: {
    center: defaultCenter,
  },
};

/**
 * 곧 마감 상태
 */
export const ClosingSoon: Story = {
  args: {
    center: {
      ...defaultCenter,
      id: 2,
      name: '강남구 정신건강복지센터',
      operatingStatus: 'CLOSING_SOON',
      closingTime: '18:00',
      roadAddress: '서울특별시 강남구 테헤란로 123',
      distance: 1200,
      walkTime: '15분',
    },
  },
};

/**
 * 영업종료 상태
 */
export const Closed: Story = {
  args: {
    center: {
      ...defaultCenter,
      id: 3,
      name: '송파구 정신건강복지센터',
      operatingStatus: 'CLOSED',
      closingTime: null,
      nextOpenDate: '2025-01-16',
      roadAddress: '서울특별시 송파구 올림픽로 435',
      distance: 2500,
      walkTime: '30분',
    },
  },
};

/**
 * 휴무일 상태
 */
export const Holiday: Story = {
  args: {
    center: {
      ...defaultCenter,
      id: 4,
      name: '마포구 정신건강복지센터',
      operatingStatus: 'HOLIDAY',
      closingTime: null,
      nextOpenDate: '2025-01-17',
      roadAddress: '서울특별시 마포구 마포대로 183',
      distance: 3200,
      walkTime: '40분',
    },
  },
};

/**
 * 전화번호 없는 경우
 */
export const NoPhone: Story = {
  args: {
    center: {
      ...defaultCenter,
      id: 5,
      name: '용산구 정신건강복지센터',
      phoneNumber: null,
      roadAddress: '서울특별시 용산구 이태원로 243',
      distance: 650,
      walkTime: '8분',
    },
  },
};

/**
 * 높은 평점
 */
export const HighRating: Story = {
  args: {
    center: {
      ...defaultCenter,
      id: 6,
      name: '서초구 정신건강복지센터',
      avgRating: 4.9,
      reviewCount: 127,
      roadAddress: '서울특별시 서초구 서초대로 396',
      distance: 1800,
      walkTime: '22분',
    },
  },
};

/**
 * 낮은 평점
 */
export const LowRating: Story = {
  args: {
    center: {
      ...defaultCenter,
      id: 7,
      name: '양천구 정신건강복지센터',
      avgRating: 2.8,
      reviewCount: 15,
      roadAddress: '서울특별시 양천구 목동서로 159',
      distance: 5200,
      walkTime: '65분',
    },
  },
};

/**
 * 모바일 뷰포트
 */
export const Mobile: Story = {
  args: {
    center: defaultCenter,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * 임시휴무 상태
 */
export const TemporarilyClosed: Story = {
  args: {
    center: {
      ...defaultCenter,
      id: 8,
      name: '은평구 정신건강복지센터',
      operatingStatus: 'TEMP_CLOSED',
      closingTime: null,
      nextOpenDate: '2025-02-01',
      roadAddress: '서울특별시 은평구 통일로 810',
      distance: 8500,
      walkTime: '105분',
    },
  },
};

/**
 * 정보없음 상태
 */
export const NoInfo: Story = {
  args: {
    center: {
      ...defaultCenter,
      id: 9,
      name: '관악구 정신건강복지센터',
      operatingStatus: 'NO_INFO',
      closingTime: null,
      nextOpenDate: null,
      avgRating: 0,
      reviewCount: 0,
      phoneNumber: null,
      roadAddress: '서울특별시 관악구 관악로 145',
      distance: 6800,
      walkTime: '85분',
    },
  },
};
