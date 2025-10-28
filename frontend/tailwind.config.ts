import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // 커스텀 색상 팔레트
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // 마음이음 브랜드 색상
        lavender: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7', // 메인 브랜드 색상
          600: '#9333EA',
          700: '#7E22CE',
          800: '#6B21A8',
          900: '#581C87',
          950: '#3B0764',
        },
        
        // 기능별 색상
        status: {
          operating: '#10B981', // 운영중 (초록)
          closed: '#9CA3AF',    // 마감 (회색)
          emergency: '#EF4444', // 긴급 (빨강)
          warning: '#F59E0B',   // 경고 (주황)
        },
        
        // 기존 shadcn 색상 유지
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      
      // 커스텀 폰트 패밀리
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
        display: ['Pretendard', 'sans-serif'],
      },
      
      // 커스텀 폰트 사이즈 (rem 기반)
      fontSize: {
        'h1': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }], // 28px
        'h2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],     // 24px
        'h3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 20px
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],   // 16px
        'small': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // 14px
        'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],   // 12px
      },
      
      // 커스텀 border radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // 마음이음 커스텀
        'card': '1rem',      // 16px - 카드 컴포넌트용
        'button': '0.75rem', // 12px - 버튼 컴포넌트용
        'icon': '0.5rem',    // 8px - 아이콘 컨테이너용
      },
      
      // 커스텀 그림자
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'hover': '0 6px 16px rgba(0, 0, 0, 0.12)',
        'lavender': '0 4px 14px rgba(168, 85, 247, 0.25)',
      },
      
      // 커스텀 spacing
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      
      // 커스텀 애니메이션
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // 마음이음 커스텀 애니메이션
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config