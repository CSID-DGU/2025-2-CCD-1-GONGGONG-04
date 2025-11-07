/**
 * EmergencyContactBanner Component
 * 심각도 HIGH일 때 표시되는 긴급 연락처 배너
 *
 * Sprint 3 - Task 3.2.4
 *
 * @example
 * ```tsx
 * <EmergencyContactBanner
 *   show={severityCode === 'HIGH'}
 *   contactInfo={{
 *     suicidePrevention: '1393',
 *     mentalHealthCrisis: '1577-0199',
 *     emergency: '119'
 *   }}
 * />
 * ```
 */

'use client';

import { Phone, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// ============================================
// 타입 정의
// ============================================

export interface EmergencyContactInfo {
  /** 자살예방 상담전화 */
  suicidePrevention: string;
  /** 정신건강 위기상담전화 */
  mentalHealthCrisis: string;
  /** 응급전화 */
  emergency: string;
}

export interface EmergencyContactBannerProps {
  /** 표시 여부 (HIGH 심각도일 때만 true) */
  show: boolean;
  /** 긴급 연락처 정보 */
  contactInfo: EmergencyContactInfo;
}

// ============================================
// 컴포넌트
// ============================================

export function EmergencyContactBanner({ show, contactInfo }: EmergencyContactBannerProps) {
  if (!show) {
    return null;
  }

  return (
    <Card className="bg-red-50 border-2 border-red-200" role="alert" aria-live="assertive">
      <CardContent className="pt-6 pb-6">
        <div className="space-y-4">
          {/* 경고 메시지 */}
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <h3 className="text-h3 font-bold text-red-900">즉시 전문의 진료가 필요합니다</h3>
              <p className="text-body text-red-800">
                심각한 정신적 고통을 겪고 계신 것으로 보입니다. 혼자 고민하지 마시고 전문가의 도움을 받으세요.
              </p>
            </div>
          </div>

          {/* 긴급 연락처 목록 */}
          <div className="space-y-3">
            <h4 className="text-body font-semibold text-red-900">긴급 연락처</h4>
            <div className="space-y-2">
              {/* 자살예방 상담전화 */}
              <a
                href={`tel:${contactInfo.suicidePrevention.replace(/-/g, '')}`}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-lavender-500"
                aria-label={`자살예방 상담전화 ${contactInfo.suicidePrevention}번으로 전화하기`}
              >
                <Phone className="h-5 w-5 text-red-600" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-small font-semibold text-red-900">자살예방 상담전화</p>
                  <p className="text-h3 font-bold text-red-600">{contactInfo.suicidePrevention}</p>
                </div>
              </a>

              {/* 정신건강 위기상담전화 */}
              <a
                href={`tel:${contactInfo.mentalHealthCrisis.replace(/-/g, '')}`}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-lavender-500"
                aria-label={`정신건강 위기상담전화 ${contactInfo.mentalHealthCrisis}번으로 전화하기`}
              >
                <Phone className="h-5 w-5 text-red-600" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-small font-semibold text-red-900">정신건강 위기상담전화</p>
                  <p className="text-h3 font-bold text-red-600">{contactInfo.mentalHealthCrisis}</p>
                </div>
              </a>

              {/* 응급전화 */}
              <a
                href={`tel:${contactInfo.emergency.replace(/-/g, '')}`}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-lavender-500"
                aria-label={`응급전화 ${contactInfo.emergency}번으로 전화하기`}
              >
                <Phone className="h-5 w-5 text-red-600" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-small font-semibold text-red-900">응급전화</p>
                  <p className="text-h3 font-bold text-red-600">{contactInfo.emergency}</p>
                </div>
              </a>
            </div>
          </div>

          {/* 추가 안내 */}
          <div className="text-small text-red-800">
            <p>
              <strong>긴급한 상황에서는 주저하지 말고 위 번호로 전화하세요.</strong> 24시간 무료로 전문 상담을 받으실 수 있습니다.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
