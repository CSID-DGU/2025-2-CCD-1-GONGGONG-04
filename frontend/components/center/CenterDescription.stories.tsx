import type { Meta, StoryObj } from '@storybook/react';
import { CenterDescription } from './CenterDescription';

const meta: Meta<typeof CenterDescription> = {
  title: 'Center/CenterDescription',
  component: CenterDescription,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CenterDescription>;

/**
 * 기본 상태 - 일반적인 소개 내용
 */
export const Default: Story = {
  args: {
    businessContent:
      '우울증, 스트레스 상담 전문 센터입니다.\n전문 상담사가 함께합니다.',
    viewCount: 7890,
    favoriteCount: 456,
  },
};

/**
 * 소개 내용 없음 (빈 상태)
 */
export const NoContent: Story = {
  args: {
    businessContent: null,
    viewCount: 123,
    favoriteCount: 5,
  },
};

/**
 * 긴 소개 내용
 */
export const LongContent: Story = {
  args: {
    businessContent: `서울시립청소년상담복지센터는 청소년과 가족의 건강한 성장을 지원하기 위해 다양한 상담 서비스를 제공합니다.

주요 서비스:
- 개인상담: 학업, 진로, 대인관계, 정서문제 등
- 가족상담: 부모-자녀 관계개선, 가족 의사소통 향상
- 집단상담: 또래관계 향상, 자존감 증진 프로그램
- 위기개입: 24시간 긴급전화 1388

전문 상담사와 심리치료사가 청소년의 건강한 성장을 돕습니다.
평일 오전 9시부터 오후 6시까지 운영하며, 토요일은 오전만 운영합니다.`,
    viewCount: 15432,
    favoriteCount: 892,
  },
};

/**
 * 높은 조회수
 */
export const HighViews: Story = {
  args: {
    businessContent:
      '청소년 심리 상담 및 정신건강 증진을 위한 전문 센터입니다.\n가족 상담도 함께 진행합니다.',
    viewCount: 123456,
    favoriteCount: 5678,
  },
};

/**
 * 낮은 조회수 및 즐겨찾기
 */
export const LowStats: Story = {
  args: {
    businessContent:
      '신규 개설된 상담 센터입니다.\n청소년 및 학부모를 위한 상담 서비스를 제공합니다.',
    viewCount: 42,
    favoriteCount: 3,
  },
};

/**
 * 매우 짧은 소개
 */
export const ShortContent: Story = {
  args: {
    businessContent: '청소년 상담 전문 센터',
    viewCount: 1000,
    favoriteCount: 50,
  },
};

/**
 * 줄바꿈이 많은 내용
 */
export const MultilineContent: Story = {
  args: {
    businessContent: `청소년 심리 상담 센터

상담 분야:

학업 스트레스
대인관계 문제
진로 고민
가족 갈등

전문 상담사가 도와드립니다.`,
    viewCount: 3456,
    favoriteCount: 234,
  },
};

/**
 * 조회수는 많지만 즐겨찾기는 적음
 */
export const HighViewsLowFavorites: Story = {
  args: {
    businessContent:
      '다양한 청소년 프로그램을 운영하는 복합 상담 센터입니다.\n집단 상담 프로그램이 특화되어 있습니다.',
    viewCount: 98765,
    favoriteCount: 12,
  },
};

/**
 * 특수문자 포함 내용
 */
export const SpecialCharacters: Story = {
  args: {
    businessContent: `📞 긴급상담: 1388 (24시간)
💬 온라인상담: 카카오톡 @청소년상담
⏰ 운영시간: 평일 09:00~18:00

청소년의 마음건강을 지키는 전문 상담센터입니다.`,
    viewCount: 5432,
    favoriteCount: 321,
  },
};

/**
 * 인터랙티브 예시
 */
export const Interactive: Story = {
  args: {
    businessContent:
      '우울증, 스트레스, 불안 등 다양한 정신건강 문제에 대한 전문 상담을 제공합니다.\n개인상담 및 집단상담 프로그램이 운영되고 있습니다.',
    viewCount: 7890,
    favoriteCount: 456,
  },
  parameters: {
    docs: {
      description: {
        story:
          '센터 소개 내용이 표시되며, 조회수와 즐겨찾기 수가 아래에 함께 표시됩니다.',
      },
    },
  },
};
