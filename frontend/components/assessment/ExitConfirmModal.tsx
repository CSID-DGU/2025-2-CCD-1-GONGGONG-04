/**
 * ExitConfirmModal Component
 * 진단 중단 확인 모달
 *
 * Sprint 3 - Task 3.2.3
 *
 * @description
 * 사용자가 자가진단을 중단하려 할 때 표시되는 확인 모달
 * - shadcn Dialog 컴포넌트 사용
 * - ESC 키로 닫기 지원
 * - 진행 중인 내용 저장 안 됨 경고
 * - "계속 진단하기" / "나가기" 버튼
 */

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ============================================
// Props 인터페이스
// ============================================

export interface ExitConfirmModalProps {
  /** 모달 열림 상태 */
  open: boolean;

  /** 모달 닫기 핸들러 */
  onClose: () => void;

  /** 진단 중단 확인 핸들러 */
  onConfirmExit: () => void;
}

// ============================================
// ExitConfirmModal Component
// ============================================

/**
 * 진단 중단 확인 모달
 *
 * @example
 * ```tsx
 * <ExitConfirmModal
 *   open={isExitModalOpen}
 *   onClose={() => setIsExitModalOpen(false)}
 *   onConfirmExit={() => router.push('/')}
 * />
 * ```
 */
export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  open,
  onClose,
  onConfirmExit,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-h3 text-gray-900">
            진단을 중단하시겠습니까?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-body text-gray-600 mt-2">
            진행 중인 내용은 저장되지 않습니다.
            <br />
            처음부터 다시 시작해야 합니다.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          {/* 계속 진단하기 버튼 (Primary) */}
          <AlertDialogCancel
            onClick={onClose}
            className="bg-lavender-500 hover:bg-lavender-600 text-white border-none"
          >
            계속 진단하기
          </AlertDialogCancel>

          {/* 나가기 버튼 (Secondary) */}
          <AlertDialogAction
            onClick={onConfirmExit}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900"
          >
            나가기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

ExitConfirmModal.displayName = 'ExitConfirmModal';

export default ExitConfirmModal;
