import type { Meta, StoryObj } from '@storybook/react';
import MainLayout from './MainLayout';

const meta = {
  title: 'Layout/MainLayout',
  component: MainLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: '페이지 제목 (헤더에 표시됨)',
    },
    showBackButton: {
      control: 'boolean',
      description: '뒤로가기 버튼 표시 여부',
    },
    showBottomNav: {
      control: 'boolean',
      description: '하단 네비게이션 표시 여부',
    },
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
} satisfies Meta<typeof MainLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 레이아웃: 제목 없음, 하단 네비게이션만 표시
 */
export const Default: Story = {
  args: {
    children: (
      <div className="p-8">
        <h2 className="text-h2 font-semibold mb-4">페이지 내용</h2>
        <p className="text-body text-neutral-600">
          기본 레이아웃 예시입니다. 하단 네비게이션만 표시됩니다.
        </p>
      </div>
    ),
  },
};

/**
 * 제목이 있는 레이아웃: 상단에 제목 헤더 표시
 */
export const WithTitle: Story = {
  args: {
    title: '센터 상세',
    children: (
      <div className="p-8">
        <div className="space-y-4">
          <div className="bg-neutral-100 rounded-card p-4">
            <h3 className="text-h3 font-semibold mb-2">강남구정신건강복지센터</h3>
            <p className="text-small text-neutral-600">
              서울특별시 강남구 논현로 508 (역삼동)
            </p>
          </div>
          <p className="text-body text-neutral-700">
            센터 정보가 표시되는 영역입니다.
          </p>
        </div>
      </div>
    ),
  },
};

/**
 * 뒤로가기 버튼이 있는 레이아웃: 상세 페이지나 폼 페이지에서 사용
 */
export const WithBackButton: Story = {
  args: {
    title: '리뷰 작성',
    showBackButton: true,
    children: (
      <div className="p-8">
        <form className="space-y-6">
          <div>
            <label className="block text-small font-medium text-neutral-700 mb-2">
              평점
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="w-10 h-10 bg-neutral-100 rounded-button hover:bg-lavender-100"
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-small font-medium text-neutral-700 mb-2">
              리뷰 내용
            </label>
            <textarea
              className="w-full h-32 p-3 border border-neutral-200 rounded-button"
              placeholder="센터 이용 후기를 작성해주세요"
            />
          </div>
        </form>
      </div>
    ),
  },
};

/**
 * 하단 네비게이션 없는 레이아웃: 상세 페이지, 설정 페이지 등
 */
export const WithoutBottomNav: Story = {
  args: {
    title: '설정',
    showBottomNav: false,
    children: (
      <div className="p-8">
        <div className="space-y-4">
          <button className="w-full text-left p-4 bg-white border border-neutral-200 rounded-card hover:bg-neutral-50">
            <span className="text-body font-medium">알림 설정</span>
          </button>
          <button className="w-full text-left p-4 bg-white border border-neutral-200 rounded-card hover:bg-neutral-50">
            <span className="text-body font-medium">개인정보 처리방침</span>
          </button>
          <button className="w-full text-left p-4 bg-white border border-neutral-200 rounded-card hover:bg-neutral-50">
            <span className="text-body font-medium">로그아웃</span>
          </button>
        </div>
      </div>
    ),
  },
};

/**
 * 긴 콘텐츠가 있는 레이아웃: 스크롤 테스트
 */
export const LongContent: Story = {
  args: {
    title: '이용 가이드',
    showBackButton: true,
    children: (
      <div className="p-8 space-y-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-neutral-100 rounded-card p-6">
            <h3 className="text-h3 font-semibold mb-3">섹션 {i + 1}</h3>
            <p className="text-body text-neutral-700 leading-relaxed">
              마음이음 서비스는 전국의 정신건강복지센터 정보를 한 곳에서 확인할 수 있는
              통합 플랫폼입니다. 지도 검색, 센터 목록, 자가진단 기능을 제공하여 사용자가
              쉽게 정신건강 서비스에 접근할 수 있도록 돕습니다.
            </p>
          </div>
        ))}
      </div>
    ),
  },
};
