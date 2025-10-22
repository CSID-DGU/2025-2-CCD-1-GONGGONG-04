/**
 * 마음이음 - 운영 상태 배지 컴포넌트
 *
 * Sprint 2: 통합 정보 제공 - 실시간 운영 상태 표시
 *
 * @description 센터의 운영 상태를 시각적으로 표시하는 배지 컴포넌트
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Info,
} from 'lucide-react';
import type { OperatingStatus, BadgeSize } from '@/types/operatingStatus';

/**
 * 운영 상태 배지 Props
 */
export interface OperatingStatusBadgeProps {
  /** 운영 상태 */
  status: OperatingStatus;
  /** 상태 메시지 (선택) */
  message?: string;
  /** 아이콘 표시 여부 (기본값: true) */
  showIcon?: boolean;
  /** 배지 크기 */
  size?: BadgeSize;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 상태별 설정
 */
const statusConfig: Record<
  OperatingStatus,
  {
    variant: 'default' | 'operating' | 'closed' | 'emergency' | 'secondary';
    label: string;
    icon: React.ElementType;
    ariaLabel: string;
  }
> = {
  NO_INFO: {
    variant: 'secondary',
    label: '정보 없음',
    icon: Info,
    ariaLabel: '운영 정보 없음',
  },
  TEMP_CLOSED: {
    variant: 'emergency',
    label: '임시 휴무',
    icon: XCircle,
    ariaLabel: '임시 휴무 중',
  },
  HOLIDAY: {
    variant: 'closed',
    label: '휴무일',
    icon: Calendar,
    ariaLabel: '휴무일',
  },
  OPEN: {
    variant: 'operating',
    label: '운영 중',
    icon: CheckCircle,
    ariaLabel: '현재 운영 중',
  },
  CLOSING_SOON: {
    variant: 'default',
    label: '곧 마감',
    icon: Clock,
    ariaLabel: '곧 마감 예정',
  },
  CLOSED: {
    variant: 'closed',
    label: '마감',
    icon: AlertCircle,
    ariaLabel: '운영 종료',
  },
};

/**
 * 크기별 스타일
 */
const sizeStyles: Record<BadgeSize, { text: string; icon: string }> = {
  sm: {
    text: 'text-xs',
    icon: 'h-3 w-3',
  },
  md: {
    text: 'text-sm',
    icon: 'h-3.5 w-3.5',
  },
  lg: {
    text: 'text-base',
    icon: 'h-4 w-4',
  },
};

/**
 * 운영 상태 배지 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <OperatingStatusBadge status="OPEN" />
 *
 * // 메시지 포함
 * <OperatingStatusBadge
 *   status="CLOSING_SOON"
 *   message="18:00 마감"
 * />
 *
 * // 아이콘 없이, 큰 크기
 * <OperatingStatusBadge
 *   status="HOLIDAY"
 *   showIcon={false}
 *   size="lg"
 * />
 * ```
 */
export const OperatingStatusBadge: React.FC<OperatingStatusBadgeProps> = ({
  status,
  message,
  showIcon = true,
  size = 'md',
  className,
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  const sizeStyle = sizeStyles[size];

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1',
        sizeStyle.text,
        className
      )}
      aria-label={message || config.ariaLabel}
    >
      {showIcon && <Icon className={cn(sizeStyle.icon)} aria-hidden="true" />}
      <span>{message || config.label}</span>
    </Badge>
  );
};

OperatingStatusBadge.displayName = 'OperatingStatusBadge';
