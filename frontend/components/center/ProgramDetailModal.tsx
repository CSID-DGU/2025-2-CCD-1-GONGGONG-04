/**
 * ProgramDetailModal Component
 * 프로그램 상세 정보를 표시하는 모달 컴포넌트
 */

'use client';

import { Program } from '@/types/center';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface ProgramDetailModalProps {
  /**
   * 표시할 프로그램 정보 (null일 경우 모달 표시 안 함)
   */
  program: Program | null;

  /**
   * 모달 열림 상태
   */
  open: boolean;

  /**
   * 모달 열림 상태 변경 핸들러
   */
  onOpenChange: (open: boolean) => void;
}

/**
 * 프로그램 상세 모달 컴포넌트
 * - shadcn Dialog 컴포넌트 사용
 * - 프로그램 상세 정보 표시 (소개, 대상, 정원, 시간, 비용)
 * - ESC 키로 닫기
 * - 외부 클릭으로 닫기
 */
export function ProgramDetailModal({
  program,
  open,
  onOpenChange,
}: ProgramDetailModalProps) {
  if (!program) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-h3 text-neutral-900 pr-8">
            {program.program_name}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap gap-2 mt-2">
              {program.is_online_available && (
                <Badge variant="default" className="bg-blue-100 text-blue-700">
                  온라인
                </Badge>
              )}
              {program.is_free ? (
                <Badge variant="default" className="bg-green-100 text-green-700">
                  무료
                </Badge>
              ) : (
                <Badge variant="default" className="bg-orange-100 text-orange-700">
                  유료
                </Badge>
              )}
              <Badge variant="secondary">{program.program_type}</Badge>
              <Badge variant="secondary">{program.target_group}</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 프로그램 소개 */}
          <section>
            <h4 className="text-h4 text-neutral-800 mb-3">프로그램 소개</h4>
            {program.description ? (
              <p className="text-body text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {program.description}
              </p>
            ) : (
              <p className="text-body text-neutral-500">
                상세 소개가 등록되지 않았습니다.
              </p>
            )}
          </section>

          <Separator />

          {/* 상세 정보 */}
          <section>
            <h4 className="text-h4 text-neutral-800 mb-3">상세 정보</h4>
            <dl className="space-y-2">
              <div className="flex">
                <dt className="text-body-sm font-medium text-neutral-600 w-24">
                  유형
                </dt>
                <dd className="text-body-sm text-neutral-900">
                  {program.program_type}
                </dd>
              </div>
              <div className="flex">
                <dt className="text-body-sm font-medium text-neutral-600 w-24">
                  대상
                </dt>
                <dd className="text-body-sm text-neutral-900">
                  {program.target_group}
                </dd>
              </div>
              {program.capacity && (
                <div className="flex">
                  <dt className="text-body-sm font-medium text-neutral-600 w-24">
                    정원
                  </dt>
                  <dd className="text-body-sm text-neutral-900">
                    {program.capacity}명
                  </dd>
                </div>
              )}
              {program.duration_minutes && (
                <div className="flex">
                  <dt className="text-body-sm font-medium text-neutral-600 w-24">
                    시간
                  </dt>
                  <dd className="text-body-sm text-neutral-900">
                    {program.duration_minutes}분
                  </dd>
                </div>
              )}
              <div className="flex">
                <dt className="text-body-sm font-medium text-neutral-600 w-24">
                  비용
                </dt>
                <dd className="text-body-sm text-neutral-900">
                  {program.is_free
                    ? '무료'
                    : program.fee_amount
                    ? `${program.fee_amount.toLocaleString('ko-KR')}원`
                    : '문의 필요'}
                </dd>
              </div>
            </dl>
          </section>

          <Separator />

          {/* 신청 안내 */}
          <section>
            <h4 className="text-h4 text-neutral-800 mb-3">신청 안내</h4>
            <p className="text-body-sm text-neutral-600 bg-lavender-50 p-4 rounded-lg">
              이 프로그램 신청은 센터에 직접 문의해 주세요.
            </p>
          </section>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
