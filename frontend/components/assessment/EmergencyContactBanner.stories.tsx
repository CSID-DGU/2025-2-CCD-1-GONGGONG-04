/**
 * EmergencyContactBanner Storybook Stories
 * Sprint 3 - Task 3.2.4
 */

import type { Meta, StoryObj } from '@storybook/react';
import { EmergencyContactBanner } from './EmergencyContactBanner';
import type { EmergencyContactInfo } from './EmergencyContactBanner';

const defaultContactInfo: EmergencyContactInfo = {
  suicidePrevention: '1393',
  mentalHealthCrisis: '1577-0199',
  emergency: '119',
};

const meta = {
  title: 'Assessment/EmergencyContactBanner',
  component: EmergencyContactBanner,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    show: {
      control: { type: 'boolean' },
      description: '표시 여부 (HIGH 심각도일 때만 true)',
    },
    contactInfo: {
      control: { type: 'object' },
      description: '긴급 연락처 정보',
    },
  },
} satisfies Meta<typeof EmergencyContactBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 표시됨 (show=true)
 */
export const Visible: Story = {
  args: {
    show: true,
    contactInfo: defaultContactInfo,
  },
  parameters: {
    docs: {
      description: {
        story: 'HIGH 심각도일 때 표시되는 긴급 연락처 배너. 자살예방 상담전화, 정신건강 위기상담전화, 응급전화가 표시됩니다.',
      },
    },
  },
};

/**
 * 숨겨짐 (show=false)
 */
export const Hidden: Story = {
  args: {
    show: false,
    contactInfo: defaultContactInfo,
  },
  parameters: {
    docs: {
      description: {
        story: 'show=false일 때는 아무것도 렌더링하지 않습니다. LOW/MID 심각도에서 사용됩니다.',
      },
    },
  },
};

/**
 * 커스텀 연락처 정보
 */
export const CustomContactInfo: Story = {
  args: {
    show: true,
    contactInfo: {
      suicidePrevention: '02-123-4567',
      mentalHealthCrisis: '1588-9999',
      emergency: '911',
    },
  },
  parameters: {
    docs: {
      description: {
        story: '다른 지역이나 국가에서 사용할 수 있도록 커스텀 연락처 정보를 설정한 예시',
      },
    },
  },
};

/**
 * 모바일 뷰
 */
export const Mobile: Story = {
  args: {
    show: true,
    contactInfo: defaultContactInfo,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: '모바일 화면에서의 긴급 연락처 배너. 카드가 세로로 쌓이며 터치하기 쉬운 크기로 표시됩니다.',
      },
    },
  },
};

/**
 * 태블릿 뷰
 */
export const Tablet: Story = {
  args: {
    show: true,
    contactInfo: defaultContactInfo,
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: '태블릿 화면에서의 긴급 연락처 배너',
      },
    },
  },
};
