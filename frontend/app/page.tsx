/**
 * 홈 페이지
 *
 * 마음이음 서비스의 메인 랜딩 페이지
 * - 서비스 소개
 * - 주요 기능으로 빠르게 이동할 수 있는 네비게이션
 *
 * @route /
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { Map, List, Heart, ClipboardList } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

/**
 * 페이지 메타데이터
 */
export const metadata: Metadata = {
  title: '마음이음 - 정신건강복지센터 통합 검색',
  description:
    '전국 정신건강복지센터를 쉽고 빠르게 찾아보세요. 실시간 운영 상태와 맞춤형 추천으로 필요한 정신건강 서비스에 연결됩니다.',
  keywords: [
    '정신건강',
    '상담센터',
    '정신건강복지센터',
    '심리상담',
    '마음건강',
    '정신건강증진센터',
  ],
  openGraph: {
    title: '마음이음 - 정신건강복지센터 통합 검색',
    description: '전국 정신건강복지센터를 쉽고 빠르게 찾아보세요',
    type: 'website',
  },
};

/**
 * 주요 기능 카드 데이터
 */
const MAIN_FEATURES = [
  {
    title: '지도 검색',
    description: '내 주변 센터를 지도에서 찾아보세요',
    href: '/map',
    icon: Map,
    color: 'bg-gradient-to-br from-lavender-400 to-lavender-600',
  },
  {
    title: '센터 목록',
    description: '전국 센터를 목록으로 확인하세요',
    href: '/centers',
    icon: List,
    color: 'bg-gradient-to-br from-blue-400 to-blue-600',
  },
  {
    title: '맞춤 추천',
    description: '나에게 맞는 센터를 추천받으세요',
    href: '/recommendations',
    icon: Heart,
    color: 'bg-gradient-to-br from-pink-400 to-pink-600',
  },
  {
    title: '자가진단',
    description: '정신건강 상태를 체크해보세요',
    href: '/assessment',
    icon: ClipboardList,
    color: 'bg-gradient-to-br from-green-400 to-green-600',
  },
] as const;

/**
 * 홈 페이지 (서버 컴포넌트)
 */
export default function HomePage() {
  return (
    <MainLayout title="" showBackButton={false}>
      <div className="flex flex-col items-center justify-start min-h-[calc(100vh-64px-env(safe-area-inset-bottom,0px))] px-4 py-8 bg-gradient-to-b from-lavender-50 to-white">
        {/* 헤더 섹션 */}
        <div className="w-full max-w-2xl text-center mb-12 mt-8">
          {/* 로고/아이콘 */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-lavender-100 flex items-center justify-center shadow-lg">
              <Heart className="w-10 h-10 text-lavender-600" strokeWidth={2.5} fill="currentColor" />
            </div>
          </div>

          {/* 서비스명 */}
          <h1 className="text-h1 font-bold text-neutral-900 mb-4">
            마음이음
          </h1>

          {/* 서비스 설명 */}
          <p className="text-body text-neutral-600 leading-relaxed mb-2">
            전국 정신건강복지센터를 한곳에서
          </p>
          <p className="text-small text-neutral-500">
            실시간 운영 상태 확인부터 맞춤형 추천까지,
            <br />
            필요한 정신건강 서비스에 쉽게 연결됩니다
          </p>
        </div>

        {/* 주요 기능 그리드 */}
        <div className="w-full max-w-2xl">
          <h2 className="text-h3 font-semibold text-neutral-900 mb-6 px-2">
            주요 기능
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {MAIN_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* 배경 그라디언트 */}
                  <div className={`${feature.color} p-6 h-40 flex flex-col items-start justify-between`}>
                    {/* 아이콘 */}
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </div>

                    {/* 텍스트 */}
                    <div>
                      <h3 className="text-h3 font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-small text-white/90 leading-snug">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* 호버 효과 */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="w-full max-w-2xl mt-8 p-6 bg-white rounded-xl shadow-sm border border-neutral-200">
          <h3 className="text-h3 font-semibold text-neutral-900 mb-4">
            이용 안내
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-lavender-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-caption font-bold text-lavender-600">1</span>
              </div>
              <div>
                <p className="text-body font-medium text-neutral-900 mb-1">
                  센터 찾기
                </p>
                <p className="text-small text-neutral-600">
                  지도나 목록에서 가까운 정신건강복지센터를 찾아보세요
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-lavender-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-caption font-bold text-lavender-600">2</span>
              </div>
              <div>
                <p className="text-body font-medium text-neutral-900 mb-1">
                  자가진단
                </p>
                <p className="text-small text-neutral-600">
                  간단한 설문으로 정신건강 상태를 체크하고 맞춤 추천을 받아보세요
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-lavender-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-caption font-bold text-lavender-600">3</span>
              </div>
              <div>
                <p className="text-body font-medium text-neutral-900 mb-1">
                  센터 연락
                </p>
                <p className="text-small text-neutral-600">
                  실시간 운영 상태를 확인하고 바로 전화나 방문 예약을 할 수 있어요
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* 긴급 연락처 섹션 */}
        <div className="w-full max-w-2xl mt-6 p-5 bg-status-emergency/10 rounded-xl border-2 border-status-emergency/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-status-emergency flex items-center justify-center flex-shrink-0">
              <span className="text-h3 font-bold text-white">!</span>
            </div>
            <div>
              <h4 className="text-body font-semibold text-neutral-900 mb-2">
                위기 상황이신가요?
              </h4>
              <p className="text-small text-neutral-700 mb-3">
                즉시 전문가의 도움을 받으실 수 있습니다
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="tel:1577-0199"
                  className="inline-flex items-center gap-2 text-body font-semibold text-status-emergency hover:text-status-emergency/80 transition-colors"
                >
                  <span>📞</span>
                  <span>정신건강 위기상담 1577-0199</span>
                </a>
                <a
                  href="tel:1393"
                  className="inline-flex items-center gap-2 text-body font-semibold text-status-emergency hover:text-status-emergency/80 transition-colors"
                >
                  <span>📞</span>
                  <span>자살예방 상담전화 1393</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
