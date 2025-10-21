import type { Meta, StoryObj } from '@storybook/react';
import { CenterContactInfo } from './CenterContactInfo';

const meta: Meta<typeof CenterContactInfo> = {
  title: 'Center/CenterContactInfo',
  component: CenterContactInfo,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onCall: { action: 'called' },
    onDirections: { action: 'directions opened' },
  },
};

export default meta;
type Story = StoryObj<typeof CenterContactInfo>;

/**
 * 기본 상태 - 모든 정보 포함
 */
export const Default: Story = {
  args: {
    phone: '02-1234-5678',
    roadAddress: '서울특별시 강남구 테헤란로 123',
    jibunAddress: '역삼동 456-78',
    latitude: 37.5013,
    longitude: 127.0396,
    distance: 1200,
  },
};

/**
 * 전화번호 없는 경우
 */
export const NoPhone: Story = {
  args: {
    phone: null,
    roadAddress: '서울특별시 서초구 반포대로 58',
    jibunAddress: '서초동 1234-5',
    latitude: 37.4965,
    longitude: 127.0043,
    distance: 850,
  },
};

/**
 * 지번 주소 없는 경우
 */
export const NoJibunAddress: Story = {
  args: {
    phone: '02-9876-5432',
    roadAddress: '서울특별시 송파구 올림픽로 300',
    jibunAddress: null,
    latitude: 37.5145,
    longitude: 127.1031,
    distance: 2500,
  },
};

/**
 * 거리 정보 없는 경우
 */
export const NoDistance: Story = {
  args: {
    phone: '031-123-4567',
    roadAddress: '경기도 성남시 분당구 판교역로 231',
    jibunAddress: '삼평동 680',
    latitude: 37.3952,
    longitude: 127.1108,
  },
};

/**
 * 매우 긴 주소
 */
export const LongAddress: Story = {
  args: {
    phone: '02-1234-5678',
    roadAddress:
      '서울특별시 강남구 테헤란로 152길 13, 강남파이낸스센터 15층 1501호',
    jibunAddress: '역삼동 823-15, 강남파이낸스센터 15층 1501호',
    latitude: 37.5013,
    longitude: 127.0396,
    distance: 500,
  },
};

/**
 * 가까운 거리 (1km 미만)
 */
export const CloseDistance: Story = {
  args: {
    phone: '02-1234-5678',
    roadAddress: '서울특별시 강남구 강남대로 123',
    jibunAddress: '역삼동 100-1',
    latitude: 37.5013,
    longitude: 127.0396,
    distance: 350,
  },
};

/**
 * 먼 거리 (10km 이상)
 */
export const FarDistance: Story = {
  args: {
    phone: '032-123-4567',
    roadAddress: '인천광역시 남동구 인주대로 593',
    jibunAddress: '구월동 1234-56',
    latitude: 37.4485,
    longitude: 126.7324,
    distance: 45000,
  },
};

/**
 * 지역 전화번호 (3자리)
 */
export const RegionalPhone: Story = {
  args: {
    phone: '031-123-4567',
    roadAddress: '경기도 수원시 팔달구 인계로 178',
    jibunAddress: '인계동 1055',
    latitude: 37.2636,
    longitude: 127.0286,
    distance: 3200,
  },
};

/**
 * 휴대폰 번호
 */
export const MobilePhone: Story = {
  args: {
    phone: '010-1234-5678',
    roadAddress: '서울특별시 중구 세종대로 110',
    jibunAddress: '태평로1가 31',
    latitude: 37.5665,
    longitude: 126.978,
    distance: 1500,
  },
};

/**
 * 인터랙티브 예시 - 모든 기능
 */
export const Interactive: Story = {
  args: {
    phone: '02-1234-5678',
    roadAddress: '서울특별시 강남구 테헤란로 123',
    jibunAddress: '역삼동 456-78',
    latitude: 37.5013,
    longitude: 127.0396,
    distance: 1200,
  },
  parameters: {
    docs: {
      description: {
        story:
          '주소를 클릭하면 복사됩니다. 전화하기와 길찾기 버튼의 동작을 테스트할 수 있습니다.',
      },
    },
  },
};
