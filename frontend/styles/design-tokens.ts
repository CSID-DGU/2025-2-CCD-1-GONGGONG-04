// design-tokens.ts - 디자인 시스템 상수 정의
export const DesignTokens = {
  // 색상 팔레트
  colors: {
    primary: {
      main: 'lavender-500',
      light: 'lavender-100',
      dark: 'lavender-700',
      gradient: 'gradient-lavender',
      softGradient: 'gradient-lavender-soft'
    },
    semantic: {
      operating: 'status-operating',
      closed: 'status-closed',
      emergency: 'status-emergency',
      warning: 'status-warning'
    },
    neutral: {
      background: 'white',
      surface: 'gray-50',
      border: 'gray-200',
      text: {
        primary: 'gray-900',
        secondary: 'gray-600',
        disabled: 'gray-400'
      }
    }
  },

  // 타이포그래피
  typography: {
    heading: {
      h1: 'text-h1',     // 28px, font-weight: 700
      h2: 'text-h2',     // 24px, font-weight: 600
      h3: 'text-h3',     // 20px, font-weight: 600
    },
    body: {
      default: 'text-body',   // 16px, font-weight: 400
      small: 'text-small',    // 14px, font-weight: 400
      caption: 'text-caption' // 12px, font-weight: 400
    }
  },

  // 그림자
  shadows: {
    soft: 'shadow-soft',       // 0 2px 8px rgba(0, 0, 0, 0.08)
    card: 'shadow-card',       // 0 4px 12px rgba(0, 0, 0, 0.1)
    hover: 'shadow-hover',     // 0 6px 16px rgba(0, 0, 0, 0.12)
    lavender: 'shadow-lavender' // 0 4px 14px rgba(168, 85, 247, 0.25)
  },

  // 반경
  radius: {
    card: 'rounded-card',       // 16px
    button: 'rounded-button',   // 12px
    icon: 'rounded-icon',       // 8px
    full: 'rounded-full'
  },

  // 간격
  spacing: {
    xs: 'p-2',  // 8px
    sm: 'p-3',  // 12px
    md: 'p-4',  // 16px
    lg: 'p-6',  // 24px
    xl: 'p-8'   // 32px
  }
}