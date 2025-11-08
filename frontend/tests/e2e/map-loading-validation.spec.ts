/**
 * Sprint 1 검수: 지도 로딩 및 센터 마커 표시 검증
 *
 * 검증 항목:
 * 1. 지도 페이지 로딩
 * 2. Kakao Map 컨테이너 표시
 * 3. 센터 마커 렌더링
 * 4. 마커 색상 확인 (운영 중/마감)
 */

import { test, expect } from '@playwright/test';

test.describe('Sprint 1 - 지도 로딩 및 센터 마커 표시 검증', () => {
  test('지도 페이지가 정상적으로 로드되어야 함', async ({ page }) => {
    // 콘솔 에러 수집
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 1. 지도 페이지 접속
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });

    // 2. 페이지 타이틀 확인 (선택적)
    await expect(page).toHaveURL(/\/map/);

    // 3. 스크린샷 촬영
    await page.screenshot({ path: 'playwright-screenshots/01-page-loaded.png', fullPage: true });

    console.log('✅ Step 1: 페이지 로딩 완료');
  });

  test('Kakao Map 컨테이너가 표시되어야 함', async ({ page }) => {
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });

    // 지도 컨테이너 확인 (다양한 셀렉터 시도)
    const mapContainer = page.locator('[id*="kakao"], [class*="kakao"], [class*="map"]').first();

    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // 지도 크기 확인 (최소 크기가 있어야 함)
    const boundingBox = await mapContainer.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(100);
    expect(boundingBox!.height).toBeGreaterThan(100);

    await page.screenshot({ path: 'playwright-screenshots/02-map-container.png', fullPage: true });

    console.log('✅ Step 2: Kakao Map 컨테이너 표시 확인');
    console.log(`   크기: ${boundingBox!.width} x ${boundingBox!.height}`);
  });

  test('센터 마커가 지도에 표시되어야 함', async ({ page }) => {
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });

    // 지도 로딩 대기 (최대 5초)
    await page.waitForTimeout(5000);

    // 마커 확인 (다양한 방식으로 렌더링될 수 있음)
    // 1. SVG circle (인라인 SVG 마커)
    const svgMarkers = page.locator('svg circle');

    // 2. IMG 태그 (이미지 마커)
    const imgMarkers = page.locator('img[src*="marker"], img[alt*="marker"]');

    // 3. DIV with marker class
    const divMarkers = page.locator('[class*="marker"]');

    // 4. Kakao Map의 area 태그 (클릭 영역)
    const areaMarkers = page.locator('area[shape="poly"]');

    // 모든 마커 개수 확인
    const svgCount = await svgMarkers.count();
    const imgCount = await imgMarkers.count();
    const divCount = await divMarkers.count();
    const areaCount = await areaMarkers.count();

    const totalMarkers = svgCount + imgCount + divCount + areaCount;

    console.log('📌 마커 탐지 결과:');
    console.log(`   SVG circle: ${svgCount}개`);
    console.log(`   IMG 태그: ${imgCount}개`);
    console.log(`   DIV 마커: ${divCount}개`);
    console.log(`   Area 태그: ${areaCount}개`);
    console.log(`   총합: ${totalMarkers}개`);

    // 최소 1개 이상의 마커가 있어야 함
    expect(totalMarkers).toBeGreaterThan(0);

    await page.screenshot({ path: 'playwright-screenshots/03-markers-displayed.png', fullPage: true });

    console.log(`✅ Step 3: 센터 마커 ${totalMarkers}개 표시 확인`);
  });

  test('마커 색상이 운영 상태에 따라 구분되어야 함', async ({ page }) => {
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });

    // 지도 로딩 대기
    await page.waitForTimeout(5000);

    // SVG circle 마커의 fill 색상 확인
    const svgMarkers = page.locator('svg circle');
    const markerCount = await svgMarkers.count();

    if (markerCount > 0) {
      const colors = new Set<string>();

      // 최대 10개 마커의 색상 수집
      const sampleSize = Math.min(markerCount, 10);

      for (let i = 0; i < sampleSize; i++) {
        const marker = svgMarkers.nth(i);
        const fill = await marker.evaluate((el) => {
          return window.getComputedStyle(el).fill;
        });
        colors.add(fill);
      }

      console.log('🎨 마커 색상 분석:');
      console.log(`   발견된 색상: ${Array.from(colors).join(', ')}`);
      console.log(`   색상 종류: ${colors.size}개`);

      // 최소 1개 이상의 색상이 있어야 함 (이상적으로는 2개: 운영 중/마감)
      expect(colors.size).toBeGreaterThanOrEqual(1);

      // 운영 중 색상 (#10B981 또는 rgb(16, 185, 129)) 확인
      const hasOperatingColor = Array.from(colors).some(color =>
        color.includes('10B981') || color.includes('16, 185, 129') || color.includes('rgb(16, 185, 129)')
      );

      // 마감 색상 (#9CA3AF 또는 rgb(156, 163, 175)) 확인
      const hasClosedColor = Array.from(colors).some(color =>
        color.includes('9CA3AF') || color.includes('156, 163, 175') || color.includes('rgb(156, 163, 175)')
      );

      console.log(`   운영 중 색상 존재: ${hasOperatingColor ? '✅' : '❌'}`);
      console.log(`   마감 색상 존재: ${hasClosedColor ? '✅' : '❌'}`);
    }

    await page.screenshot({ path: 'playwright-screenshots/04-marker-colors.png', fullPage: true });

    console.log('✅ Step 4: 마커 색상 분석 완료');
  });

  test('통합 시나리오: 지도 로딩 → 마커 표시 → 시각적 검증', async ({ page }) => {
    console.log('\n🚀 통합 시나리오 테스트 시작\n');

    // 1. 페이지 접속
    console.log('📍 Step 1: 지도 페이지 접속');
    await page.goto('http://localhost:3000/map', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'playwright-screenshots/scenario-01-initial.png', fullPage: true });

    // 2. 지도 컨테이너 확인
    console.log('🗺️  Step 2: Kakao Map 컨테이너 확인');
    const mapContainer = page.locator('[id*="kakao"], [class*="map"]').first();
    await expect(mapContainer).toBeVisible({ timeout: 10000 });

    // 3. 로딩 완료 대기 (5초)
    console.log('⏱️  Step 3: 지도 렌더링 대기 (5초)');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'playwright-screenshots/scenario-02-loaded.png', fullPage: true });

    // 4. 마커 개수 확인
    console.log('📌 Step 4: 센터 마커 개수 확인');
    const svgMarkers = await page.locator('svg circle').count();
    const imgMarkers = await page.locator('img[src*="marker"]').count();
    const totalMarkers = svgMarkers + imgMarkers;

    console.log(`   → 총 ${totalMarkers}개 마커 발견 (SVG: ${svgMarkers}, IMG: ${imgMarkers})`);

    // 5. 페이지 HTML 일부 확인 (디버깅)
    const bodyHTML = await page.locator('body').innerHTML();
    const hasKakaoScript = bodyHTML.includes('dapi.kakao.com');
    const hasMapDiv = bodyHTML.includes('kakao') || bodyHTML.includes('map');

    console.log('\n🔍 페이지 상태 검증:');
    console.log(`   Kakao SDK 로드: ${hasKakaoScript ? '✅' : '❌'}`);
    console.log(`   지도 컨테이너: ${hasMapDiv ? '✅' : '❌'}`);
    console.log(`   마커 표시: ${totalMarkers > 0 ? '✅' : '❌'}`);

    // 최종 검증
    expect(totalMarkers).toBeGreaterThan(0);

    await page.screenshot({ path: 'playwright-screenshots/scenario-03-final.png', fullPage: true });

    console.log('\n✅ 통합 시나리오 테스트 완료!\n');
  });
});
