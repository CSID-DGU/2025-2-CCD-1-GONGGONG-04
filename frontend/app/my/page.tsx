import { Metadata } from 'next';
import Link from 'next/link';
import { User, Heart, ClipboardList, Settings, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: '마이페이지 | 마음이음',
  description: '즐겨찾기, 자가진단 기록, 설정을 관리하세요',
};

export default function MyPage() {
  return (
    <div className="container mx-auto px-4 py-6 pb-24">
      {/* 사용자 프로필 섹션 */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-lavender-100 flex items-center justify-center">
            <User className="w-8 h-8 text-lavender-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-h3 font-semibold text-neutral-900 mb-1">
              안녕하세요!
            </h2>
            <p className="text-body text-neutral-600">
              마음이음에 오신 것을 환영합니다
            </p>
          </div>
        </div>
      </section>

      {/* 메뉴 섹션 */}
      <section className="space-y-3">
        {/* 즐겨찾기 */}
        <Link
          href="/my/favorites"
          className="block bg-white rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-body font-semibold text-neutral-900">
                  즐겨찾기
                </h3>
                <p className="text-caption text-neutral-500">
                  저장한 센터 목록
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </div>
        </Link>

        {/* 자가진단 기록 */}
        <Link
          href="/my/assessments"
          className="block bg-white rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-body font-semibold text-neutral-900">
                  자가진단 기록
                </h3>
                <p className="text-caption text-neutral-500">
                  내 진단 결과 및 추천 내역
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </div>
        </Link>

        {/* 설정 */}
        <Link
          href="/my/settings"
          className="block bg-white rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-neutral-600" />
              </div>
              <div>
                <h3 className="text-body font-semibold text-neutral-900">
                  설정
                </h3>
                <p className="text-caption text-neutral-500">
                  알림, 개인정보 관리
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </div>
        </Link>
      </section>

      {/* 안내 메시지 */}
      <div className="mt-8 bg-lavender-50 rounded-xl p-4 border border-lavender-100">
        <p className="text-small text-lavender-700">
          💡 더 많은 기능이 곧 추가될 예정입니다!
        </p>
      </div>
    </div>
  );
}
