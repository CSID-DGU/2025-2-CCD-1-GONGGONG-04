'use client';

/**
 * Center Programs Section
 * 센터 프로그램 정보 섹션 - Client Component
 */

import { useState } from 'react';
import { useCenterPrograms } from '@/hooks';
import { ProgramList, ProgramDetailModal } from '@/components/center';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Presentation } from 'lucide-react';
import type { Program } from '@/types/center';

interface CenterProgramsSectionProps {
  centerId: number;
}

export function CenterProgramsSection({ centerId }: CenterProgramsSectionProps) {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: programData, isLoading, error } = useCenterPrograms(centerId);

  // 프로그램 클릭 핸들러
  const handleProgramClick = (program: Program) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleModalClose = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      // 모달이 닫힐 때 약간의 지연 후 선택된 프로그램 초기화 (애니메이션 고려)
      setTimeout(() => setSelectedProgram(null), 200);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-h3 flex items-center gap-2">
            <Presentation className="w-5 h-5" aria-hidden="true" />
            프로그램 안내
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-neutral-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return null; // 에러 발생 시 섹션 숨김
  }

  // 데이터 없음
  if (!programData) {
    return null;
  }

  return (
    <section>
      <h2 className="text-h2 mb-4">프로그램 안내</h2>
      <ProgramList
        programs={programData.programs}
        hasData={programData.has_data}
        onProgramClick={handleProgramClick}
      />

      {/* 프로그램 상세 모달 */}
      <ProgramDetailModal
        program={selectedProgram}
        open={isModalOpen}
        onOpenChange={handleModalClose}
      />
    </section>
  );
}
