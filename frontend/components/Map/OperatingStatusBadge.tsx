/**
 * OperatingStatusBadge 컴포넌트
 *
 * 센터의 현재 운영 상태를 시각적 배지로 표시합니다
 * - 상태별 색상 및 아이콘 구분
 * - WCAG AA 접근성 기준 준수
 * - 색상 + 아이콘 + 텍스트 조합으로 정보 전달
 *
 * @component
 */

import * as React from 'react';
import { Check, Clock, X, Calendar, AlertCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * 운영 상태 타입
 */
export type OperatingStatus =
  | 'OPEN'
  | 'CLOSING_SOON'
  | 'CLOSED'
  | 'HOLIDAY'
  | 'TEMP_CLOSED'
  | 'NO_INFO';

/**
 * OperatingStatusBadge Props
 */
export interface OperatingStatusBadgeProps {
  /** 운영 상태 */
  status: OperatingStatus;
  /** 마감 시간 (OPEN, CLOSING_SOON일 때) */
  closingTime?: string | null;
  /** 다음 운영 날짜 (CLOSED, HOLIDAY, TEMP_CLOSED일 때) */
  nextOpenDate?: string | null;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 상태별 설정
 */
const STATUS_CONFIG = {
  OPEN: {
    icon: Check,
    label: '영업중',
    className: 'bg-green-100 text-green-700 border-green-300',
    iconClassName: 'text-green-700',
    animate: true,
  },
  CLOSING_SOON: {
    icon: Clock,
    label: '곧 마감',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    iconClassName: 'text-yellow-700',
    animate: true,
  },
  CLOSED: {
    icon: AlertCircle,
    label: '영업종료',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    iconClassName: 'text-gray-700',
    animate: false,
  },
  HOLIDAY: {
    icon: Calendar,
    label: '휴무일',
    className: 'bg-gray-100 text-gray-700 border-gray-300',
    iconClassName: 'text-gray-700',
    animate: false,
  },
  TEMP_CLOSED: {
    icon: X,
    label: '임시휴무',
    className: 'bg-red-100 text-red-700 border-red-300',
    iconClassName: 'text-red-700',
    animate: false,
  },
  NO_INFO: {
    icon: Info,
    label: '정보없음',
    className: 'bg-transparent text-gray-600 border-gray-400',
    iconClassName: 'text-gray-600',
    animate: false,
  },
} as const;

/**
 * OperatingStatusBadge 컴포넌트
 *
 * @example
 * ```tsx
 * <OperatingStatusBadge status="OPEN" closingTime="18:00" />
 * <OperatingStatusBadge status="CLOSED" nextOpenDate="2025-01-16" />
 * ```
 */
export function OperatingStatusBadge({
  status,
  closingTime,
  nextOpenDate,
  className,
}: OperatingStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const IconComponent = config.icon;

  /**
   * 상태별 메시지 생성
   */
  const getMessage = () => {
    switch (status) {
      case 'OPEN':
        return closingTime ? `${config.label} · ${closingTime} 마감` : config.label;
      case 'CLOSING_SOON':
        return closingTime ? `${config.label} · ${closingTime} 마감` : config.label;
      case 'CLOSED':
        return nextOpenDate
          ? `${config.label} · ${nextOpenDate} 오픈`
          : config.label;
      case 'HOLIDAY':
        return nextOpenDate
          ? `${config.label} · ${nextOpenDate} 오픈`
          : config.label;
      case 'TEMP_CLOSED':
        return nextOpenDate
          ? `${config.label} · ${nextOpenDate}부터`
          : config.label;
      case 'NO_INFO':
        return config.label;
      default:
        return config.label;
    }
  };

  const message = getMessage();

  /**
   * 스크린 리더용 상태 메시지
   */
  const getAriaLabel = () => {
    return `현재 상태: ${message}`;
  };

  return (
    <Badge
      role="status"
      aria-label={getAriaLabel()}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border',
        config.className,
        className
      )}
    >
      <IconComponent
        className={cn(
          'h-3.5 w-3.5',
          config.iconClassName,
          config.animate && 'animate-pulse'
        )}
        aria-hidden="true"
      />
      <span>{message}</span>
    </Badge>
  );
}
